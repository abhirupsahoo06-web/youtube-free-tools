import type {
  AiStrength,
  CreateEnhancementJobPayload,
  DenoiseLevel,
  EncodingPreset,
  EnhancementMode,
  OutputCodec,
  OutputResolution,
  QualityTier,
} from '../../src/types/enhancer.js'

export const SUPPORTED_INPUT_EXTENSIONS = ['.mp4', '.mov', '.mkv', '.webm'] as const
export const SUPPORTED_INPUT_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-matroska',
  'video/matroska',
  'video/webm',
] as const

const VALID_RESOLUTIONS: readonly OutputResolution[] = ['original', '720p', '1080p', '1440p', '4k']
const VALID_MODES: readonly EnhancementMode[] = ['standard', 'ai']
const VALID_CODECS: readonly OutputCodec[] = ['h264', 'h265']
const VALID_PRESETS: readonly EncodingPreset[] = ['fast', 'medium', 'slow']
const VALID_QUALITIES: readonly QualityTier[] = ['balanced', 'high', 'ultra']
const VALID_STRENGTHS: readonly AiStrength[] = ['subtle', 'balanced', 'strong']
const VALID_DENOISE: readonly DenoiseLevel[] = ['none', 'low', 'medium']

export function getServerLimits() {
  const maxUploadMb = Math.min(2048, Math.max(10, Number(process.env.MAX_UPLOAD_MB) || 500))
  const maxDurationSeconds = Math.min(3600, Math.max(10, Number(process.env.MAX_DURATION_SECONDS) || 600))
  const retentionMinutes = Math.min(1440, Math.max(5, Number(process.env.TEMP_RETENTION_MINUTES) || 60))

  return {
    maxFileSizeBytes: maxUploadMb * 1024 * 1024,
    maxDurationSeconds,
    retentionMinutes,
    supportedInputFormats: ['MP4', 'MOV', 'MKV', 'WebM'],
    supportedInputMimeTypes: [...SUPPORTED_INPUT_MIME_TYPES],
  }
}

export function sanitizeFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop() || 'video.mp4'
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.{2,}/g, '.')
  return cleaned.slice(0, 120) || 'video.mp4'
}

export function isSupportedVideoUpload(filename: string, mimeType: string): boolean {
  const lowerName = filename.toLowerCase()
  const hasValidExt = SUPPORTED_INPUT_EXTENSIONS.some((ext) => lowerName.endsWith(ext))
  const normalizedMime = mimeType.split(';')[0]?.trim().toLowerCase() || ''
  const hasValidMime =
    normalizedMime === '' ||
    SUPPORTED_INPUT_MIME_TYPES.includes(normalizedMime as (typeof SUPPORTED_INPUT_MIME_TYPES)[number])
  return hasValidExt && hasValidMime
}

export function validateObjectKeyOwnership(objectKey: string, userId: string): boolean {
  const expectedPrefix = `uploads/${userId}/`
  if (!objectKey.startsWith(expectedPrefix)) return false
  if (objectKey.includes('..') || objectKey.includes('\\') || objectKey.length > 300) return false
  return /^uploads\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9._-]+$/.test(objectKey)
}

export function validateCreateJobPayload(
  raw: Record<string, unknown>,
  userId: string
): { ok: true; value: CreateEnhancementJobPayload } | { ok: false; error: string } {
  const limits = getServerLimits()

  if (typeof raw.objectKey !== 'string' || !validateObjectKeyOwnership(raw.objectKey, userId)) {
    return { ok: false, error: 'Invalid or unauthorized storage object key.' }
  }
  if (typeof raw.filename !== 'string' || raw.filename.trim().length === 0) {
    return { ok: false, error: 'Filename is required.' }
  }

  const sourceWidth = Number(raw.sourceWidth)
  const sourceHeight = Number(raw.sourceHeight)
  const durationSeconds = Number(raw.durationSeconds)
  const fileSizeBytes = Number(raw.fileSizeBytes)

  if (!Number.isFinite(sourceWidth) || sourceWidth < 16 || sourceWidth > 7680) {
    return { ok: false, error: 'Source width must be between 16 and 7680 pixels.' }
  }
  if (!Number.isFinite(sourceHeight) || sourceHeight < 16 || sourceHeight > 4320) {
    return { ok: false, error: 'Source height must be between 16 and 4320 pixels.' }
  }
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > limits.maxDurationSeconds) {
    return {
      ok: false,
      error: `Video duration must be between 1s and ${limits.maxDurationSeconds}s.`,
    }
  }
  if (!Number.isFinite(fileSizeBytes) || fileSizeBytes <= 0 || fileSizeBytes > limits.maxFileSizeBytes) {
    return {
      ok: false,
      error: `File size exceeds limit of ${Math.round(limits.maxFileSizeBytes / (1024 * 1024))} MB.`,
    }
  }

  const resolution = raw.resolution as OutputResolution
  const mode = raw.mode as EnhancementMode
  const codec = raw.codec as OutputCodec
  const preset = raw.preset as EncodingPreset
  const quality = raw.quality as QualityTier
  const aiStrength = (raw.aiStrength ?? 'balanced') as AiStrength
  const denoise = (raw.denoise ?? 'low') as DenoiseLevel

  if (!VALID_RESOLUTIONS.includes(resolution)) {
    return { ok: false, error: 'Unsupported output resolution.' }
  }
  if (!VALID_MODES.includes(mode)) {
    return { ok: false, error: 'Unsupported enhancement mode.' }
  }
  if (!VALID_CODECS.includes(codec)) {
    return { ok: false, error: 'Unsupported output codec.' }
  }
  if (!VALID_PRESETS.includes(preset)) {
    return { ok: false, error: 'Unsupported encoding preset.' }
  }
  if (!VALID_QUALITIES.includes(quality)) {
    return { ok: false, error: 'Unsupported quality tier.' }
  }
  if (!VALID_STRENGTHS.includes(aiStrength)) {
    return { ok: false, error: 'Unsupported AI enhancement strength.' }
  }
  if (!VALID_DENOISE.includes(denoise)) {
    return { ok: false, error: 'Unsupported denoise setting.' }
  }

  return {
    ok: true,
    value: {
      objectKey: raw.objectKey,
      filename: sanitizeFilename(raw.filename),
      sourceWidth: Math.round(sourceWidth),
      sourceHeight: Math.round(sourceHeight),
      durationSeconds,
      fileSizeBytes: Math.round(fileSizeBytes),
      resolution,
      mode,
      codec,
      preset,
      quality,
      aiStrength,
      denoise,
      temporalConsistency: Boolean(raw.temporalConsistency),
      preserveAudio: raw.preserveAudio !== false,
    },
  }
}
