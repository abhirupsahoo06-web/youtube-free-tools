import { createSessionCookie, isAuthConfigured, verifySessionFromRequest } from '../_lib/auth.js'
import { errorResponse, jsonResponse } from '../_lib/http.js'

export function GET(request: Request): Response {
  if (!isAuthConfigured()) {
    return errorResponse(
      'Authentication secret is not configured on this server.',
      'AUTH_NOT_CONFIGURED',
      503,
      { missingConfig: ['SESSION_SECRET'] }
    )
  }

  const verified = verifySessionFromRequest(request)
  if (!verified.ok) {
    return jsonResponse({ authenticated: false }, 200)
  }

  return jsonResponse({ authenticated: true, userId: verified.userId }, 200)
}

export function POST(request: Request): Response {
  if (!isAuthConfigured()) {
    return errorResponse(
      'Session authentication requires SESSION_SECRET to be configured in Vercel Environment Variables.',
      'AUTH_NOT_CONFIGURED',
      503,
      { missingConfig: ['SESSION_SECRET'] }
    )
  }

  const session = createSessionCookie(request)
  if (!session) {
    return errorResponse('Could not establish session.', 'SESSION_ERROR', 500)
  }

  return jsonResponse(
    { authenticated: true, userId: session.userId },
    200,
    { 'Set-Cookie': session.setCookieHeader }
  )
}
