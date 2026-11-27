import { createWriteStream } from 'node:fs'
import { mkdir, mkdtemp, readdir, rm, stat } from 'node:fs/promises'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { randomUUID, timingSafeEqual } from 'node:crypto'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

type OutputResolution = 'original' | '720p' | '1080p' | '1440p' | '4k'
type EnhancementMode = 'standard' | 'ai'
type OutputCodec = 'h264' | 'h265'
type EncodingPreset = 'fast' | 'medium' | 'slow'
type QualityTier = 'balanced' | 'high' | 'ultra'
type AiStrength = 'subtle' | 'balanced' | 'strong'
type DenoiseLevel = 'none' | 'low' | 'medium'
type JobStatus =
  | 'queued'
  | 'downloading'
  | 'processing'
  | 'uploading'
  | 'completed'
  | 'failed'
  | 'cancelled'

interface JobInput {
  ownerId: string
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

interface InternalJob extends JobInput {
  id: string
  status: JobStatus
  stage: string
  progress: number
  targetWidth: number
  targetHeight: number
  outputKey?: string
  outputSizeBytes?: number
  downloadUrl?: string
  expiresAt?: string
  deleteAtMs?: number
  error?: string
  errorCode?: string
  createdAt: string
  updatedAt: string
  cancelled: boolean
  activeProcess?: ChildProcess
}

const PORT = Number(process.env.PORT) || 8787
const WORKER_SECRET = process.env.ENHANCER_WORKER_SECRET?.trim() || ''
const MAX_CONCURRENT_JOBS = Math.max(1, Number(process.env.MAX_CONCURRENT_JOBS) || 2)
const TEMP_RETENTION_MINUTES = Math.max(5, Number(process.env.TEMP_RETENTION_MINUTES) || 60)

const AI_API_URL = process.env.AI_ENHANCER_API_URL?.trim() || ''
const AI_API_KEY = process.env.AI_ENHANCER_API_KEY?.trim() || ''
const REALESRGAN_BIN = process.env.REALESRGAN_BIN_PATH?.trim() || ''
const REALESRGAN_MODEL = process.env.REALESRGAN_MODEL?.trim() || 'realesrgan-x4plus'

function detectFfmpeg(): { ffmpegAvailable: boolean; codecs: OutputCodec[] } {
  const versionCheck = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' })
  if (versionCheck.status !== 0) {
    return { ffmpegAvailable: false, codecs: [] }
  }
  const encCheck = spawnSync('ffmpeg', ['-hide_banner', '-encoders'], { encoding: 'utf8' })
  const stdout = encCheck.stdout || ''
  const codecs: OutputCodec[] = []
  if (stdout.includes('libx264')) codecs.push('h264')
  if (stdout.includes('libx265')) codecs.push('h265')
  return {
    ffmpegAvailable: true,
    codecs: codecs.length > 0 ? codecs : ['h264'],
  }
}

const FFMPEG_INFO = detectFfmpeg()
const AI_PROVIDER = AI_API_URL
  ? 'external-gpu-api'
  : REALESRGAN_BIN
    ? 'realesrgan-ncnn-vulkan'
    : null

function createS3Client(): S3Client {
  return new S3Client({
    region: process.env.S3_REGION?.trim() || 'auto',
    endpoint: process.env.S3_ENDPOINT?.trim() || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID?.trim() || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY?.trim() || '',
    },
  })
}

const S3_BUCKET = process.env.S3_BUCKET?.trim() || ''
const jobs = new Map<string, InternalJob>()
const queue: string[] = []
let activeCount = 0

function toEven(value: number): number {
  return Math.max(2, Math.round(value / 2) * 2)
}

function computeTargetDimensions(
  srcW: number,
  srcH: number,
  resolution: OutputResolution
): { width: number; height: number } {
  if (resolution === 'original') {
    return { width: toEven(srcW), height: toEven(srcH) }
  }
  const boxes: Record<Exclude<OutputResolution, 'original'>, [number, number]> = {
    '720p': [1280, 720],
    '1080p': [1920, 1080],
    '1440p': [2560, 1440],
    '4k': [3840, 2160],
  }
  const [longEdge, shortEdge] = boxes[resolution]
  const isPortrait = srcH > srcW
  const boxW = isPortrait ? shortEdge : longEdge
  const boxH = isPortrait ? longEdge : shortEdge
  const scale = Math.min(boxW / srcW, boxH / srcH)
  return {
    width: toEven(srcW * scale),
    height: toEven(srcH * scale),
  }
}

function verifySecret(req: IncomingMessage): boolean {
  if (!WORKER_SECRET) return false
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) return false
  const a = Buffer.from(token)
  const b = Buffer.from(WORKER_SECRET)
  return a.length === b.length && timingSafeEqual(a, b)
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = []
  let total = 0
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    total += buf.length
    if (total > 32_768) throw new Error('Payload too large')
    chunks.push(buf)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T
}

function serializeJob(job: InternalJob) {
  return {
    id: job.id,
    status: job.status,
    stage: job.stage,
    progress: job.progress,
    mode: job.mode,
    resolution: job.resolution,
    targetWidth: job.targetWidth,
    targetHeight: job.targetHeight,
    codec: job.codec,
    outputSizeBytes: job.outputSizeBytes,
    downloadUrl: job.downloadUrl,
    expiresAt: job.expiresAt,
    error: job.error,
    errorCode: job.errorCode,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  }
}

async function downloadFromS3(s3: S3Client, key: string, destPath: string): Promise<void> {
  const response = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }))
  if (!response.Body) throw new Error('Empty S3 source stream.')
  const readable = response.Body as Readable
  await pipeline(readable, createWriteStream(destPath))
}

async function uploadToS3(s3: S3Client, key: string, filePath: string): Promise<number> {
  const stats = await stat(filePath)
  const { createReadStream } = await import('node:fs')
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: createReadStream(filePath),
      ContentType: 'video/mp4',
      ContentLength: stats.size,
    })
  )
  return stats.size
}

async function safeDeleteS3Object(s3: S3Client, key: string | undefined) {
  if (!key || !S3_BUCKET) return
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }))
  } catch {
    // Cleanup best-effort
  }
}

async function probeMedia(inputPath: string): Promise<{
  width: number
  height: number
  duration: number
  hasAudio: boolean
  fps: number
}> {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'stream=codec_type,width,height,r_frame_rate:format=duration',
      '-of',
      'json',
      inputPath,
    ])
    let out = ''
    let err = ''
    proc.stdout.on('data', (d) => (out += d.toString()))
    proc.stderr.on('data', (d) => (err += d.toString()))
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe failed: ${err || 'Invalid video container'}`))
        return
      }
      try {
        const parsed = JSON.parse(out) as {
          streams?: Array<{
            codec_type?: string
            width?: number
            height?: number
            r_frame_rate?: string
          }>
          format?: { duration?: string }
        }
        const videoStream = parsed.streams?.find((s) => s.codec_type === 'video')
        if (!videoStream?.width || !videoStream?.height) {
          reject(new Error('No video stream found in uploaded file.'))
          return
        }
        const hasAudio = Boolean(parsed.streams?.some((s) => s.codec_type === 'audio'))
        let fps = 30
        if (videoStream.r_frame_rate && videoStream.r_frame_rate.includes('/')) {
          const [num, den] = videoStream.r_frame_rate.split('/').map(Number)
          if (num > 0 && den > 0) fps = Math.min(120, Math.max(1, num / den))
        }
        resolve({
          width: videoStream.width,
          height: videoStream.height,
          duration: Number(parsed.format?.duration) || 1,
          hasAudio,
          fps,
        })
      } catch {
        reject(new Error('Failed to parse video stream metadata.'))
      }
    })
  })
}

async function runFfmpegEncode(params: {
  job: InternalJob
  inputPath: string
  outputPath: string
  durationSeconds: number
  hasAudio: boolean
  vfChain: string
  audioSourcePath?: string
}): Promise<void> {
  const { job, inputPath, outputPath, durationSeconds, hasAudio, vfChain, audioSourcePath } = params
  const crfMap: Record<QualityTier, { h264: string; h265: string }> = {
    balanced: { h264: '21', h265: '24' },
    high: { h264: '18', h265: '21' },
    ultra: { h264: '15', h265: '18' },
  }

  const videoCodec = job.codec === 'h265' ? 'libx265' : 'libx264'
  const crf = crfMap[job.quality][job.codec]

  const args = ['-y', '-i', inputPath]
  if (audioSourcePath) {
    args.push('-i', audioSourcePath)
  }

  args.push('-vf', vfChain, '-c:v', videoCodec, '-preset', job.preset, '-crf', crf, '-pix_fmt', 'yuv420p')
  if (job.codec === 'h265') {
    args.push('-tag:v', 'hvc1')
  }

  if (audioSourcePath) {
    args.push('-map', '0:v:0')
    if (hasAudio && job.preserveAudio) {
      args.push('-map', '1:a:0?', '-c:a', 'aac', '-b:a', '192k', '-af', 'aresample=async=1:first_pts=0', '-shortest')
    } else {
      args.push('-an')
    }
  } else if (hasAudio && job.preserveAudio) {
    args.push('-c:a', 'aac', '-b:a', '192k', '-af', 'aresample=async=1:first_pts=0')
  } else {
    args.push('-an')
  }

  args.push('-movflags', '+faststart', '-progress', 'pipe:1', '-nostats', outputPath)

  await new Promise<void>((resolve, reject) => {
    const proc = spawn('ffmpeg', args)
    job.activeProcess = proc
    let stderrLog = ''

    proc.stdout.on('data', (chunk: Buffer) => {
      const text = chunk.toString('utf8')
      const match = text.match(/out_time_us=(\d+)/)
      if (match) {
        const outSec = Number(match[1]) / 1_000_000
        const pct = Math.min(95, Math.max(10, Math.round((outSec / Math.max(0.5, durationSeconds)) * 85) + 10))
        job.progress = pct
        job.updatedAt = new Date().toISOString()
      }
    })

    proc.stderr.on('data', (chunk: Buffer) => {
      stderrLog = (stderrLog + chunk.toString('utf8')).slice(-2000)
    })

    proc.on('close', (code) => {
      job.activeProcess = undefined
      if (job.cancelled) {
        reject(new Error('Job cancelled by user.'))
      } else if (code !== 0) {
        reject(new Error(`FFmpeg exited with code ${code}: ${stderrLog.trim().slice(-240)}`))
      } else {
        resolve()
      }
    })
  })
}

async function runLocalRealEsrganPipeline(params: {
  job: InternalJob
  workDir: string
  inputPath: string
  outputPath: string
  fps: number
  durationSeconds: number
  hasAudio: boolean
}): Promise<void> {
  const { job, workDir, inputPath, outputPath, fps, durationSeconds, hasAudio } = params
  const framesIn = join(workDir, 'frames_in')
  const framesOut = join(workDir, 'frames_out')
  await mkdir(framesIn, { recursive: true })
  await mkdir(framesOut, { recursive: true })

  job.stage = 'Extracting video frames for AI super-resolution'
  job.progress = 18
  await new Promise<void>((resolve, reject) => {
    const proc = spawn('ffmpeg', ['-y', '-i', inputPath, '-qscale:v', '2', join(framesIn, 'frame_%06d.png')])
    job.activeProcess = proc
    proc.on('close', (code) => {
      job.activeProcess = undefined
      if (job.cancelled) reject(new Error('Job cancelled by user.'))
      else if (code !== 0) reject(new Error('Failed to extract frames for AI enhancement.'))
      else resolve()
    })
  })

  job.stage = `Running Real-ESRGAN (${REALESRGAN_MODEL}) frame enhancement`
  job.progress = 35
  const scaleArg = job.targetWidth / Math.max(1, job.sourceWidth) > 2 ? '4' : '2'
  await new Promise<void>((resolve, reject) => {
    const proc = spawn(REALESRGAN_BIN, [
      '-i',
      framesIn,
      '-o',
      framesOut,
      '-n',
      REALESRGAN_MODEL,
      '-s',
      scaleArg,
      '-f',
      'png',
    ])
    job.activeProcess = proc
    const totalFramesPromise = readdir(framesIn).then((files) => Math.max(1, files.length))
    const pollTimer = setInterval(async () => {
      try {
        const total = await totalFramesPromise
        const done = (await readdir(framesOut)).length
        job.progress = Math.min(82, 35 + Math.round((done / total) * 47))
        job.updatedAt = new Date().toISOString()
      } catch {
        // Ignore polling race
      }
    }, 1000)

    proc.on('close', (code) => {
      clearInterval(pollTimer)
      job.activeProcess = undefined
      if (job.cancelled) reject(new Error('Job cancelled by user.'))
      else if (code !== 0) reject(new Error(`Real-ESRGAN worker exited with code ${code}.`))
      else resolve()
    })
  })

  job.stage = 'Encoding enhanced frames and synchronizing original audio'
  const filters = [`scale=${job.targetWidth}:${job.targetHeight}:flags=lanczos`, 'setsar=1']
  if (job.temporalConsistency) {
    filters.unshift('tmix=frames=3:weights="1 2 1"')
  }
  if (job.denoise === 'low') filters.unshift('hqdn3d=1.5:1.5:4:4')
  else if (job.denoise === 'medium') filters.unshift('hqdn3d=3.0:2.5:6:5')

  await new Promise<void>((resolve, reject) => {
    const args = [
      '-y',
      '-framerate',
      fps.toFixed(3),
      '-i',
      join(framesOut, 'frame_%06d.png'),
      '-i',
      inputPath,
      '-vf',
      filters.join(','),
      '-map',
      '0:v:0',
      '-c:v',
      job.codec === 'h265' ? 'libx265' : 'libx264',
      '-preset',
      job.preset,
      '-crf',
      job.quality === 'ultra' ? '15' : job.quality === 'high' ? '18' : '21',
      '-pix_fmt',
      'yuv420p',
    ]
    if (hasAudio && job.preserveAudio) {
      args.push('-map', '1:a:0?', '-c:a', 'aac', '-b:a', '192k', '-af', 'aresample=async=1:first_pts=0', '-shortest')
    } else {
      args.push('-an')
    }
    args.push('-movflags', '+faststart', outputPath)

    const proc = spawn('ffmpeg', args)
    job.activeProcess = proc
    proc.on('close', (code) => {
      job.activeProcess = undefined
      if (job.cancelled) reject(new Error('Job cancelled by user.'))
      else if (code !== 0) reject(new Error(`Final AI mux/encode failed (duration ${Math.round(durationSeconds)}s).`))
      else resolve()
    })
  })
}

async function processJob(job: InternalJob): Promise<void> {
  const s3 = createS3Client()
  const workDir = await mkdtemp(join(tmpdir(), `yt-enhancer-${job.id}-`))
  const inputPath = join(workDir, 'source_video')
  const outputPath = join(workDir, 'enhanced.mp4')

  try {
    job.status = 'downloading'
    job.stage = 'Fetching uploaded video from object storage'
    job.progress = 5
    job.updatedAt = new Date().toISOString()

    await downloadFromS3(s3, job.objectKey, inputPath)
    if (job.cancelled) throw new Error('Job cancelled by user.')

    const media = await probeMedia(inputPath)
    const exactDims = computeTargetDimensions(media.width, media.height, job.resolution)
    job.targetWidth = exactDims.width
    job.targetHeight = exactDims.height

    job.status = 'processing'
    job.progress = 10
    job.updatedAt = new Date().toISOString()

    if (job.mode === 'ai') {
      if (AI_API_URL) {
        job.stage = 'Dispatching to GPU AI super-resolution endpoint'
        const signedSourceUrl = await getSignedUrl(
          s3,
          new GetObjectCommand({ Bucket: S3_BUCKET, Key: job.objectKey }),
          { expiresIn: 1800 }
        )
        const aiRes = await fetch(AI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(AI_API_KEY ? { Authorization: `Bearer ${AI_API_KEY}` } : {}),
          },
          body: JSON.stringify({
            inputUrl: signedSourceUrl,
            targetWidth: job.targetWidth,
            targetHeight: job.targetHeight,
            aiStrength: job.aiStrength,
            denoise: job.denoise,
            temporalConsistency: job.temporalConsistency,
          }),
        })
        if (!aiRes.ok) {
          throw new Error(`External GPU AI service returned HTTP ${aiRes.status}.`)
        }
        const aiData = (await aiRes.json()) as { enhancedVideoUrl?: string }
        if (!aiData.enhancedVideoUrl) {
          throw new Error('GPU AI service did not return an enhancedVideoUrl.')
        }
        const aiVideoRes = await fetch(aiData.enhancedVideoUrl)
        if (!aiVideoRes.ok || !aiVideoRes.body) {
          throw new Error('Failed to fetch enhanced video from GPU AI service.')
        }
        const aiRawPath = join(workDir, 'ai_raw.mp4')
        await pipeline(Readable.fromWeb(aiVideoRes.body as never), createWriteStream(aiRawPath))
        job.stage = 'Muxing original audio & finalizing MP4 container'
        await runFfmpegEncode({
          job,
          inputPath: aiRawPath,
          audioSourcePath: inputPath,
          outputPath,
          durationSeconds: media.duration,
          hasAudio: media.hasAudio,
          vfChain: `scale=${job.targetWidth}:${job.targetHeight}:flags=lanczos,setsar=1`,
        })
      } else if (REALESRGAN_BIN) {
        await runLocalRealEsrganPipeline({
          job,
          workDir,
          inputPath,
          outputPath,
          fps: media.fps,
          durationSeconds: media.duration,
          hasAudio: media.hasAudio,
        })
      } else {
        throw new Error('AI GPU enhancement service is not configured.')
      }
    } else {
      job.stage = `Encoding ${job.targetWidth}×${job.targetHeight} with FFmpeg Lanczos (${job.codec.toUpperCase()})`
      await runFfmpegEncode({
        job,
        inputPath,
        outputPath,
        durationSeconds: media.duration,
        hasAudio: media.hasAudio,
        vfChain: `scale=${job.targetWidth}:${job.targetHeight}:flags=lanczos,setsar=1`,
      })
    }

    if (job.cancelled) throw new Error('Job cancelled by user.')

    job.status = 'uploading'
    job.stage = 'Storing enhanced MP4 & signing download URL'
    job.progress = 96
    job.updatedAt = new Date().toISOString()

    const outputKey = `outputs/${job.ownerId}/${job.id}/enhanced.mp4`
    const outputSizeBytes = await uploadToS3(s3, outputKey, outputPath)
    const ttlSeconds = TEMP_RETENTION_MINUTES * 60
    const downloadUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: outputKey,
        ResponseContentDisposition: `attachment; filename="${job.filename.replace(/\.[^/.]+$/, '')}-enhanced-${job.resolution}.mp4"`,
      }),
      { expiresIn: ttlSeconds }
    )

    job.outputKey = outputKey
    job.outputSizeBytes = outputSizeBytes
    job.downloadUrl = downloadUrl
    job.deleteAtMs = Date.now() + ttlSeconds * 1000
    job.expiresAt = new Date(job.deleteAtMs).toISOString()
    job.status = 'completed'
    job.stage = 'Ready for download'
    job.progress = 100
    job.updatedAt = new Date().toISOString()
  } catch (err: unknown) {
    if (job.cancelled) {
      job.status = 'cancelled'
      job.stage = 'Cancelled by user'
    } else {
      job.status = 'failed'
      job.stage = 'Processing failed'
      job.error = err instanceof Error ? err.message : 'Unexpected video processing error.'
      job.errorCode = 'PROCESSING_FAILED'
    }
    job.updatedAt = new Date().toISOString()
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {})
    if (job.status === 'completed') {
      await safeDeleteS3Object(s3, job.objectKey)
    } else if (!job.deleteAtMs) {
      job.deleteAtMs = Date.now() + TEMP_RETENTION_MINUTES * 60 * 1000
    }
  }
}

function pumpQueue() {
  while (activeCount < MAX_CONCURRENT_JOBS && queue.length > 0) {
    const nextId = queue.shift()
    if (!nextId) continue
    const job = jobs.get(nextId)
    if (!job || job.cancelled || job.status !== 'queued') continue
    activeCount += 1
    void processJob(job).finally(() => {
      activeCount -= 1
      pumpQueue()
    })
  }
}

// Periodic cleanup of expired source and output files from S3 and stale job entries
setInterval(() => {
  const s3 = createS3Client()
  const now = Date.now()
  for (const [id, job] of jobs.entries()) {
    if (job.deleteAtMs && now > job.deleteAtMs) {
      void safeDeleteS3Object(s3, job.objectKey)
      void safeDeleteS3Object(s3, job.outputKey)
      jobs.delete(id)
    }
  }
}, 60_000).unref()

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`)
  const method = req.method || 'GET'

  if (!verifySecret(req)) {
    sendJson(res, 401, { error: 'Unauthorized worker access.', code: 'UNAUTHORIZED' })
    return
  }

  if (method === 'GET' && url.pathname === '/health') {
    sendJson(res, 200, {
      ok: true,
      ffmpegAvailable: FFMPEG_INFO.ffmpegAvailable,
      supportedCodecs: FFMPEG_INFO.codecs,
      aiEnhancementAvailable: Boolean(AI_PROVIDER),
      aiProvider: AI_PROVIDER,
      activeJobs: activeCount,
      queuedJobs: queue.length,
    })
    return
  }

  if (method === 'POST' && url.pathname === '/jobs') {
    try {
      const body = await readJsonBody<JobInput>(req)
      if (!FFMPEG_INFO.ffmpegAvailable) {
        sendJson(res, 503, {
          error: 'FFmpeg is not installed on the worker environment.',
          code: 'FFMPEG_UNAVAILABLE',
        })
        return
      }
      if (body.mode === 'ai' && !AI_PROVIDER) {
        sendJson(res, 503, {
          error: 'AI GPU enhancement model (AI_ENHANCER_API_URL or REALESRGAN_BIN_PATH) is not configured on the worker.',
          code: 'AI_WORKER_NOT_CONFIGURED',
        })
        return
      }
      if (body.codec === 'h265' && !FFMPEG_INFO.codecs.includes('h265')) {
        sendJson(res, 400, {
          error: 'H.265 (libx265) encoder is not supported by this FFmpeg build. Select H.264.',
          code: 'CODEC_UNSUPPORTED',
        })
        return
      }

      const dims = computeTargetDimensions(body.sourceWidth, body.sourceHeight, body.resolution)
      const now = new Date().toISOString()
      const job: InternalJob = {
        ...body,
        id: randomUUID(),
        status: 'queued',
        stage: 'Queued for processing',
        progress: 0,
        targetWidth: dims.width,
        targetHeight: dims.height,
        createdAt: now,
        updatedAt: now,
        cancelled: false,
      }
      jobs.set(job.id, job)
      queue.push(job.id)
      pumpQueue()
      sendJson(res, 201, serializeJob(job))
    } catch (err: unknown) {
      sendJson(res, 400, {
        error: err instanceof Error ? err.message : 'Invalid job payload.',
        code: 'INVALID_JOB',
      })
    }
    return
  }

  if (method === 'GET' && url.pathname === '/jobs') {
    const ownerId = url.searchParams.get('ownerId') || ''
    const list = Array.from(jobs.values())
      .filter((j) => j.ownerId === ownerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 20)
      .map(serializeJob)
    sendJson(res, 200, { jobs: list })
    return
  }

  const jobMatch = url.pathname.match(/^\/jobs\/([a-zA-Z0-9_-]+)(\/retry)?$/)
  if (jobMatch) {
    const jobId = jobMatch[1]
    const isRetry = Boolean(jobMatch[2])
    const ownerId = url.searchParams.get('ownerId') || ''
    const job = jobs.get(jobId)

    if (!job || job.ownerId !== ownerId) {
      sendJson(res, 404, { error: 'Job not found or access denied.', code: 'JOB_NOT_FOUND' })
      return
    }

    if (method === 'GET' && !isRetry) {
      sendJson(res, 200, serializeJob(job))
      return
    }

    if (method === 'DELETE' && !isRetry) {
      job.cancelled = true
      job.status = 'cancelled'
      job.stage = 'Cancelled by user'
      job.updatedAt = new Date().toISOString()
      if (job.activeProcess) {
        job.activeProcess.kill('SIGTERM')
      }
      sendJson(res, 200, serializeJob(job))
      return
    }

    if (method === 'POST' && isRetry) {
      if (job.status !== 'failed' && job.status !== 'cancelled') {
        sendJson(res, 400, { error: 'Only failed or cancelled jobs can be retried.', code: 'INVALID_STATE' })
        return
      }
      job.cancelled = false
      job.status = 'queued'
      job.stage = 'Re-queued for processing'
      job.progress = 0
      job.error = undefined
      job.errorCode = undefined
      job.updatedAt = new Date().toISOString()
      queue.push(job.id)
      pumpQueue()
      sendJson(res, 200, serializeJob(job))
      return
    }
  }

  sendJson(res, 404, { error: 'Not found', code: 'NOT_FOUND' })
})

server.listen(PORT, () => {
  console.log(
    `[yt-enhancer-worker] Listening on :${PORT} | ffmpeg=${FFMPEG_INFO.ffmpegAvailable} | codecs=${FFMPEG_INFO.codecs.join(',')} | ai=${AI_PROVIDER || 'disabled'}`
  )
})
