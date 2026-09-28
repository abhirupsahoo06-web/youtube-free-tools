import React, { useState, useRef, useEffect, useCallback } from 'react'
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
  Eye,
  AlertCircle,
  Scissors,
  CheckCircle2,
  StopCircle
} from 'lucide-react'

type AspectRatioPreset = '16:9' | '9:16' | '1:1' | '4:5' | 'original' | 'free'

interface CropBox {
  x: number // percentage 0-100
  y: number // percentage 0-100
  width: number // percentage 0-100
  height: number // percentage 0-100
}

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

  // Crop Box & Presets
  const [aspectRatio, setAspectRatio] = useState<AspectRatioPreset>('9:16')
  const [cropBox, setCropBox] = useState<CropBox>({ x: 25, y: 0, width: 50, height: 100 })
  const [cropPixels, setCropPixels] = useState<{ width: number; height: number; x: number; y: number }>({
    width: 1080,
    height: 1920,
    x: 0,
    y: 0,
  })

  // Mode: 'editor' | 'preview_crop'
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')

  // Processing & Export State
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [processingProgress, setProcessingProgress] = useState<number>(0)
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null)
  const [processedFileSize, setProcessedFileSize] = useState<string | null>(null)

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef<boolean>(false)
  const dragHandleRef = useRef<string | null>(null)
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const startCropBoxRef = useRef<CropBox>(cropBox)

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

  // Loaded metadata
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    const w = videoRef.current.videoWidth || 1920
    const h = videoRef.current.videoHeight || 1080
    const dur = videoRef.current.duration || 0

    setVideoDimensions({ width: w, height: h })
    setVideoDuration(dur)
    resetCrop(w, h, '9:16')
  }

  // Compute crop box based on aspect ratio preset
  const calculateCropFromRatio = useCallback(
    (preset: AspectRatioPreset, vidW: number, vidH: number): CropBox => {
      let ratio = 9 / 16
      if (preset === '16:9') ratio = 16 / 9
      else if (preset === '9:16') ratio = 9 / 16
      else if (preset === '1:1') ratio = 1
      else if (preset === '4:5') ratio = 4 / 5
      else if (preset === 'original') ratio = vidW / vidH
      else return { x: 10, y: 10, width: 80, height: 80 }

      const containerRatio = vidW / vidH
      let boxW = 80
      let boxH = 80

      if (ratio > containerRatio) {
        boxW = 85
        boxH = (boxW * containerRatio) / ratio
      } else {
        boxH = 85
        boxW = (boxH * ratio) / containerRatio
      }

      boxW = Math.min(boxW, 95)
      boxH = Math.min(boxH, 95)

      const boxX = (100 - boxW) / 2
      const boxY = (100 - boxH) / 2

      return {
        x: Math.max(0, boxX),
        y: Math.max(0, boxY),
        width: boxW,
        height: boxH,
      }
    },
    []
  )

  const updatePixelValues = (box: CropBox, vidW: number, vidH: number) => {
    const pxW = Math.round((box.width / 100) * vidW)
    const pxH = Math.round((box.height / 100) * vidH)
    const pxX = Math.round((box.x / 100) * vidW)
    const pxY = Math.round((box.y / 100) * vidH)
    setCropPixels({ width: pxW, height: pxH, x: pxX, y: pxY })
  }

  const resetCrop = (
    w = videoDimensions.width,
    h = videoDimensions.height,
    preset = aspectRatio
  ) => {
    const newBox = calculateCropFromRatio(preset, w, h)
    setCropBox(newBox)
    updatePixelValues(newBox, w, h)
  }

  const handleRatioChange = (preset: AspectRatioPreset) => {
    setAspectRatio(preset)
    if (videoDimensions.width > 0 && videoDimensions.height > 0) {
      const newBox = calculateCropFromRatio(preset, videoDimensions.width, videoDimensions.height)
      setCropBox(newBox)
      updatePixelValues(newBox, videoDimensions.width, videoDimensions.height)
    }
  }

  // Pointer drag & resize handlers for crop rectangle
  const handlePointerDown = (e: React.PointerEvent, handle: string) => {
    e.preventDefault()
    e.stopPropagation()
    isDraggingRef.current = true
    dragHandleRef.current = handle
    dragStartPosRef.current = { x: e.clientX, y: e.clientY }
    startCropBoxRef.current = { ...cropBox }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    const deltaXPercent = ((e.clientX - dragStartPosRef.current.x) / rect.width) * 100
    const deltaYPercent = ((e.clientY - dragStartPosRef.current.y) / rect.height) * 100

    const start = startCropBoxRef.current
    const handle = dragHandleRef.current

    let newX = start.x
    let newY = start.y
    let newW = start.width
    let newH = start.height

    if (handle === 'move') {
      newX = Math.max(0, Math.min(start.x + deltaXPercent, 100 - start.width))
      newY = Math.max(0, Math.min(start.y + deltaYPercent, 100 - start.height))
    } else {
      let targetRatio: number | null = null
      if (aspectRatio === '16:9') targetRatio = 16 / 9
      else if (aspectRatio === '9:16') targetRatio = 9 / 16
      else if (aspectRatio === '1:1') targetRatio = 1
      else if (aspectRatio === '4:5') targetRatio = 4 / 5
      else if (aspectRatio === 'original' && videoDimensions.height > 0) {
        targetRatio = videoDimensions.width / videoDimensions.height
      }

      const containerRatio = videoDimensions.width / videoDimensions.height

      if (handle?.includes('e')) {
        newW = Math.max(5, Math.min(start.width + deltaXPercent, 100 - start.x))
      }
      if (handle?.includes('w')) {
        const potentialW = start.width - deltaXPercent
        if (potentialW >= 5 && start.x + deltaXPercent >= 0) {
          newX = start.x + deltaXPercent
          newW = potentialW
        }
      }
      if (handle?.includes('s')) {
        newH = Math.max(5, Math.min(start.height + deltaYPercent, 100 - start.y))
      }
      if (handle?.includes('n')) {
        const potentialH = start.height - deltaYPercent
        if (potentialH >= 5 && start.y + deltaYPercent >= 0) {
          newY = start.y + deltaYPercent
          newH = potentialH
        }
      }

      if (targetRatio && containerRatio) {
        if (handle?.includes('e') || handle?.includes('w')) {
          newH = (newW * containerRatio) / targetRatio
          if (newY + newH > 100) {
            newH = 100 - newY
            newW = (newH * targetRatio) / containerRatio
          }
        } else if (handle?.includes('n') || handle?.includes('s')) {
          newW = (newH * targetRatio) / containerRatio
          if (newX + newW > 100) {
            newW = 100 - newX
            newH = (newW * containerRatio) / targetRatio
          }
        }
      }
    }

    const updated: CropBox = {
      x: Math.max(0, Math.min(newX, 95)),
      y: Math.max(0, Math.min(newY, 95)),
      width: Math.max(5, Math.min(newW, 100 - newX)),
      height: Math.max(5, Math.min(newH, 100 - newY)),
    }

    setCropBox(updated)
    updatePixelValues(updated, videoDimensions.width, videoDimensions.height)
  }

  const handlePointerUp = () => {
    isDraggingRef.current = false
    dragHandleRef.current = null
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
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

  // Video time update
  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)

    // If preview tab is active, draw current cropped frame to canvas
    if (activeTab === 'preview' && previewCanvasRef.current) {
      drawCroppedFrame(previewCanvasRef.current, videoRef.current)
    }
  }

  // Draw cropped frame onto a canvas
  const drawCroppedFrame = useCallback((canvas: HTMLCanvasElement, video: HTMLVideoElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const sourceX = (cropBox.x / 100) * video.videoWidth
    const sourceY = (cropBox.y / 100) * video.videoHeight
    const sourceW = (cropBox.width / 100) * video.videoWidth
    const sourceH = (cropBox.height / 100) * video.videoHeight

    canvas.width = Math.round(sourceW)
    canvas.height = Math.round(sourceH)

    ctx.drawImage(video, sourceX, sourceY, sourceW, sourceH, 0, 0, canvas.width, canvas.height)
  }, [cropBox])

  // When switching to preview tab, draw current frame
  useEffect(() => {
    if (activeTab === 'preview' && previewCanvasRef.current && videoRef.current) {
      drawCroppedFrame(previewCanvasRef.current, videoRef.current)
    }
  }, [activeTab, drawCroppedFrame])

  // REAL CLIENT-SIDE VIDEO PROCESSING ENGINE
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
      // Calculate output dimensions (must be even numbers for h264/vp9 encoders)
      let targetW = Math.round((cropBox.width / 100) * video.videoWidth)
      let targetH = Math.round((cropBox.height / 100) * video.videoHeight)
      if (targetW % 2 !== 0) targetW += 1
      if (targetH % 2 !== 0) targetH += 1

      const sourceX = (cropBox.x / 100) * video.videoWidth
      const sourceY = (cropBox.y / 100) * video.videoHeight
      const sourceW = (cropBox.width / 100) * video.videoWidth
      const sourceH = (cropBox.height / 100) * video.videoHeight

      // Create offscreen rendering canvas
      const canvas = document.createElement('canvas')
      canvas.width = targetW
      canvas.height = targetH
      const ctx = canvas.getContext('2d', { alpha: false })
      if (!ctx) throw new Error('Could not initialize canvas graphics.')

      // Audio setup using AudioContext to preserve video soundtrack
      let audioDestination: MediaStreamAudioDestinationNode | null = null
      let audioCtx: AudioContext | null = null
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioCtx = new AudioContextClass()
        const sourceNode = audioCtx.createMediaElementSource(video)
        audioDestination = audioCtx.createMediaStreamDestination()
        sourceNode.connect(audioDestination)
        sourceNode.connect(audioCtx.destination) // Keep monitoring
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

      // Determine best supported MIME type
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
        videoBitsPerSecond: 6000000, // 6 Mbps high quality
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

      // Real-time frame rendering loop
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
          // Finished rendering
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
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Browser-Native Video Suite</span>
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
              onClick={() => resetCrop()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-300 dark:border-white/10 transition-colors"
            >
              <ResetIcon className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 transition-colors"
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
          className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/[0.15] bg-slate-50 dark:bg-[#12131c] hover:bg-slate-100 dark:hover:bg-[#161724] hover:border-red-500/50 transition-all p-12 sm:p-20 text-center flex flex-col items-center justify-center cursor-pointer group"
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
            Supports MP4, WebM, and MOV files. High-performance client-side cropping directly in your browser with zero server uploads.
          </p>
          <span className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 shadow-md shadow-red-600/25">
            Select Video From Device
          </span>
        </div>
      ) : (
        /* Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Visual Crop Stage (Col 8) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* View Tab Switcher & Presets */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] shadow-sm">
              {/* Aspect Ratio Presets */}
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-xs font-bold uppercase text-slate-400 mr-1.5">Preset:</span>
                {(
                  [
                    { key: '9:16', label: '9:16 Shorts' },
                    { key: '16:9', label: '16:9 Widescreen' },
                    { key: '1:1', label: '1:1 Square' },
                    { key: '4:5', label: '4:5 Portrait' },
                    { key: 'original', label: 'Original' },
                  ] as { key: AspectRatioPreset; label: string }[]
                ).map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => handleRatioChange(preset.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      aspectRatio === preset.key
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Editor vs Preview Mode */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.04] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'editor'
                      ? 'bg-white dark:bg-white/[0.1] text-red-600 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5 inline mr-1" />
                  <span>Crop Area</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'preview'
                      ? 'bg-white dark:bg-white/[0.1] text-red-600 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 inline mr-1" />
                  <span>Cropped Result</span>
                </button>
              </div>
            </div>

            {/* Stage: Interactive Crop or Cropped Canvas Preview */}
            {activeTab === 'editor' ? (
              <div
                ref={containerRef}
                className="relative w-full rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden min-h-[420px] max-h-[600px] select-none shadow-inner"
                style={{ touchAction: 'none' }}
              >
                {/* The video element */}
                <video
                  ref={videoRef}
                  src={videoSrc}
                  playsInline
                  crossOrigin="anonymous"
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  className="max-w-full max-h-[560px] object-contain pointer-events-none"
                />

                {/* Dark Mask Outside Crop Box */}
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="absolute bg-black/70 backdrop-blur-[1px]"
                    style={{ top: 0, left: 0, right: 0, height: `${cropBox.y}%` }}
                  />
                  <div
                    className="absolute bg-black/70 backdrop-blur-[1px]"
                    style={{
                      top: `${cropBox.y + cropBox.height}%`,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  />
                  <div
                    className="absolute bg-black/70 backdrop-blur-[1px]"
                    style={{
                      top: `${cropBox.y}%`,
                      left: 0,
                      width: `${cropBox.x}%`,
                      height: `${cropBox.height}%`,
                    }}
                  />
                  <div
                    className="absolute bg-black/70 backdrop-blur-[1px]"
                    style={{
                      top: `${cropBox.y}%`,
                      left: `${cropBox.x + cropBox.width}%`,
                      right: 0,
                      height: `${cropBox.height}%`,
                    }}
                  />
                </div>

                {/* Interactive Crop Box Window */}
                <div
                  className="absolute border-2 border-red-500 shadow-2xl cursor-move touch-none"
                  style={{
                    top: `${cropBox.y}%`,
                    left: `${cropBox.x}%`,
                    width: `${cropBox.width}%`,
                    height: `${cropBox.height}%`,
                  }}
                  onPointerDown={(e) => handlePointerDown(e, 'move')}
                >
                  {/* Grid Lines */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                    <div className="border-r border-b border-white/50" />
                    <div className="border-r border-b border-white/50" />
                    <div className="border-b border-white/50" />
                    <div className="border-r border-b border-white/50" />
                    <div className="border-r border-b border-white/50" />
                    <div className="border-b border-white/50" />
                    <div className="border-r border-b border-white/50" />
                    <div className="border-r border-b border-white/50" />
                    <div />
                  </div>

                  {/* Resolution tag */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono font-bold text-white pointer-events-none">
                    {cropPixels.width} × {cropPixels.height}
                  </div>

                  {/* Resize Handles */}
                  <div className="crop-handle -top-2 -left-2 cursor-nwse-resize" onPointerDown={(e) => handlePointerDown(e, 'nw')} />
                  <div className="crop-handle -top-2 left-1/2 -translate-x-1/2 cursor-ns-resize" onPointerDown={(e) => handlePointerDown(e, 'n')} />
                  <div className="crop-handle -top-2 -right-2 cursor-nesw-resize" onPointerDown={(e) => handlePointerDown(e, 'ne')} />
                  <div className="crop-handle top-1/2 -right-2 -translate-y-1/2 cursor-ew-resize" onPointerDown={(e) => handlePointerDown(e, 'e')} />
                  <div className="crop-handle -bottom-2 -right-2 cursor-nwse-resize" onPointerDown={(e) => handlePointerDown(e, 'se')} />
                  <div className="crop-handle -bottom-2 left-1/2 -translate-x-1/2 cursor-ns-resize" onPointerDown={(e) => handlePointerDown(e, 's')} />
                  <div className="crop-handle -bottom-2 -left-2 cursor-nesw-resize" onPointerDown={(e) => handlePointerDown(e, 'sw')} />
                  <div className="crop-handle top-1/2 -left-2 -translate-y-1/2 cursor-ew-resize" onPointerDown={(e) => handlePointerDown(e, 'w')} />
                </div>
              </div>
            ) : (
              /* Preview Cropped Result Window */
              <div className="w-full rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center p-6 min-h-[420px] max-h-[600px] overflow-hidden">
                <canvas
                  ref={previewCanvasRef}
                  className="max-w-full max-h-[520px] object-contain rounded-2xl shadow-2xl border border-white/10"
                />
              </div>
            )}

            {/* Video Controls Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] flex flex-col gap-3 shadow-sm">
              {/* Timeline Seek Bar */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max={videoDuration || 100}
                  step="0.05"
                  value={currentTime}
                  onChange={(e) => {
                    const newT = parseFloat(e.target.value)
                    setCurrentTime(newT)
                    if (videoRef.current) videoRef.current.currentTime = newT
                  }}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 w-24 text-right">
                  {formatTime(currentTime)} / {formatTime(videoDuration)}
                </span>
              </div>

              {/* Bottom Playback Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-transform active:scale-95 shadow-md shadow-red-600/25 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.muted = !isMuted
                        setIsMuted(!isMuted)
                      }
                    }}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:text-red-500 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                  <span>Source: <strong className="font-mono text-slate-800 dark:text-slate-200">{videoDimensions.width} × {videoDimensions.height}</strong></span>
                  <span>•</span>
                  <span>Size: <strong className="font-mono text-slate-800 dark:text-slate-200">{fileSizeStr}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls & Export Panel (Col 4) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Crop Parameters Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Crop Dimensions</span>
                <span className="text-xs font-normal text-slate-500">Output Resolution</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={cropPixels.width}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-sm font-mono font-semibold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={cropPixels.height}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-sm font-mono font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Target Platform Guidance */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                <div className="font-semibold text-slate-800 dark:text-slate-200">YouTube Targets:</div>
                <div className="flex justify-between">
                  <span>YouTube Shorts:</span>
                  <span className="font-mono text-red-500 font-semibold">9:16 (1080×1920)</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard YouTube Video:</span>
                  <span className="font-mono text-red-500 font-semibold">16:9 (1920×1080)</span>
                </div>
                <div className="flex justify-between">
                  <span>Community Post / Square:</span>
                  <span className="font-mono text-slate-500 font-semibold">1:1 (1080×1080)</span>
                </div>
              </div>
            </div>

            {/* Export Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Export Cropped Video</h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Video processing executes locally inside your browser using hardware-accelerated Canvas & MediaRecorder. No video files are uploaded.
              </p>

              {/* Progress Indicator */}
              {isProcessing && (
                <div className="space-y-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center justify-between text-xs font-semibold text-red-600 dark:text-red-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                      <span>Processing frames locally...</span>
                    </span>
                    <span className="font-mono">{processingProgress}%</span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-600 to-rose-600 h-full transition-all duration-150"
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={cancelProcessing}
                    className="inline-flex items-center justify-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 font-semibold w-full mt-1"
                  >
                    <StopCircle className="w-3.5 h-3.5" />
                    <span>Cancel Processing</span>
                  </button>
                </div>
              )}

              {/* Export Button */}
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
                        Resolution: <strong className="font-mono">{cropPixels.width} × {cropPixels.height}</strong> • Size: <strong className="font-mono">{processedFileSize}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Cropped Video Player Preview */}
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
                    download={`${videoName}-cropped-${cropPixels.width}x${cropPixels.height}.webm`}
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
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    Crop another segment or adjustment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
