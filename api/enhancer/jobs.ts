import { isAuthConfigured, verifySessionFromRequest } from '../_lib/auth.js'
import { errorResponse, getClientIp, jsonResponse, parseJsonBody } from '../_lib/http.js'
import { checkRateLimit } from '../_lib/rateLimit.js'
import { getMissingS3Config, isS3Configured, verifyUploadedObject } from '../_lib/s3.js'
import { validateCreateJobPayload } from '../_lib/validation.js'

function getWorkerConfig() {
  const url = process.env.ENHANCER_WORKER_URL?.trim() || ''
  const secret = process.env.ENHANCER_WORKER_SECRET?.trim() || ''
  const missing: string[] = []
  if (!url) missing.push('ENHANCER_WORKER_URL')
  if (!secret) missing.push('ENHANCER_WORKER_SECRET')
  return { url: url.replace(/\/+$/, ''), secret, missing }
}

export async function GET(request: Request): Promise<Response> {
  const session = verifySessionFromRequest(request)
  if (!session.ok) {
    return errorResponse(session.error, session.code, session.code === 'AUTH_NOT_CONFIGURED' ? 503 : 401)
  }

  const worker = getWorkerConfig()
  if (worker.missing.length > 0) {
    return errorResponse(
      'Video processing worker is not configured.',
      'WORKER_NOT_CONFIGURED',
      503,
      { missingConfig: worker.missing }
    )
  }

  try {
    const res = await fetch(
      `${worker.url}/jobs?ownerId=${encodeURIComponent(session.userId)}`,
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

export async function POST(request: Request): Promise<Response> {
  const ip = getClientIp(request)
  const rl = await checkRateLimit(`jobs:create:${ip}`, 10, 600)
  if (!rl.allowed) {
    return errorResponse(
      'Job creation rate limit exceeded. Please wait before submitting another video.',
      'RATE_LIMITED',
      429,
      undefined,
      { 'Retry-After': String(Math.max(1, rl.resetAtSeconds - Math.floor(Date.now() / 1000))) }
    )
  }

  const worker = getWorkerConfig()
  if (!isAuthConfigured() || !isS3Configured() || worker.missing.length > 0) {
    const missingConfig = [
      ...(isAuthConfigured() ? [] : ['SESSION_SECRET']),
      ...getMissingS3Config(),
      ...worker.missing,
    ]
    return errorResponse(
      'Video enhancement worker or object storage credentials are not configured. Configure environment variables before creating jobs.',
      'INFRASTRUCTURE_NOT_CONFIGURED',
      503,
      { missingConfig }
    )
  }

  const session = verifySessionFromRequest(request)
  if (!session.ok) {
    return errorResponse(session.error, session.code, session.code === 'AUTH_NOT_CONFIGURED' ? 503 : 401)
  }

  const parsed = await parseJsonBody<Record<string, unknown>>(request, 16_384)
  if (!parsed.ok) return parsed.response

  const validated = validateCreateJobPayload(parsed.data, session.userId)
  if (!validated.ok) {
    return errorResponse(validated.error, 'VALIDATION_ERROR', 400)
  }

  // Confirm uploaded object exists in S3 before dispatching a processing job
  const objectCheck = await verifyUploadedObject(validated.value.objectKey)
  if (!objectCheck.exists) {
    return errorResponse(
      'Uploaded video object was not found in storage. Please upload the video again.',
      'UPLOAD_NOT_FOUND',
      400
    )
  }

  try {
    const res = await fetch(`${worker.url}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${worker.secret}`,
      },
      body: JSON.stringify({
        ...validated.value,
        ownerId: session.userId,
      }),
    })

    const data = await res.json().catch(() => ({ error: 'Invalid worker response.' }))
    return jsonResponse(data, res.status)
  } catch {
    return errorResponse(
      'Could not connect to the external video processing worker.',
      'WORKER_UNREACHABLE',
      503
    )
  }
}
