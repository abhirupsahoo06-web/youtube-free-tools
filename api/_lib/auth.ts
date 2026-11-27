import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'

const COOKIE_NAME = 'ytt_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 // 24 hours

interface SessionPayload {
  userId: string
  iat: number
  exp: number
}

function getSessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET?.trim()
  if (!secret || secret.length < 16) return null
  return secret
}

export function isAuthConfigured(): boolean {
  return getSessionSecret() !== null
}

function signPayload(encodedPayload: string, secret: string): string {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url')
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {}
  const result: Record<string, string> = {}
  for (const part of cookieHeader.split(';')) {
    const eqIndex = part.indexOf('=')
    if (eqIndex <= 0) continue
    const key = part.slice(0, eqIndex).trim()
    const val = part.slice(eqIndex + 1).trim()
    result[key] = decodeURIComponent(val)
  }
  return result
}

export function verifySessionToken(token: string): SessionPayload | null {
  const secret = getSessionSecret()
  if (!secret) return null

  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [encodedPayload, providedSig] = parts
  if (!encodedPayload || !providedSig) return null

  const expectedSig = signPayload(encodedPayload, secret)
  const a = Buffer.from(providedSig)
  const b = Buffer.from(expectedSig)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return null
  }

  try {
    const raw = Buffer.from(encodedPayload, 'base64url').toString('utf8')
    const parsed = JSON.parse(raw) as SessionPayload
    if (
      !parsed ||
      typeof parsed.userId !== 'string' ||
      !/^[a-zA-Z0-9_-]{8,64}$/.test(parsed.userId) ||
      typeof parsed.exp !== 'number' ||
      Date.now() > parsed.exp * 1000
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function verifySessionFromRequest(request: Request): {
  ok: true
  userId: string
} | {
  ok: false
  code: 'AUTH_NOT_CONFIGURED' | 'UNAUTHORIZED'
  error: string
} {
  if (!isAuthConfigured()) {
    return {
      ok: false,
      code: 'AUTH_NOT_CONFIGURED',
      error: 'SESSION_SECRET is missing or shorter than 16 characters.',
    }
  }

  const cookies = parseCookies(request.headers.get('cookie'))
  const token = cookies[COOKIE_NAME]
  if (!token) {
    return {
      ok: false,
      code: 'UNAUTHORIZED',
      error: 'Active session required. Please refresh or initialize session.',
    }
  }

  const payload = verifySessionToken(token)
  if (!payload) {
    return {
      ok: false,
      code: 'UNAUTHORIZED',
      error: 'Session token is invalid or expired.',
    }
  }

  return { ok: true, userId: payload.userId }
}

export function createSessionCookie(
  request: Request
): { userId: string; setCookieHeader: string } | null {
  const secret = getSessionSecret()
  if (!secret) return null

  const existing = verifySessionFromRequest(request)
  const userId = existing.ok ? existing.userId : randomUUID()
  const now = Math.floor(Date.now() / 1000)

  const payload: SessionPayload = {
    userId,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  }

  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const sig = signPayload(encoded, secret)
  const token = `${encoded}.${sig}`

  const reqUrl = new URL(request.url)
  const isHttps =
    reqUrl.protocol === 'https:' ||
    request.headers.get('x-forwarded-proto') === 'https'

  const attrs = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    `Max-Age=${SESSION_TTL_SECONDS}`,
    'HttpOnly',
    'SameSite=Lax',
    ...(isHttps ? ['Secure'] : []),
  ]

  return {
    userId,
    setCookieHeader: attrs.join('; '),
  }
}
