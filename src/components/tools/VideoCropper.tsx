import React, { useState, useRef, useCallback } from 'react'
import {
  Upload,
  Play,
  Pause,
  RotateCcw as ResetIcon,
  Trash2,
  Download,
  Sparkles,
  Volume2,
  VolumeX,
  AlertCircle,
  Scissors,
  CheckCircle2,
  StopCircle,
  Maximize,
  Minimize
} from 'lucide-react'
import { CropBoxOverlay } from '../common/CropBoxOverlay'
import { PrecisionControls } from '../common/PrecisionControls'
import { ZoomControls } from '../common/ZoomControls'
import type { AspectRatioOption, CropRect } from '../../types/crop'

export const VideoCropper: React.FC = () => {
  // Video Source States
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [videoName, setVideoName] = useState<string>('video')
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const [videoDuration, setVideoDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [fileSizeStr, setFileSizeStr] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Transforms & Zoom
  const [zoom, setZoom] = useState<number>(1)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  // Crop Box & Presets
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('9:16')
  const [cropRect, setCropRect] = useState<CropRect>({ x: 0, y: 0, width: 1080, height: 1920 })

  // Processing & Export State
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [processingProgress, setProcessingProgress] = useState<number>(0)
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null)
  const [processedFileSize, setProcessedFileSize] = useState<string | null>(null)

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  // Video processing cancellation ref
  const cancelProcessingRef = useRef<boolean>(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Calculate default crop box based on aspect ratio
  const calculateDefaultCrop = useCallback((preset: AspectRatioOption, vidW: number, vidH: number): CropRect => {
    let ratio = 9 / 16
    if (preset === '16:9') ratio = 16 / 9
    else if (preset === '9:16') ratio = 9 / 16
    else if (preset === '1:1') ratio = 1
    else if (preset === '4:5') ratio = 4 / 5
    else if (preset === '4:3') ratio = 4 / 3
    else if (preset === 'original') ratio = vidW / vidH
    else ratio = vidW / vidH

    let w = vidW * 0.8
    let h = w / ratio

    if (h > vidH * 0.95) {
      h = vidH * 0.95
      w = h * ratio
    }
    if (w > vidW * 0.95) {
      w = vidW * 0.95
      h = w / ratio
    }

    w = Math.round(Math.min(w, vidW))
    h = Math.round(Math.min(h, vidH))
    const x = Math.round((vidW - w) / 2)
    const y = Math.round((vidH - h) / 2)

    return { x: Math.max(0, x), y: Math.max(0, y), width: w, height: h }
  }, [])

  // Handle Video File Upload
  const handleFile = (file: File) => {
    setErrorMsg(null)
    setProcessedVideoUrl(null)
    setProcessedFileSize(null)

    if (!file.type.startsWith('video/')) {
      setErrorMsg('Please upload a valid video file (MP4, WebM, MOV).')
      return
    }

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`
    setFileSizeStr(sizeStr)
    setVideoName(file.name.replace(/\.[^/.]+$/, ''))

    const url = URL.createObjectURL(file)
    setVideoSrc(url)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  // Loaded metadata from video tag
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    const w = videoRef.current.videoWidth || 1920
    const h = videoRef.current.videoHeight || 1080
    const dur = videoRef.current.duration || 0

    setVideoDimensions({ width: w, height: h })
    setVideoDuration(dur)
    const initialBox = calculateDefaultCrop(aspectRatio, w, h)
    setCropRect(initialBox)
  }

  const handleAspectRatioChange = (newRatio: AspectRatioOption) => {
    setAspectRatio(newRatio)
    if (videoDimensions.width > 0 && videoDimensions.height > 0) {
      const newBox = calculateDefaultCrop(newRatio, videoDimensions.width, videoDimensions.height)
      setCropRect(newBox)
    }
  }

  const handleReset = () => {
    setZoom(1)
    if (videoDimensions.width > 0 && videoDimensions.height > 0) {
      const newBox = calculateDefaultCrop(aspectRatio, videoDimensions.width, videoDimensions.height)
      setCropRect(newBox)
    }
  }

  // Play / Pause video control
  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!stageRef.current) return
    if (!document.fullscreenElement) {
      stageRef.current.requestFullscreen().catch((err) => console.error(err))
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch((err) => console.error(err))
      setIsFullscreen(false)
    }
  }

  // REAL CLIENT-SIDE VIDEO PROCESSING ENGINE (CROPS TO EXACT SELECTION ONLY)
  const processAndExportVideo = async () => {
    if (!videoRef.current || !videoSrc) return

    setIsProcessing(true)
    setProcessingProgress(0)
    setErrorMsg(null)
    cancelProcessingRef.current = false

    const video = videoRef.current
    const wasPlaying = !video.paused
    if (wasPlaying) video.pause()

    try {
      // Calculate output dimensions: only the cropped portion (must be even for video codecs)
      let targetW = Math.round(cropRect.width)
      let targetH = Math.round(cropRect.height)
      if (targetW % 2 !== 0) targetW += 1
      if (targetH % 2 !== 0) targetH += 1

      const sourceX = cropRect.x
      const sourceY = cropRect.y
      const sourceW = cropRect.width
      const sourceH = cropRect.height

      // Dedicated offscreen processing canvas sized strictly to the crop rectangle
      const canvas = document.createElement('canvas')
      canvas.width = targetW
      canvas.height = targetH
      const ctx = canvas.getContext('2d', { alpha: false })
      if (!ctx) throw new Error('Could not initialize canvas graphics.')

      // Preserve audio via AudioContext
      let audioDestination: MediaStreamAudioDestinationNode | null = null
      let audioCtx: AudioContext | null = null
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioCtx = new AudioContextClass()
        const sourceNode = audioCtx.createMediaElementSource(video)
        audioDestination = audioCtx.createMediaStreamDestination()
        sourceNode.connect(audioDestination)
        sourceNode.connect(audioCtx.destination)
      } catch (e) {
        console.warn('Audio capture note:', e)
      }

      // Stream setup from canvas (30 fps)
      const canvasStream = canvas.captureStream(30)
      const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()]
      if (audioDestination && audioDestination.stream.getAudioTracks().length > 0) {
        combinedTracks.push(...audioDestination.stream.getAudioTracks())
      }
      const combinedStream = new MediaStream(combinedTracks)

      let mimeType = 'video/webm;codecs=vp9,opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus'
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm'
      }
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4'
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 6000000,
      })
      mediaRecorderRef.current = recorder

      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      const completionPromise = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => {
          if (cancelProcessingRef.current) {
            reject(new Error('Processing was cancelled.'))
          } else {
            const outputBlob = new Blob(chunks, { type: mimeType })
            resolve(outputBlob)
          }
        }
        recorder.onerror = (e) => reject(e)
      })

      // Rewind video to start
      video.currentTime = 0
      await new Promise((res) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked)
          res(true)
        }
        video.addEventListener('seeked', onSeeked)
      })

      recorder.start(100)
      await video.play()

      // Real-time rendering loop drawing ONLY the cropped region
      const renderLoop = () => {
        if (cancelProcessingRef.current) {
          recorder.stop()
          video.pause()
          return
        }

        ctx.drawImage(video, sourceX, sourceY, sourceW, sourceH, 0, 0, targetW, targetH)

        const currentProg = Math.min(99, Math.round((video.currentTime / video.duration) * 100))
        setProcessingProgress(currentProg)

        if (!video.ended && video.currentTime < video.duration - 0.1) {
          requestAnimationFrame(renderLoop)
        } else {
          setProcessingProgress(100)
          setTimeout(() => {
            recorder.stop()
            video.pause()
          }, 200)
        }
      }

      requestAnimationFrame(renderLoop)

      const finalBlob = await completionPromise
      const finalUrl = URL.createObjectURL(finalBlob)
      setProcessedVideoUrl(finalUrl)

      const finalSizeStr = finalBlob.size > 1024 * 1024
        ? `${(finalBlob.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(finalBlob.size / 1024).toFixed(0)} KB`
      setProcessedFileSize(finalSizeStr)
    } catch (err: unknown) {
      if (!cancelProcessingRef.current) {
        const msg = err instanceof Error ? err.message : 'Video processing failed'
        setErrorMsg(msg)
      }
    } finally {
      setIsProcessing(false)
      if (videoRef.current) {
        videoRef.current.currentTime = 0
      }
    }
  }

  const cancelProcessing = () => {
    cancelProcessingRef.current = true
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (videoRef.current) {
      videoRef.current.pause()
    }
    setIsProcessing(false)
    setProcessingProgress(0)
  }

  // Clear uploaded video
  const handleClear = () => {
    if (videoSrc) URL.revokeObjectURL(videoSrc)
    if (processedVideoUrl) URL.revokeObjectURL(processedVideoUrl)
    setVideoSrc(null)
    setProcessedVideoUrl(null)
    setProcessedFileSize(null)
    setErrorMsg(null)
    setIsPlaying(false)
    setVideoDimensions({ width: 0, height: 0 })
    setZoom(1)
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Crop Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Video Cropper
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
            Crop your videos to the perfect frame for YouTube, Shorts, TikTok and other platforms.
          </p>
        </div>

        {videoSrc && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-300 dark:border-white/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ResetIcon className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Video</span>
            </button>
          </div>
        )}
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Empty State / Upload Dropzone */}
      {!videoSrc ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/[0.15] bg-slate-50 dark:bg-[#12131c] hover:bg-slate-100 dark:hover:bg-[#161724] hover:border-red-500/50 transition-all p-8 sm:p-20 text-center flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => document.getElementById('video-upload-input')?.click()}
        >
          <input
            id="video-upload-input"
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-red-500/10">
            <Upload className="w-10 h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Upload Video or Drag & Drop
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
            Supports MP4, WebM, and MOV files. Crop visually with 8 handles and rule-of-thirds grid, then export locally in your browser.
          </p>
          <span className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 shadow-md shadow-red-600/25">
            Select Video From Device
          </span>
        </div>
      ) : (
        /* Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Visual Crop Stage & Timeline (Col 8) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Top / Center: Video Preview in Large Dark Canvas Workspace */}
            <div
              ref={stageRef}
              className="relative w-full rounded-3xl bg-[#090a0f] border border-slate-800 flex items-center justify-center overflow-auto min-h-[280px] sm:min-h-[440px] max-h-[640px] p-3 sm:p-6 shadow-inner select-none"
            >
              {/* Centered Media Container that scales with Zoom */}
              <div
                ref={containerRef}
                className="relative inline-block shadow-2xl transition-transform duration-75"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                }}
              >
                {/* The Video Element */}
                <video
                  ref={videoRef}
                  src={videoSrc}
                  playsInline
                  crossOrigin="anonymous"
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
                  onEnded={() => setIsPlaying(false)}
                  className="max-w-[85vw] sm:max-w-[70vw] max-h-[45vh] sm:max-h-[52vh] object-contain block pointer-events-none select-none"
                />

                {/* Professional 8-Handle Crop Box Overlay with Rule-of-Thirds Grid */}
                {videoDimensions.width > 0 && (
                  <CropBoxOverlay
                    cropRect={cropRect}
                    naturalWidth={videoDimensions.width}
                    naturalHeight={videoDimensions.height}
                    aspectRatio={aspectRatio}
                    onCropChange={setCropRect}
                    containerRef={containerRef}
                  />
                )}
              </div>
            </div>

            {/* Bottom: Video Timeline & Playback Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] flex flex-col gap-3 shadow-sm">
              {/* Timeline Seek Bar */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max={videoDuration || 100}
                  step="0.05"
                  value={currentTime}
                  disabled={isProcessing}
                  onChange={(e) => {
                    const newT = parseFloat(e.target.value)
                    setCurrentTime(newT)
                    if (videoRef.current) videoRef.current.currentTime = newT
                  }}
                  className="w-full accent-red-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 w-24 text-right">
                  {formatTime(currentTime)} / {formatTime(videoDuration)}
                </span>
              </div>

              {/* Playback Controls Row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    disabled={isProcessing}
                    className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-transform active:scale-95 shadow-md shadow-red-600/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.muted = !isMuted
                        setIsMuted(!isMuted)
                      }
                    }}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-2">
                    <span>Source: <strong className="font-mono text-slate-800 dark:text-slate-200">{videoDimensions.width} × {videoDimensions.height}</strong></span>
                    <span>•</span>
                    <span>Size: <strong className="font-mono text-slate-800 dark:text-slate-200">{fileSizeStr}</strong></span>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={toggleFullscreen}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Fullscreen Preview"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Zoom Controls Bar */}
            <ZoomControls
              zoom={zoom}
              onZoomChange={setZoom}
              onFitToScreen={() => setZoom(1.0)}
              onResetZoom={() => setZoom(1.0)}
              disabled={isProcessing}
            />

            {/* Precision Controls: Aspect Ratio + Live Dimensions + Numeric Inputs */}
            <PrecisionControls
              cropRect={cropRect}
              naturalWidth={videoDimensions.width}
              naturalHeight={videoDimensions.height}
              aspectRatio={aspectRatio}
              onCropChange={setCropRect}
              onAspectRatioChange={handleAspectRatioChange}
              disabled={isProcessing}
            />
          </div>

          {/* Export Sidebar (Col 4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Export Cropped Video</h3>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-xs space-y-2 text-slate-600 dark:text-slate-400">
                <div className="font-semibold text-slate-800 dark:text-slate-200">Export Specifications:</div>
                <div className="flex justify-between">
                  <span>Output Area:</span>
                  <span className="font-mono font-bold text-red-500">
                    {Math.round(cropRect.width)} × {Math.round(cropRect.height)} px
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Output Ratio:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase">{aspectRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">100% In-Browser</span>
                </div>
              </div>

              {/* Progress Indicator */}
              {isProcessing && (
                <div className="space-y-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center justify-between text-xs font-semibold text-red-600 dark:text-red-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                      <span>Cropping video locally...</span>
                    </span>
                    <span className="font-mono">{processingProgress}%</span>
                  </div>

                  <div
                    className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={processingProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="bg-gradient-to-r from-red-600 to-rose-600 h-full transition-all duration-150"
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={cancelProcessing}
                    className="inline-flex items-center justify-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 font-semibold w-full mt-1 cursor-pointer"
                  >
                    <StopCircle className="w-3.5 h-3.5" />
                    <span>Cancel Processing</span>
                  </button>
                </div>
              )}

              {/* Export Action */}
              {!isProcessing && !processedVideoUrl && (
                <button
                  type="button"
                  onClick={processAndExportVideo}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all duration-200 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Scissors className="w-5 h-5" />
                  <span>Export Processed Video</span>
                </button>
              )}

              {/* Download Ready Section */}
              {processedVideoUrl && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">Cropped Video Ready!</p>
                      <p className="mt-0.5 text-emerald-600 dark:text-emerald-400">
                        Resolution: <strong className="font-mono">{Math.round(cropRect.width)} × {Math.round(cropRect.height)}</strong> • Size: <strong className="font-mono">{processedFileSize}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Cropped Video Player Preview (Only cropped portion) */}
                  <div className="rounded-2xl overflow-hidden border border-slate-700 bg-black aspect-video flex items-center justify-center">
                    <video
                      src={processedVideoUrl}
                      controls
                      className="max-h-48 max-w-full rounded-xl"
                    />
                  </div>

                  {/* Direct Download Button */}
                  <a
                    href={processedVideoUrl}
                    download={`${videoName}-cropped-${Math.round(cropRect.width)}x${Math.round(cropRect.height)}.webm`}
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all shadow-lg shadow-red-600/30 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Cropped Video</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setProcessedVideoUrl(null)
                      setProcessedFileSize(null)
                    }}
                    className="w-full text-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                  >
                    Crop another segment or adjustment
                  </button>
                </div>
              )}

              <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                Processed locally in your browser • Zero data uploaded
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
