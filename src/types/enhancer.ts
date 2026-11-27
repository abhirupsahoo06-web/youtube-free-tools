export type OutputResolution = 'original' | '720p' | '1080p' | '1440p' | '4k'

export type EnhancementMode = 'standard' | 'ai'

export type OutputCodec = 'h264' | 'h265'

export type EncodingPreset = 'fast' | 'medium' | 'slow'

export type QualityTier = 'balanced' | 'high' | 'ultra'

export type AiStrength = 'subtle' | 'balanced' | 'strong'

export type DenoiseLevel = 'none' | 'low' | 'medium'

export type JobStatus =
  | 'queued'
  | 'downloading'
  | 'processing'
  | 'uploading'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface EnhancerCapabilities {
  ready: boolean
  authConfigured: boolean
  storageConfigured: boolean
  workerConfigured: boolean
  ffmpegAvailable: boolean
  aiEnhancementAvailable: boolean
  aiProvider: string | null
  supportedCodecs: OutputCodec[]
  missingConfig: string[]
  limits: {
    maxFileSizeBytes: number
    maxDurationSeconds: number
    supportedInputFormats: string[]
    supportedInputMimeTypes: string[]
    retentionMinutes: number
  }
}

export interface CreateEnhancementJobPayload {
  objectKey: string
  filename: string
  sourceWidth: number
  sourceHeight: number
  durationSeconds: number
  fileSizeBytes: number
  resolution: OutputResolution
  mode: EnhancementMode
  codec: OutputCodec
  preset: EncodingPreset
  quality: QualityTier
  aiStrength: AiStrength
  denoise: DenoiseLevel
  temporalConsistency: boolean
  preserveAudio: boolean
}

export interface EnhancementJob {
  id: string
  status: JobStatus
  stage: string
  progress: number
  mode: EnhancementMode
  resolution: OutputResolution
  targetWidth: number
  targetHeight: number
  codec: OutputCodec
  estimatedSizeBytes?: number
  outputSizeBytes?: number
  downloadUrl?: string
  expiresAt?: string
  error?: string
  errorCode?: string
  createdAt: string
  updatedAt: string
}
