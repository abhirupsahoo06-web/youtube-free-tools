import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Upload,
  Wand2,
  Sliders,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  StopCircle,
  Cpu,
  HardDrive,
  Info,
  Film,
  Volume2,
} from 'lucide-react'
import type {
  AiStrength,
  DenoiseLevel,
  EncodingPreset,
  EnhancementJob,
  EnhancementMode,
  EnhancerCapabilities,
  OutputCodec,
  OutputResolution,
  QualityTier,
} from '../../types/enhancer'
import {
  RESOLUTION_SPECS,
  calculateTargetDimensions,
  estimateOutputSizeBytes,
  formatBytes,
  formatDuration,
} from '../../utils/enhancerMath'

const ACCEPTED_EXTENSIONS = /\.(mp4|mov|mkv|webm)$/i
const ACCEPTED_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-matroska',
  'video/matroska',
  'video/webm',
]

function uploadWithProgress(
  uploadUrl: string,
  file: File,
  contentType: string,
  onProgress: (pct: number) => void,
  signal: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl, true)
    xhr.setRequestHeader('Content-Type', contentType)

    const onAbort = () => {
      xhr.abort()
      reject(new Error('Upload cancelled by user.'))
    }
    signal.addEventListener('abort', onAbort, { once: true })

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && evt.total > 0) {
        onProgress(Math.min(99, Math.round((evt.loaded / evt.total) * 100)))
      }
    }

    xhr.onload = () => {
      signal.removeEventListener('abort', onAbort)
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100)
        resolve()
      } else {
        reject(new Error(`Object storage upload failed with HTTP ${xhr.status}.`))
      }
    }

    xhr.onerror = () => {
      signal.removeEventListener('abort', onAbort)
      reject(new Error('Network error while uploading video to object storage. Check bucket CORS settings.'))
    }

    xhr.send(file)
  })
}

export const VideoQualityEnhancer: React.FC = () => {
  // Backend / Infrastructure capabilities
  const [capabilities, setCapabilities] = useState<EnhancerCapabilities | null>(null)
  const [loadingCaps, setLoadingCaps] = useState<boolean>(true)
  const [capsError, setCapsError] = useState<string | null>(null)

  // Local selected video & metadata
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [sourceWidth, setSourceWidth] = useState<number>(0)
  const [sourceHeight, setSourceHeight] = useState<number>(0)
  const [durationSeconds, setDurationSeconds] = useState<number>(0)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Enhancement configuration
  const [resolution, setResolution] = useState<OutputResolution>('4k')
  const [mode, setMode] = useState<EnhancementMode>('standard')
  const [codec, setCodec] = useState<OutputCodec>('h264')
  const [preset, setPreset] = useState<EncodingPreset>('medium')
  const [quality, setQuality] = useState<QualityTier>('high')
  const [aiStrength, setAiStrength] = useState<AiStrength>('balanced')
  const [denoise, setDenoise] = useState<DenoiseLevel>('low')
  const [temporalConsistency, setTemporalConsistency] = useState<boolean>(true)
  const [preserveAudio, setPreserveAudio] = useState<boolean>(true)

  // Upload & background job state
  const [phase, setPhase] = useState<'idle' | 'authenticating' | 'uploading' | 'queued' | 'processing' | 'done' | 'error'>('idle')
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [job, setJob] = useState<EnhancementJob | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [processError, setProcessError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const pollTimerRef = useRef<number | null>(null)

  const maxFileSizeBytes = capabilities?.limits.maxFileSizeBytes ?? 500 * 1024 * 1024
  const maxDurationSeconds = capabilities?.limits.maxDurationSeconds ?? 600

  const fetchCapabilities = useCallback(async (withSpinner = true) => {
    if (withSpinner) {
      setLoadingCaps(true)
      setCapsError(null)
    }
    try {
      const res = await fetch('/api/enhancer/capabilities')
      const contentType = res.headers.get('content-type') || ''
      if (!res.ok || !contentType.includes('application/json')) {
        throw new Error('Enhancer API endpoints are not active in this runtime. Deploy on Vercel with worker & S3 environment variables configured.')
      }
      const data = (await res.json()) as EnhancerCapabilities
      setCapabilities(data)
    } catch (err: unknown) {
      setCapabilities(null)
      setCapsError(
        err instanceof Error
          ? err.message
          : 'Could not query video enhancer backend capabilities.'
      )
    } finally {
      setLoadingCaps(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch('/api/enhancer/capabilities')
        const contentType = res.headers.get('content-type') || ''
        if (!res.ok || !contentType.includes('application/json')) {
          throw new Error('Enhancer API endpoints are not active in this runtime. Deploy on Vercel with worker & S3 environment variables configured.')
        }
        const data = (await res.json()) as EnhancerCapabilities
        if (active) {
          setCapabilities(data)
          setCapsError(null)
        }
      } catch (err: unknown) {
        if (active) {
          setCapabilities(null)
          setCapsError(
            err instanceof Error
              ? err.message
              : 'Could not query video enhancer backend capabilities.'
          )
        }
      } finally {
        if (active) setLoadingCaps(false)
      }
    })()

    return () => {
      active = false
      if (pollTimerRef.current !== null) {
        window.clearTimeout(pollTimerRef.current)
      }
      abortControllerRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc)
    }
  }, [videoSrc])

  const stopPolling = () => {
    if (pollTimerRef.current !== null) {
      window.clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }

  const handleFile = (file: File) => {
    setValidationError(null)
    setProcessError(null)
    setJob(null)
    setPhase('idle')
    setUploadProgress(0)
    stopPolling()

    const mime = file.type.split(';')[0]?.trim().toLowerCase() || ''
    const validExt = ACCEPTED_EXTENSIONS.test(file.name)
    const validMime = mime === '' || ACCEPTED_MIME_TYPES.includes(mime)

    if (!validExt || !validMime) {
      setValidationError('Unsupported video format. Please upload MP4, MOV, MKV, or WebM.')
      return
    }

    if (file.size <= 0) {
      setValidationError('The selected file appears to be empty.')
      return
    }

    if (file.size > maxFileSizeBytes) {
      setValidationError(
        `File size (${formatBytes(file.size)}) exceeds the configured limit of ${formatBytes(maxFileSizeBytes)}.`
      )
      return
    }

    if (videoSrc) URL.revokeObjectURL(videoSrc)
    const url = URL.createObjectURL(file)
    setSelectedFile(file)
    setVideoSrc(url)
    setSourceWidth(0)
    setSourceHeight(0)
    setDurationSeconds(0)
  }

  const handleLoadedMetadata = () => {
    const v = videoRef.current
    if (!v) return
    const w = v.videoWidth || 0
    const h = v.videoHeight || 0
    const dur = v.duration || 0

    setSourceWidth(w)
    setSourceHeight(h)
    setDurationSeconds(dur)

    if (w === 0 || h === 0) {
      setValidationError('Could not detect a valid video stream in this file.')
      return
    }
    if (dur > maxDurationSeconds) {
      setValidationError(
        `Video duration (${formatDuration(dur)}) exceeds the configured limit of ${formatDuration(maxDurationSeconds)}.`
      )
    }
  }

  const handleClear = () => {
    stopPolling()
    abortControllerRef.current?.abort()
    if (videoSrc) URL.revokeObjectURL(videoSrc)
    setSelectedFile(null)
    setVideoSrc(null)
    setSourceWidth(0)
    setSourceHeight(0)
    setDurationSeconds(0)
    setValidationError(null)
    setProcessError(null)
    setJob(null)
    setPhase('idle')
    setUploadProgress(0)
    setStatusMessage('')
  }

  const targetDims = calculateTargetDimensions(sourceWidth || 1920, sourceHeight || 1080, resolution)
  const estimatedSize = estimateOutputSizeBytes({
    targetWidth: targetDims.width,
    targetHeight: targetDims.height,
    durationSeconds: durationSeconds || 10,
    codec,
    quality,
    preserveAudio,
  })

  const aspectLabel =
    sourceWidth > 0 && sourceHeight > 0
      ? (() => {
          const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
          const d = gcd(sourceWidth, sourceHeight)
          return `${Math.round(sourceWidth / d)}:${Math.round(sourceHeight / d)}`
        })()
      : '—'

  const pollJobStatus = useCallback((jobId: string) => {
    const check = async () => {
      try {
        const res = await fetch(`/api/enhancer/jobs/${encodeURIComponent(jobId)}`)
        const data = (await res.json()) as EnhancementJob & { error?: string }

        if (!res.ok) {
          setPhase('error')
          setProcessError(data.error || `Status check failed (HTTP ${res.status}).`)
          return
        }

        setJob(data)
        setStatusMessage(data.stage)

        if (data.status === 'completed') {
          setPhase('done')
          return
        }
        if (data.status === 'failed' || data.status === 'cancelled') {
          setPhase('error')
          setProcessError(data.error || (data.status === 'cancelled' ? 'Job was cancelled.' : 'Enhancement failed.'))
          return
        }

        setPhase('processing')
        pollTimerRef.current = window.setTimeout(check, 1500)
      } catch (err: unknown) {
        setPhase('error')
        setProcessError(err instanceof Error ? err.message : 'Lost connection while polling job status.')
      }
    }

    pollTimerRef.current = window.setTimeout(check, 1200)
  }, [])

  const handleStartEnhancement = async () => {
    if (!selectedFile || validationError) return
    setProcessError(null)
    setJob(null)
    stopPolling()

    if (!capabilities?.ready) {
      const missing = capabilities?.missingConfig?.length
        ? `Missing environment configuration: ${capabilities.missingConfig.join(', ')}.`
        : capsError || 'External FFmpeg/GPU worker and S3 storage must be configured before processing.'
      setPhase('error')
      setProcessError(missing)
      return
    }

    if (mode === 'ai' && !capabilities.aiEnhancementAvailable) {
      setPhase('error')
      setProcessError(
        'AI Video Enhancement requires a configured GPU Real-ESRGAN worker (AI_ENHANCER_API_URL or REALESRGAN_BIN_PATH). Select Standard Upscaling (FFmpeg) or configure the AI GPU worker.'
      )
      return
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      // Step 1: Ensure signed session cookie
      setPhase('authenticating')
      setStatusMessage('Initializing authenticated session...')
      const sessionRes = await fetch('/api/auth/session', {
        method: 'POST',
        signal: controller.signal,
      })
      const sessionData = (await sessionRes.json().catch(() => ({}))) as { error?: string; missingConfig?: string[] }
      if (!sessionRes.ok) {
        throw new Error(sessionData.error || 'Could not establish authenticated session.')
      }

      // Step 2: Request signed S3 upload URL
      setStatusMessage('Requesting signed object storage upload URL...')
      const contentType = selectedFile.type.split(';')[0]?.trim() || 'video/mp4'
      const uploadUrlRes = await fetch('/api/enhancer/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          filename: selectedFile.name,
          mimeType: contentType,
          fileSizeBytes: selectedFile.size,
          durationSeconds: durationSeconds || 1,
        }),
      })
      const uploadUrlData = (await uploadUrlRes.json().catch(() => ({}))) as {
        uploadUrl?: string
        objectKey?: string
        contentType?: string
        error?: string
      }
      if (!uploadUrlRes.ok || !uploadUrlData.uploadUrl || !uploadUrlData.objectKey) {
        throw new Error(uploadUrlData.error || 'Failed to obtain signed upload URL.')
      }

      // Step 3: Direct upload to S3-compatible storage
      setPhase('uploading')
      setUploadProgress(0)
      setStatusMessage('Uploading video directly to secure object storage...')
      await uploadWithProgress(
        uploadUrlData.uploadUrl,
        selectedFile,
        uploadUrlData.contentType || contentType,
        setUploadProgress,
        controller.signal
      )

      // Step 4: Create background processing job
      setPhase('queued')
      setStatusMessage('Dispatching job to video processing worker...')
      const jobRes = await fetch('/api/enhancer/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          objectKey: uploadUrlData.objectKey,
          filename: selectedFile.name,
          sourceWidth: sourceWidth || 1920,
          sourceHeight: sourceHeight || 1080,
          durationSeconds: durationSeconds || 1,
          fileSizeBytes: selectedFile.size,
          resolution,
          mode,
          codec,
          preset,
          quality,
          aiStrength,
          denoise,
          temporalConsistency,
          preserveAudio,
        }),
      })
      const jobData = (await jobRes.json().catch(() => ({}))) as EnhancementJob & { error?: string }
      if (!jobRes.ok || !jobData.id) {
        throw new Error(jobData.error || 'Failed to create enhancement job.')
      }

      setJob(jobData)
      setPhase('processing')
      setStatusMessage(jobData.stage)
      pollJobStatus(jobData.id)
    } catch (err: unknown) {
      setPhase('error')
      setProcessError(err instanceof Error ? err.message : 'Video enhancement could not be started.')
    }
  }

  const handleCancelJob = async () => {
    abortControllerRef.current?.abort()
    stopPolling()

    if (job?.id) {
      try {
        const res = await fetch(`/api/enhancer/jobs/${encodeURIComponent(job.id)}`, {
          method: 'DELETE',
        })
        const data = (await res.json().catch(() => null)) as EnhancementJob | null
        if (data) setJob(data)
      } catch {
        // Ignore network error during cancel
      }
    }
    setPhase('idle')
    setStatusMessage('')
  }

  const handleRetryJob = async () => {
    if (!job?.id) {
      void handleStartEnhancement()
      return
    }
    setProcessError(null)
    setPhase('queued')
    setStatusMessage('Re-queueing job...')
    try {
      const res = await fetch(`/api/enhancer/jobs/${encodeURIComponent(job.id)}`, {
        method: 'POST',
      })
      const data = (await res.json().catch(() => ({}))) as EnhancementJob & { error?: string }
      if (!res.ok || !data.id) {
        throw new Error(data.error || 'Retry failed.')
      }
      setJob(data)
      setPhase('processing')
      pollJobStatus(data.id)
    } catch (err: unknown) {
      setPhase('error')
      setProcessError(err instanceof Error ? err.message : 'Retry failed.')
    }
  }

  const isBusy = phase === 'authenticating' || phase === 'uploading' || phase === 'queued' || phase === 'processing'
  const progressValue =
    phase === 'uploading' ? uploadProgress : job ? job.progress : phase === 'queued' ? 5 : 0
  const hevcSupported = capabilities?.supportedCodecs.includes('h265') ?? true

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Tool Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200/70 dark:border-white/[0.08]">
        <div>
          <div className="glass-pill inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
            <Wand2 className="w-3.5 h-3.5" />
            <span>Up to 4K UHD Upscaling & AI Enhancement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Video Quality Enhancer
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
            Enhance your video up to 4K UHD with FFmpeg Lanczos scaling or configured Real-ESRGAN AI super-resolution while preserving original aspect ratio and audio synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => void fetchCapabilities()}
            disabled={loadingCaps || isBusy}
            className="glass-pill glass-interactive inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingCaps ? 'animate-spin' : ''}`} />
            <span>Check Worker</span>
          </button>

          {videoSrc && (
            <button
              type="button"
              disabled={isBusy}
              onClick={handleClear}
              className="glass-pill inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Video</span>
            </button>
          )}
        </div>
      </div>

      {/* Infrastructure Capability / Integration Boundary Banner */}
      <div className="glass-surface rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl border flex-shrink-0 ${
              capabilities?.ready
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
            }`}
          >
            {capabilities?.ready ? <CheckCircle2 className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
          </div>
          <div className="space-y-1 text-xs sm:text-sm">
            <div className="font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
              <span>
                {loadingCaps
                  ? 'Checking processing worker & storage configuration...'
                  : capabilities?.ready
                    ? 'External FFmpeg Worker & S3 Object Storage Connected'
                    : 'Processing Backend Configuration Required'}
              </span>
              {capabilities && (
                <span className="glass-inset px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  AI Model: {capabilities.aiEnhancementAvailable ? capabilities.aiProvider || 'Active' : 'Not Configured'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {capabilities?.ready
                ? `FFmpeg worker ready (${capabilities.supportedCodecs.map((c) => c.toUpperCase()).join(' / ')}). Max file: ${formatBytes(maxFileSizeBytes)}, max duration: ${formatDuration(maxDurationSeconds)}.`
                : capabilities?.missingConfig?.length
                  ? `Missing server environment variables: ${capabilities.missingConfig.join(', ')}. Configure S3 storage, SESSION_SECRET, and the external /worker service to enable cloud rendering.`
                  : capsError || 'Heavy FFmpeg / AI enhancement runs on a dedicated worker outside Vercel serverless functions.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold flex-shrink-0">
          <span className="glass-inset px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <HardDrive className="w-3.5 h-3.5 text-red-500" />
            <span>Storage: {capabilities?.storageConfigured ? 'Ready' : 'Unconfigured'}</span>
          </span>
          <span className="glass-inset px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-red-500" />
            <span>FFmpeg: {capabilities?.ffmpegAvailable ? 'Ready' : 'Unconfigured'}</span>
          </span>
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div
          role="alert"
          className="glass-surface p-4 rounded-2xl border-rose-500/30 bg-rose-500/10 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-sm"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Upload Dropzone OR Workspace */}
      {!videoSrc ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0])
          }}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Upload video file for enhancement"
          className="glass-surface glass-interactive rounded-3xl border-2 border-dashed border-slate-300/90 dark:border-white/[0.15] hover:border-red-500/60 p-10 sm:p-20 text-center flex flex-col items-center justify-center cursor-pointer group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp4,.mov,.mkv,.webm,video/mp4,video/quicktime,video/x-matroska,video/webm"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          <div className="glass-inset w-20 h-20 rounded-3xl text-red-600 dark:text-red-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
            <Upload className="w-9 h-9" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Drop Your Video Here or Browse Files
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mb-6 leading-relaxed">
            Supports MP4, MOV, MKV, and WebM up to {formatBytes(maxFileSizeBytes)} ({formatDuration(maxDurationSeconds)} max). Preserves original aspect ratio and audio synchronization.
          </p>

          <span className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-600/20 transition-colors">
            <Film className="w-4 h-4" />
            <span>Browse Video Files</span>
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Video Preview + Original Metadata + Progress */}
          <div className="lg:col-span-7 space-y-5">
            <div className="glass-surface rounded-3xl p-3 sm:p-4 overflow-hidden">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={videoSrc}
                  controls
                  playsInline
                  onLoadedMetadata={handleLoadedMetadata}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Original Video Metadata Card */}
            <div className="glass-surface rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Film className="w-4 h-4 text-red-500" />
                  <span>Original Video Metadata</span>
                </h2>
                <span className="glass-pill px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                  {selectedFile?.type || 'video'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="glass-inset p-3.5 rounded-xl">
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Filename</span>
                  <strong className="font-mono text-slate-900 dark:text-white truncate block" title={selectedFile?.name}>
                    {selectedFile?.name}
                  </strong>
                </div>

                <div className="glass-inset p-3.5 rounded-xl">
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Source Resolution</span>
                  <strong className="font-mono text-slate-900 dark:text-white">
                    {sourceWidth > 0 ? `${sourceWidth} × ${sourceHeight}` : 'Reading...'}
                  </strong>
                </div>

                <div className="glass-inset p-3.5 rounded-xl">
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Aspect Ratio</span>
                  <strong className="font-mono text-slate-900 dark:text-white">{aspectLabel}</strong>
                </div>

                <div className="glass-inset p-3.5 rounded-xl">
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Duration</span>
                  <strong className="font-mono text-slate-900 dark:text-white">
                    {durationSeconds > 0 ? formatDuration(durationSeconds) : 'Reading...'}
                  </strong>
                </div>

                <div className="glass-inset p-3.5 rounded-xl">
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Input Size</span>
                  <strong className="font-mono text-slate-900 dark:text-white">
                    {selectedFile ? formatBytes(selectedFile.size) : '—'}
                  </strong>
                </div>

                <div className="glass-inset p-3.5 rounded-xl">
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Target Output</span>
                  <strong className="font-mono text-red-600 dark:text-red-400">
                    {targetDims.width} × {targetDims.height}
                  </strong>
                </div>
              </div>
            </div>

            {/* Active Processing Progress / Download / Error Feedback */}
            {(isBusy || phase === 'done' || phase === 'error') && (
              <div className="glass-surface rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div role="status" aria-live="polite" className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    {phase === 'done' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : phase === 'error' ? (
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    )}
                    <span>
                      {phase === 'done'
                        ? 'Enhanced Video Ready'
                        : phase === 'error'
                          ? 'Enhancement Could Not Complete'
                          : statusMessage || 'Processing...'}
                    </span>
                  </div>
                  {isBusy && (
                    <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400">
                      {progressValue}%
                    </span>
                  )}
                </div>

                {isBusy && (
                  <div className="space-y-2">
                    <progress
                      aria-label="Video enhancement progress"
                      max={100}
                      value={progressValue}
                      className="glass-progress w-full h-2.5 block"
                    />
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Job ID: {job?.id || 'initializing'}</span>
                      <button
                        type="button"
                        onClick={() => void handleCancelJob()}
                        className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold hover:underline cursor-pointer"
                      >
                        <StopCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                )}

                {phase === 'error' && processError && (
                  <div className="space-y-3">
                    <div className="glass-inset p-3.5 rounded-xl text-xs sm:text-sm text-rose-700 dark:text-rose-300 border-rose-500/25">
                      {processError}
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleRetryJob()}
                      className="glass-pill glass-interactive inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-white cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-red-500" />
                      <span>Retry Job</span>
                    </button>
                  </div>
                )}

                {phase === 'done' && job?.downloadUrl && (
                  <div className="space-y-4">
                    <div className="glass-inset p-3.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center justify-between gap-2">
                      <span>
                        Output: <strong className="font-mono text-slate-900 dark:text-white">{job.targetWidth} × {job.targetHeight}</strong> ({job.codec.toUpperCase()})
                      </span>
                      {job.outputSizeBytes && (
                        <span>
                          Size: <strong className="font-mono text-slate-900 dark:text-white">{formatBytes(job.outputSizeBytes)}</strong>
                        </span>
                      )}
                    </div>

                    <a
                      href={job.downloadUrl}
                      download
                      className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-base font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download Enhanced Video (MP4)</span>
                    </a>

                    {job.expiresAt && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                        Signed link expires automatically per retention policy ({new Date(job.expiresAt).toLocaleTimeString()}).
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Resolution, Mode, Quality Settings & Start */}
          <div className="lg:col-span-5 space-y-5">
            <div className="glass-surface rounded-3xl p-5 sm:p-7 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-red-500" />
                  <span>Enhancement Settings</span>
                </h2>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Aspect Ratio Locked
                </span>
              </div>

              {/* Resolution Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-2.5">
                  Target Output Resolution
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {RESOLUTION_SPECS.map((spec) => {
                    const dims = calculateTargetDimensions(sourceWidth || 1920, sourceHeight || 1080, spec.id)
                    const active = resolution === spec.id
                    return (
                      <button
                        key={spec.id}
                        type="button"
                        disabled={isBusy}
                        onClick={() => setResolution(spec.id)}
                        className={`p-3 rounded-xl text-left transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                          active
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'glass-inset text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-white/20'
                        } ${spec.id === '4k' ? 'sm:col-span-2' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold">{spec.label}</span>
                          <span className={`text-[11px] font-mono ${active ? 'text-red-100' : 'text-slate-500 dark:text-slate-400'}`}>
                            {dims.width} × {dims.height}
                          </span>
                        </div>
                        <span className={`text-[10px] block mt-0.5 ${active ? 'text-red-100/90' : 'text-slate-500 dark:text-slate-400'}`}>
                          {spec.id === 'original' ? 'Preserve source resolution' : `Max bounding ${spec.dimensionsLabel} (AR preserved)`}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Enhancement Mode Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-2.5">
                  Enhancement Mode
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => setMode('standard')}
                    className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      mode === 'standard'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'glass-inset text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Mode 1: Standard Upscaling (FFmpeg Lanczos)</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mode === 'standard' ? 'bg-white/20 text-white' : 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400'}`}>
                        FFmpeg
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 leading-relaxed ${mode === 'standard' ? 'text-red-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      High-precision Lanczos resampling, bitrate/CRF optimization, and H.264/H.265 encoding.
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => setMode('ai')}
                    className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      mode === 'ai'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'glass-inset text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Mode 2: AI Video Enhancement (Real-ESRGAN)</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          mode === 'ai'
                            ? 'bg-white/20 text-white'
                            : capabilities?.aiEnhancementAvailable
                              ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {capabilities?.aiEnhancementAvailable ? 'GPU Ready' : 'Requires GPU'}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 leading-relaxed ${mode === 'ai' ? 'text-red-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      Genuine frame-by-frame super-resolution, noise reduction, and temporal smoothing on GPU worker.
                    </p>
                  </button>
                </div>
              </div>

              {/* AI-Specific Options */}
              {mode === 'ai' && (
                <div className="glass-inset p-4 rounded-2xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="ai-strength" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        AI Strength
                      </label>
                      <select
                        id="ai-strength"
                        disabled={isBusy}
                        value={aiStrength}
                        onChange={(e) => setAiStrength(e.target.value as AiStrength)}
                        className="glass-surface w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
                      >
                        <option value="subtle">Subtle (Natural)</option>
                        <option value="balanced">Balanced</option>
                        <option value="strong">Strong Detail</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="ai-denoise" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Denoise Level
                      </label>
                      <select
                        id="ai-denoise"
                        disabled={isBusy}
                        value={denoise}
                        onChange={(e) => setDenoise(e.target.value as DenoiseLevel)}
                        className="glass-surface w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
                      >
                        <option value="none">None</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={isBusy}
                      checked={temporalConsistency}
                      onChange={(e) => setTemporalConsistency(e.target.checked)}
                      className="rounded accent-red-600"
                    />
                    <span>Enable temporal frame consistency</span>
                  </label>
                </div>
              )}

              {/* Codec, Quality & Preset */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label htmlFor="output-codec" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Codec
                  </label>
                  <select
                    id="output-codec"
                    disabled={isBusy}
                    value={codec}
                    onChange={(e) => setCodec(e.target.value as OutputCodec)}
                    className="glass-inset w-full px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="h264">MP4 (H.264)</option>
                    <option value="h265" disabled={!hevcSupported}>
                      MP4 (H.265){!hevcSupported ? ' (Unavailable)' : ''}
                    </option>
                  </select>
                </div>

                <div>
                  <label htmlFor="quality-tier" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Quality
                  </label>
                  <select
                    id="quality-tier"
                    disabled={isBusy}
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as QualityTier)}
                    className="glass-inset w-full px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="balanced">Balanced</option>
                    <option value="high">High</option>
                    <option value="ultra">Ultra</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="encoding-preset" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Preset
                  </label>
                  <select
                    id="encoding-preset"
                    disabled={isBusy}
                    value={preset}
                    onChange={(e) => setPreset(e.target.value as EncodingPreset)}
                    className="glass-inset w-full px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="fast">Fast</option>
                    <option value="medium">Medium</option>
                    <option value="slow">Slow</option>
                  </select>
                </div>
              </div>

              {/* Audio sync toggle */}
              <label className="glass-inset p-3 rounded-xl flex items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <span className="flex items-center gap-2 font-medium">
                  <Volume2 className="w-4 h-4 text-red-500" />
                  <span>Preserve synchronized audio track (AAC 192 kbps)</span>
                </span>
                <input
                  type="checkbox"
                  disabled={isBusy}
                  checked={preserveAudio}
                  onChange={(e) => setPreserveAudio(e.target.checked)}
                  className="rounded accent-red-600"
                />
              </label>

              {/* Estimated output file size */}
              <div className="glass-inset p-3.5 rounded-2xl text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Estimated Output Size:</span>
                  <strong className="font-mono text-slate-900 dark:text-white">
                    ~{formatBytes(estimatedSize)}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Output Container:</span>
                  <strong className="font-mono text-slate-900 dark:text-white">
                    MP4 ({codec.toUpperCase()})
                  </strong>
                </div>
              </div>

              {/* Primary Enhance Button */}
              <button
                type="button"
                disabled={isBusy || Boolean(validationError)}
                onClick={() => void handleStartEnhancement()}
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-base font-bold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className="w-5 h-5" />
                <span>
                  {isBusy
                    ? 'Processing Video...'
                    : `Enhance to ${RESOLUTION_SPECS.find((s) => s.id === resolution)?.shortLabel || '4K'}`}
                </span>
              </button>

              {/* Honest Notice & Compliance Disclaimer */}
              <div className="glass-inset p-3.5 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>
                    Upscaling increases resolution and encoding clarity, but cannot guarantee recovery of fine detail absent from the original footage.
                  </p>
                  <p className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Only process videos you own or are authorized to use.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
