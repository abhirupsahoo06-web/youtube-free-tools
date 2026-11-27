import type { EnhancerCapabilities, OutputCodec } from '../../src/types/enhancer.js'
import { isAuthConfigured } from '../_lib/auth.js'
import { jsonResponse } from '../_lib/http.js'
import { getMissingS3Config, isS3Configured } from '../_lib/s3.js'
import { getServerLimits } from '../_lib/validation.js'

interface WorkerHealthPayload {
  ok?: boolean
  ffmpegAvailable?: boolean
  aiEnhancementAvailable?: boolean
  aiProvider?: string | null
  supportedCodecs?: OutputCodec[]
}

export async function GET(): Promise<Response> {
  const authConfigured = isAuthConfigured()
  const storageConfigured = isS3Configured()
  const workerUrl = process.env.ENHANCER_WORKER_URL?.trim() || ''
  const workerSecret = process.env.ENHANCER_WORKER_SECRET?.trim() || ''
  const workerConfigured = Boolean(workerUrl && workerSecret)

  const missingConfig: string[] = []
  if (!authConfigured) missingConfig.push('SESSION_SECRET')
  missingConfig.push(...getMissingS3Config())
  if (!workerUrl) missingConfig.push('ENHANCER_WORKER_URL')
  if (!workerSecret) missingConfig.push('ENHANCER_WORKER_SECRET')

  let ffmpegAvailable = false
  let aiEnhancementAvailable = false
  let aiProvider: string | null = null
  let supportedCodecs: OutputCodec[] = ['h264']
  let workerReachable = false

  if (workerConfigured) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 2500)
      const res = await fetch(`${workerUrl.replace(/\/+$/, '')}/health`, {
        headers: {
          Authorization: `Bearer ${workerSecret}`,
        },
        signal: controller.signal,
      })
      clearTimeout(timer)

      if (res.ok) {
        workerReachable = true
        const data = (await res.json()) as WorkerHealthPayload
        ffmpegAvailable = Boolean(data.ffmpegAvailable)
        aiEnhancementAvailable = Boolean(data.aiEnhancementAvailable)
        aiProvider = data.aiProvider ?? null
        if (Array.isArray(data.supportedCodecs) && data.supportedCodecs.length > 0) {
          supportedCodecs = data.supportedCodecs
        }
      }
    } catch {
      workerReachable = false
    }
  }

  const capabilities: EnhancerCapabilities = {
    ready: authConfigured && storageConfigured && workerConfigured && workerReachable && ffmpegAvailable,
    authConfigured,
    storageConfigured,
    workerConfigured: workerConfigured && workerReachable,
    ffmpegAvailable,
    aiEnhancementAvailable,
    aiProvider,
    supportedCodecs,
    missingConfig,
    limits: getServerLimits(),
  }

  return jsonResponse(capabilities, 200)
}
