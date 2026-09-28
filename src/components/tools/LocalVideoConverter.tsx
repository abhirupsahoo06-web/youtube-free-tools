import React, { useState, useRef } from 'react'
import {
  Upload,
  Play,
  Pause,
  Download,
  Trash2,
  FileCode,
  CheckCircle2,
  AlertCircle,
  StopCircle,
  Music,
  Video as VideoIcon
} from 'lucide-react'

type OutputFormat = 'webm' | 'mp4' | 'wav'
type TargetResolution = 'original' | '1080p' | '720p' | '480p'

export const LocalVideoConverter: React.FC = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [videoName, setVideoName] = useState<string>('converted-video')
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const [videoDuration, setVideoDuration] = useState<number>(0)
  const [fileSizeStr, setFileSizeStr] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Options
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('webm')
  const [targetRes, setTargetRes] = useState<TargetResolution>('original')
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

  // Processing state
  const [isConverting, setIsConverting] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null)
  const [convertedSizeStr, setConvertedSizeStr] = useState<string | null>(null)

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const cancelRef = useRef<boolean>(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const handleFile = (file: File) => {
    setErrorMsg(null)
    setConvertedUrl(null)
    setConvertedSizeStr(null)

    if (!file.type.startsWith('video/')) {
      setErrorMsg('Please upload a valid local video file (MP4, WebM, MOV).')
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

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setVideoDimensions({
      width: videoRef.current.videoWidth || 1920,
      height: videoRef.current.videoHeight || 1080,
    })
    setVideoDuration(videoRef.current.duration || 0)
  }

  const handleClear = () => {
    if (videoSrc) URL.revokeObjectURL(videoSrc)
    if (convertedUrl) URL.revokeObjectURL(convertedUrl)
    setVideoSrc(null)
    setConvertedUrl(null)
    setConvertedSizeStr(null)
    setErrorMsg(null)
    setIsPlaying(false)
    setProgress(0)
  }

  // Audio extraction to WAV using Web Audio API
  const convertToAudioWav = async (video: HTMLVideoElement): Promise<Blob> => {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const response = await fetch(video.src)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)

    // Encode audioBuffer to WAV Blob
    const numOfChan = audioBuffer.numberOfChannels
    const length = audioBuffer.length * numOfChan * 2 + 44
    const buffer = new ArrayBuffer(length)
    const view = new DataView(buffer)
    const channels = []
    let sampleRate = audioBuffer.sampleRate
    let offset = 0
    let pos = 0

    // "RIFF"
    view.setUint32(0, 0x46464952, true)
    view.setUint32(4, length - 8, true)
    // "WAVE"
    view.setUint32(8, 0x45564157, true)
    // "fmt " chunk
    view.setUint32(12, 0x20746d66, true)
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true) // PCM
    view.setUint16(22, numOfChan, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2 * numOfChan, true)
    view.setUint16(32, numOfChan * 2, true)
    view.setUint16(34, 16, true) // 16-bit
    // "data" chunk
    view.setUint32(36, 0x61746164, true)
    view.setUint32(40, length - pos - 4, true)
    pos = 44

    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i))
    }

    while (offset < audioBuffer.length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]))
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0
        view.setInt16(pos, sample, true)
        pos += 2
      }
      offset++
    }

    return new Blob([buffer], { type: 'audio/wav' })
  }

  // Convert Video
  const handleConvert = async () => {
    if (!videoRef.current || !videoSrc) return
    setIsConverting(true)
    setProgress(0)
    setErrorMsg(null)
    cancelRef.current = false

    const video = videoRef.current

    try {
      if (outputFormat === 'wav') {
        // Pure audio conversion
        setProgress(30)
        const audioBlob = await convertToAudioWav(video)
        setProgress(100)
        const url = URL.createObjectURL(audioBlob)
        setConvertedUrl(url)
        const size = audioBlob.size > 1024 * 1024
          ? `${(audioBlob.size / (1024 * 1024)).toFixed(2)} MB`
          : `${(audioBlob.size / 1024).toFixed(0)} KB`
        setConvertedSizeStr(size)
        return
      }

      // Calculate Target Dimensions
      let targetW = video.videoWidth
      let targetH = video.videoHeight
      const aspect = targetW / targetH

      if (targetRes === '1080p') {
        targetH = 1080
        targetW = Math.round(targetH * aspect)
      } else if (targetRes === '720p') {
        targetH = 720
        targetW = Math.round(targetH * aspect)
      } else if (targetRes === '480p') {
        targetH = 480
        targetW = Math.round(targetH * aspect)
      }

      if (targetW % 2 !== 0) targetW += 1
      if (targetH % 2 !== 0) targetH += 1

      const canvas = document.createElement('canvas')
      canvas.width = targetW
      canvas.height = targetH
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not initialize canvas.')

      // Audio setup
      let audioDestination: MediaStreamAudioDestinationNode | null = null
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        const audioCtx = new AudioContextClass()
        const sourceNode = audioCtx.createMediaElementSource(video)
        audioDestination = audioCtx.createMediaStreamDestination()
        sourceNode.connect(audioDestination)
        sourceNode.connect(audioCtx.destination)
      } catch (e) {
        console.warn('Audio setup note:', e)
      }

      const canvasStream = canvas.captureStream(30)
      const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()]
      if (audioDestination && audioDestination.stream.getAudioTracks().length > 0) {
        combinedTracks.push(...audioDestination.stream.getAudioTracks())
      }
      const stream = new MediaStream(combinedTracks)

      let mimeType = outputFormat === 'mp4' && MediaRecorder.isTypeSupported('video/mp4')
        ? 'video/mp4'
        : 'video/webm;codecs=vp9,opus'

      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm'
      }

      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 })
      mediaRecorderRef.current = recorder

      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data)
      }

      const completion = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => {
          if (cancelRef.current) reject(new Error('Conversion cancelled.'))
          else resolve(new Blob(chunks, { type: mimeType }))
        }
        recorder.onerror = (e) => reject(e)
      })

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

      const render = () => {
        if (cancelRef.current) {
          recorder.stop()
          video.pause()
          return
        }

        ctx.drawImage(video, 0, 0, targetW, targetH)
        const currentP = Math.min(99, Math.round((video.currentTime / video.duration) * 100))
        setProgress(currentP)

        if (!video.ended && video.currentTime < video.duration - 0.1) {
          requestAnimationFrame(render)
        } else {
          setProgress(100)
          setTimeout(() => {
            recorder.stop()
            video.pause()
          }, 200)
        }
      }

      requestAnimationFrame(render)

      const outputBlob = await completion
      const outUrl = URL.createObjectURL(outputBlob)
      setConvertedUrl(outUrl)

      const sizeStr = outputBlob.size > 1024 * 1024
        ? `${(outputBlob.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(outputBlob.size / 1024).toFixed(0)} KB`
      setConvertedSizeStr(sizeStr)
    } catch (err: unknown) {
      if (!cancelRef.current) {
        const msg = err instanceof Error ? err.message : 'Conversion failed'
        setErrorMsg(msg)
      }
    } finally {
      setIsConverting(false)
      if (videoRef.current) videoRef.current.currentTime = 0
    }
  }

  const handleCancel = () => {
    cancelRef.current = true
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (videoRef.current) videoRef.current.pause()
    setIsConverting(false)
    setProgress(0)
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-white/[0.08]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 mb-2">
          <FileCode className="w-3.5 h-3.5" />
          <span>Local Media Converter</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Local Video Converter
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
          Convert your local video files to WebM, MP4, or extract audio tracks directly in your browser.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Empty State / Upload File */}
      {!videoSrc ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/[0.15] bg-slate-50 dark:bg-[#12131c] hover:bg-slate-100 dark:hover:bg-[#161724] hover:border-red-500/50 transition-all p-12 sm:p-20 text-center flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => document.getElementById('converter-upload-input')?.click()}
        >
          <input
            id="converter-upload-input"
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-red-500/10">
            <Upload className="w-10 h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Upload Local Video File
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
            Drag and drop any MP4, WebM, or MOV video from your computer. Video conversion happens 100% locally.
          </p>
          <span className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 shadow-md shadow-red-600/25">
            Choose Video File
          </span>
        </div>
      ) : (
        /* Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Video Preview (Col 8) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="relative w-full rounded-3xl bg-[#090a0f] border border-slate-800 flex items-center justify-center overflow-hidden min-h-[420px] max-h-[600px] shadow-inner">
              <video
                ref={videoRef}
                src={videoSrc}
                playsInline
                crossOrigin="anonymous"
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className="max-w-full max-h-[540px] object-contain rounded-2xl"
              />
            </div>

            {/* Video stats bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (videoRef.current) {
                      if (isPlaying) videoRef.current.pause()
                      else videoRef.current.play()
                      setIsPlaying(!isPlaying)
                    }
                  }}
                  className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span>Resolution: <strong className="font-mono text-slate-800 dark:text-slate-200">{videoDimensions.width} × {videoDimensions.height}</strong></span>
                  <span className="mx-2">•</span>
                  <span>Size: <strong className="font-mono text-slate-800 dark:text-slate-200">{fileSizeStr}</strong></span>
                  {videoDuration > 0 && (
                    <>
                      <span className="mx-2">•</span>
                      <span>Duration: <strong className="font-mono text-slate-800 dark:text-slate-200">{Math.round(videoDuration)}s</strong></span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Video</span>
                </button>
              </div>
            </div>
          </div>

          {/* Conversion Options (Col 4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Conversion Settings</h3>

              {/* Output format */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                  Target Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'webm', label: 'WebM', icon: VideoIcon },
                      { id: 'mp4', label: 'MP4', icon: VideoIcon },
                      { id: 'wav', label: 'Audio WAV', icon: Music },
                    ] as { id: OutputFormat; label: string; icon: React.ElementType }[]
                  ).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setOutputFormat(id)}
                      className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                        outputFormat === id
                          ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                          : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Resolution (for video outputs) */}
              {outputFormat !== 'wav' && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                    Output Resolution
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: 'original', label: 'Original Size' },
                        { id: '1080p', label: '1080p (Full HD)' },
                        { id: '720p', label: '720p (HD)' },
                        { id: '480p', label: '480p (SD)' },
                      ] as { id: TargetResolution; label: string }[]
                    ).map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setTargetRes(id)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          targetRes === id
                            ? 'bg-red-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress indicator */}
              {isConverting && (
                <div className="space-y-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center justify-between text-xs font-semibold text-red-600 dark:text-red-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                      <span>Converting locally...</span>
                    </span>
                    <span className="font-mono">{progress}%</span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-600 to-rose-600 h-full transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center justify-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 font-semibold w-full mt-1 cursor-pointer"
                  >
                    <StopCircle className="w-3.5 h-3.5" />
                    <span>Cancel Conversion</span>
                  </button>
                </div>
              )}

              {/* Convert action button */}
              {!isConverting && !convertedUrl && (
                <button
                  type="button"
                  onClick={handleConvert}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <FileCode className="w-5 h-5" />
                  <span>Convert Video File</span>
                </button>
              )}

              {/* Converted result ready */}
              {convertedUrl && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">Conversion Complete!</p>
                      <p className="mt-0.5 text-emerald-600 dark:text-emerald-400">
                        Format: <strong className="uppercase font-mono">{outputFormat}</strong> • Size: <strong className="font-mono">{convertedSizeStr}</strong>
                      </p>
                    </div>
                  </div>

                  <a
                    href={convertedUrl}
                    download={`${videoName}-converted.${outputFormat}`}
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all shadow-lg shadow-red-600/30 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Converted File</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setConvertedUrl(null)
                      setConvertedSizeStr(null)
                    }}
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                  >
                    Convert with different settings
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
