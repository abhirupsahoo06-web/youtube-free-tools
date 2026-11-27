export function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders?: Record<string, string>
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  })
}

export function errorResponse(
  error: string,
  code: string,
  status: number,
  extra?: Record<string, unknown>,
  extraHeaders?: Record<string, string>
): Response {
  return jsonResponse({ error, code, ...extra }, status, extraHeaders)
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

export async function parseJsonBody<T>(
  request: Request,
  maxBytes = 32_768
): Promise<{ ok: true; data: T } | { ok: false; response: Response }> {
  const contentLength = request.headers.get('content-length')
  if (contentLength) {
    const len = Number.parseInt(contentLength, 10)
    if (!Number.isNaN(len) && len > maxBytes) {
      return {
        ok: false,
        response: errorResponse('Request payload too large.', 'PAYLOAD_TOO_LARGE', 413),
      }
    }
  }

  try {
    const text = await request.text()
    if (text.length > maxBytes) {
      return {
        ok: false,
        response: errorResponse('Request payload too large.', 'PAYLOAD_TOO_LARGE', 413),
      }
    }
    const parsed = JSON.parse(text) as T
    if (!parsed || typeof parsed !== 'object') {
      return {
        ok: false,
        response: errorResponse('Invalid JSON object.', 'INVALID_JSON', 400),
      }
    }
    return { ok: true, data: parsed }
  } catch {
    return {
      ok: false,
      response: errorResponse('Malformed JSON body.', 'INVALID_JSON', 400),
    }
  }
}
