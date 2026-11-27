import { verifySessionFromRequest } from '../../_lib/auth.js'
import { errorResponse, getClientIp, jsonResponse } from '../../_lib/http.js'
import { checkRateLimit } from '../../_lib/rateLimit.js'

function extractJobId(request: Request): string | null {
  const pathname = new URL(request.url).pathname
  const segment = pathname.split('/').filter(Boolean).pop() || ''
  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(segment)) {
    return null
  }
  return segment
}

function getWorkerConfig() {
  const url = process.env.ENHANCER_WORKER_URL?.trim() || ''
  const secret = process.env.ENHANCER_WORKER_SECRET?.trim() || ''
  return { url: url.replace(/\/+$/, ''), secret, configured: Boolean(url && secret) }
}

export async function GET(request: Request): Promise<Response> {
  const ip = getClientIp(request)
  const rl = await checkRateLimit(`jobs:poll:${ip}`, 180, 60)
  if (!rl.allowed) {
    return errorResponse('Too many status requests.', 'RATE_LIMITED', 429)
  }

  const session = verifySessionFromRequest(request)
  if (!session.ok) {
    return errorResponse(session.error, session.code, session.code === 'AUTH_NOT_CONFIGURED' ? 503 : 401)
  }

  const jobId = extractJobId(request)
  if (!jobId) {
    return errorResponse('Invalid job identifier.', 'INVALID_JOB_ID', 400)
  }

  const worker = getWorkerConfig()
  if (!worker.configured) {
    return errorResponse('Worker service is not configured.', 'WORKER_NOT_CONFIGURED', 503)
  }

  try {
    const res = await fetch(
      `${worker.url}/jobs/${encodeURIComponent(jobId)}?ownerId=${encodeURIComponent(session.userId)}`,
      {
        headers: { Authorization: `Bearer ${worker.secret}` },
      }
    )
    const data = await res.json().catch(() => ({}))
    return jsonResponse(data, res.status)
  } catch {
    return errorResponse('Processing worker service is unreachable.', 'WORKER_UNREACHABLE', 503)
  }
}

export async function DELETE(request: Request): Promise<Response> {
  const session = verifySessionFromRequest(request)
  if (!session.ok) {
    return errorResponse(session.error, session.code, session.code === 'AUTH_NOT_CONFIGURED' ? 503 : 401)
  }

  const jobId = extractJobId(request)
  if (!jobId) {
    return errorResponse('Invalid job identifier.', 'INVALID_JOB_ID', 400)
  }

  const worker = getWorkerConfig()
  if (!worker.configured) {
    return errorResponse('Worker service is not configured.', 'WORKER_NOT_CONFIGURED', 503)
  }

  try {
    const res = await fetch(
      `${worker.url}/jobs/${encodeURIComponent(jobId)}?ownerId=${encodeURIComponent(session.userId)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${worker.secret}` },
      }
    )
    const data = await res.json().catch(() => ({}))
    return jsonResponse(data, res.status)
  } catch {
    return errorResponse('Processing worker service is unreachable.', 'WORKER_UNREACHABLE', 503)
  }
}

export async function POST(request: Request): Promise<Response> {
  const session = verifySessionFromRequest(request)
  if (!session.ok) {
    return errorResponse(session.error, session.code, session.code === 'AUTH_NOT_CONFIGURED' ? 503 : 401)
  }

  const jobId = extractJobId(request)
  if (!jobId) {
    return errorResponse('Invalid job identifier.', 'INVALID_JOB_ID', 400)
  }

  const worker = getWorkerConfig()
  if (!worker.configured) {
    return errorResponse('Worker service is not configured.', 'WORKER_NOT_CONFIGURED', 503)
  }

  try {
    const res = await fetch(
      `${worker.url}/jobs/${encodeURIComponent(jobId)}/retry?ownerId=${encodeURIComponent(session.userId)}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${worker.secret}` },
      }
    )
    const data = await res.json().catch(() => ({}))
    return jsonResponse(data, res.status)
  } catch {
    return errorResponse('Processing worker service is unreachable.', 'WORKER_UNREACHABLE', 503)
  }
}
