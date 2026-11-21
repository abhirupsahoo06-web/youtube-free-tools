import React, { useState, useRef } from 'react'
import {
  Upload,
  Play,
  Pause,
  Download,
  Trash2,
  Music,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  ShieldCheck,
  Sparkles,
  Volume2
} from 'lucide-react'
import {
  decodeAudioFromFile,
  encodeAudioToWav,
  encodeAudioToMp3,
  encodeAudioToM4a,
  type AudioFormat,
  type Mp3Bitrate
} from '../../utils/audioEncoder'

export const VideoToAudioConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [videoName, setVideoName] = useState<string>('audio-track')
  const [fileSizeStr, setFileSizeStr] = useState<string>('')
  const [videoDuration, setVideoDuration] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Audio extraction options
  const [targetFormat, setTargetFormat] = useState<AudioFormat>('mp3')
  const [mp3Bitrate, setMp3Bitrate] = useState<Mp3Bitrate>(192)

  // Conversion state
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [convertedAudioUrl, setConvertedAudioUrl] = useState<string | null>(null)
  const [convertedSizeStr, setConvertedSizeStr] = useState<string | null>(null)

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setErrorMsg(null)
    setConvertedAudioUrl(null)
    setConvertedSizeStr(null)

    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv|avi|m4v|flv)$/i)) {
      setErrorMsg('Please upload a valid local video file (MP4, WebM, MOV, MKV, AVI).')
      return
    }

    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`
    setFileSizeStr(sizeStr)
    setVideoName(file.name.replace(/\.[^/.]+$/, ''))
    setSelectedFile(file)

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
    setVideoDuration(videoRef.current.duration || 0)
  }

  const handleClear = () => {
    if (videoSrc) URL.revokeObjectURL(videoSrc)
    if (convertedAudioUrl) URL.revokeObjectURL(convertedAudioUrl)
    setSelectedFile(null)
    setVideoSrc(null)
    setConvertedAudioUrl(null)
    setConvertedSizeStr(null)
    setErrorMsg(null)
    setProgress(0)
    setIsProcessing(false)
  }

  const handleConvert = async () => {
    if (!selectedFile) return
    setErrorMsg(null)
    setIsProcessing(true)
    setProgress(5)

    try {
      // 1. Decode raw AudioBuffer from file using Web Audio API
      setProgress(15)
      const audioBuffer = await decodeAudioFromFile(selectedFile)

      if (audioBuffer.length === 0 || audioBuffer.duration === 0) {
        throw new Error('No audio tracks were detected in this video file.')
      }

      setProgress(30)
      let outputBlob: Blob

      if (targetFormat === 'wav') {
        setProgress(60)
        outputBlob = encodeAudioToWav(audioBuffer)
        setProgress(100)
      } else if (targetFormat === 'mp3') {
        outputBlob = await encodeAudioToMp3(audioBuffer, mp3Bitrate, (pct) => {
          setProgress(30 + Math.round(pct * 0.7))
        })
      } else {
        // M4A
        outputBlob = await encodeAudioToM4a(audioBuffer, 192000, (pct) => {
          setProgress(30 + Math.round(pct * 0.7))
        })
      }

      const outSize =
        outputBlob.size > 1024 * 1024
          ? `${(outputBlob.size / (1024 * 1024)).toFixed(2)} MB`
          : `${(outputBlob.size / 1024).toFixed(0)} KB`
      setConvertedSizeStr(outSize)

      const url = URL.createObjectURL(outputBlob)
      setConvertedAudioUrl(url)
    } catch (err: unknown) {
      console.error(err)
      const msg = err instanceof Error ? err.message : 'Audio extraction failed.'
      setErrorMsg(`${msg} (The video file may have no audio track or an unsupported audio codec).`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-white/[0.08]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Local Audio Extractor</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Convert Video to Audio
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
          Upload any video file from your device and extract high-quality MP3, WAV, or M4A audio. 100% private in your browser.
        </p>
      </div>

      {/* Main Container */}
      {!videoSrc ? (
        /* Upload Area */
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="relative group border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-red-500 dark:hover:border-red-500 rounded-3xl p-8 sm:p-16 text-center cursor-pointer transition-all bg-white dark:bg-[#14151f] shadow-sm hover:shadow-xl hover:shadow-red-500/5 flex flex-col items-center justify-center min-h-[280px] sm:min-h-[380px]"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,.mp4,.webm,.mov,.mkv,.avi,.m4v"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0])
              }
            }}
          />

          <div className="w-20 h-20 rounded-3xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 mb-6 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all shadow-inner">
            <Music className="w-10 h-10" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Upload a Video File to Convert
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Drag and drop your local video file here, or click to browse. Supports MP4, WebM, MOV, MKV, and AVI.
          </p>

          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-md shadow-red-600/30 transition-all">
            <Upload className="w-4 h-4" />
            <span>Select Video File</span>
          </div>

          <div className="mt-8 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Local In-Browser Processing — Your files never leave your computer.</span>
          </div>

          {errorMsg && (
            <div className="mt-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      ) : (
        /* Video Loaded & Audio Conversion Studio */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-300">
          {/* Left Column: Video Preview & Source Info (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-video border border-slate-200 dark:border-white/10 shadow-lg flex items-center justify-center">
              <video
                ref={videoRef}
                src={videoSrc}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-contain"
                controls
              />
            </div>

            {/* Video File Details Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => {
                    if (videoRef.current) {
                      if (isPlaying) videoRef.current.pause()
                      else videoRef.current.play()
                      setIsPlaying(!isPlaying)
                    }
                  }}
                  className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white truncate block max-w-[200px] sm:max-w-md">
                    {selectedFile?.name}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span>Size: <strong className="font-mono text-slate-800 dark:text-slate-200">{fileSizeStr}</strong></span>
                    {videoDuration > 0 && (
                      <>
                        <span>•</span>
                        <span>Duration: <strong className="font-mono text-slate-800 dark:text-slate-200">{Math.round(videoDuration)}s</strong></span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>

            {/* Converted Audio Result Card (if done) */}
            {convertedAudioUrl && (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-[#13221e] dark:to-[#14151f] border border-emerald-500/30 shadow-md space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Audio Extracted Successfully!
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    {targetFormat} • {convertedSizeStr}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <Volume2 className="w-4 h-4 text-emerald-500" />
                    <span>Preview Extracted Audio:</span>
                  </div>
                  <audio src={convertedAudioUrl} controls className="w-full h-10 outline-none" />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={convertedAudioUrl}
                    download={`${videoName}.${targetFormat}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .{targetFormat.toUpperCase()}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setConvertedAudioUrl(null)
                      setProgress(0)
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.1] border border-slate-300 dark:border-white/10 transition-colors cursor-pointer"
                  >
                    <span>Change Settings</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Audio Options & Action (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-red-500" />
                <span>Audio Extraction Settings</span>
              </h3>

              {/* Format Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2.5">
                  Select Output Audio Format
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(
                    [
                      { id: 'mp3', label: 'MP3', desc: 'Universal audio' },
                      { id: 'wav', label: 'WAV', desc: 'Lossless studio' },
                      { id: 'm4a', label: 'M4A', desc: 'AAC audio' },
                    ] as { id: AudioFormat; label: string; desc: string }[]
                  ).map(({ id, label, desc }) => (
                    <button
                      key={id}
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setTargetFormat(id)}
                      className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        targetFormat === id
                          ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                          : 'bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.06]'
                      }`}
                    >
                      <FileAudio className="w-5 h-5 mb-0.5" />
                      <span className="text-xs font-bold">{label}</span>
                      <span className={`text-[10px] ${targetFormat === id ? 'text-red-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* MP3 Bitrate Options */}
              {targetFormat === 'mp3' && (
                <div className="animate-in fade-in duration-200">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                    MP3 Audio Bitrate
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { rate: 128, label: '128 kbps', tag: 'Standard' },
                        { rate: 192, label: '192 kbps', tag: 'High' },
                        { rate: 320, label: '320 kbps', tag: 'Studio' },
                      ] as { rate: Mp3Bitrate; label: string; tag: string }[]
                    ).map(({ rate, label, tag }) => (
                      <button
                        key={rate}
                        type="button"
                        disabled={isProcessing}
                        onClick={() => setMp3Bitrate(rate)}
                        className={`p-2.5 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                          mp3Bitrate === rate
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                            : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                        }`}
                      >
                        <span>{label}</span>
                        <span className="text-[10px] opacity-75">{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality details info */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
                <div className="flex justify-between">
                  <span>Engine:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Web Audio API + LAME</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">100% In-Browser Private</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Format:</span>
                  <span className="font-mono font-bold uppercase text-slate-800 dark:text-slate-200">.{targetFormat}</span>
                </div>
              </div>

              {/* Progress Bar (when converting) */}
              {isProcessing && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      Converting Audio...
                    </span>
                    <span className="font-mono">{progress}%</span>
                  </div>
                  <div
                    className="w-full h-3 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden p-0.5 border border-slate-200 dark:border-white/10"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Convert Action Button */}
              <button
                type="button"
                onClick={handleConvert}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing {progress}%</span>
                  </>
                ) : (
                  <>
                    <Music className="w-5 h-5" />
                    <span>Convert to {targetFormat.toUpperCase()}</span>
                  </>
                )}
              </button>

              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
