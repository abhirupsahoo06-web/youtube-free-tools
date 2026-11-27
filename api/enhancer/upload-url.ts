import { randomUUID } from 'node:crypto'
import { isAuthConfigured, verifySessionFromRequest } from '../_lib/auth.js'
import { errorResponse, getClientIp, jsonResponse, parseJsonBody } from '../_lib/http.js'
import { checkRateLimit } from '../_lib/rateLimit.js'
import { createSignedUploadUrl, getMissingS3Config, isS3Configured } from '../_lib/s3.js'
import { getServerLimits, isSupportedVideoUpload, sanitizeFilename } from '../_lib/validation.js'

interface UploadUrlBody {
  filename?: unknown
  mimeType?: unknown
  fileSizeBytes?: unknown
  durationSeconds?: unknown
}

export async function POST(request: Request): Promise<Response> {
  const ip = getClientIp(request)
  const rl = await checkRateLimit(`upload:${ip}`, 20, 600)
  if (!rl.allowed) {
    return errorResponse(
      'Too many upload requests. Please wait a few minutes and try again.',
      'RATE_LIMITED',
      429,
      undefined,
      { 'Retry-After': String(Math.max(1, rl.resetAtSeconds - Math.floor(Date.now() / 1000))) }
    )
  }

  if (!isAuthConfigured() || !isS3Configured()) {
    const missingConfig = [
      ...(isAuthConfigured() ? [] : ['SESSION_SECRET']),
      ...getMissingS3Config(),
    ]
    return errorResponse(
      'Object storage or session secret is not configured. Configure environment variables before uploading.',
      'INFRASTRUCTURE_NOT_CONFIGURED',
      503,
      { missingConfig }
    )
  }

  const session = verifySessionFromRequest(request)
  if (!session.ok) {
    return errorResponse(session.error, session.code, session.code === 'AUTH_NOT_CONFIGURED' ? 503 : 401)
  }

  const parsed = await parseJsonBody<UploadUrlBody>(request, 8192)
  if (!parsed.ok) return parsed.response

  const rawName = typeof parsed.data.filename === 'string' ? parsed.data.filename : ''
  const mimeType = typeof parsed.data.mimeType === 'string' ? parsed.data.mimeType : ''
  const fileSizeBytes = Number(parsed.data.fileSizeBytes)
  const durationSeconds = Number(parsed.data.durationSeconds)
  const limits = getServerLimits()

  if (!rawName || !isSupportedVideoUpload(rawName, mimeType)) {
    return errorResponse(
      'Unsupported video format. Allowed formats: MP4, MOV, MKV, WebM.',
      'UNSUPPORTED_FORMAT',
      400
    )
  }

  if (!Number.isFinite(fileSizeBytes) || fileSizeBytes <= 0 || fileSizeBytes > limits.maxFileSizeBytes) {
    return errorResponse(
      `File size must be between 1 byte and ${Math.round(limits.maxFileSizeBytes / (1024 * 1024))} MB.`,
      'FILE_TOO_LARGE',
      400
    )
  }

  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > limits.maxDurationSeconds) {
    return errorResponse(
      `Video duration must be between 1 and ${limits.maxDurationSeconds} seconds.`,
      'DURATION_EXCEEDED',
      400
    )
  }

  const cleanName = sanitizeFilename(rawName)
  const jobNonce = randomUUID()
  const objectKey = `uploads/${session.userId}/${jobNonce}/${cleanName}`
  const normalizedContentType = mimeType.split(';')[0]?.trim() || 'video/mp4'

  try {
    const signed = await createSignedUploadUrl({
      objectKey,
      contentType: normalizedContentType,
      contentLength: Math.round(fileSizeBytes),
    })

    return jsonResponse(
      {
        uploadUrl: signed.uploadUrl,
        objectKey,
        expiresInSeconds: signed.expiresInSeconds,
        contentType: normalizedContentType,
      },
      200
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate signed upload URL.'
    return errorResponse(message, 'STORAGE_SIGNING_FAILED', 502)
  }
}
