import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  ExternalLink,
  Copy,
  Check,
  Code2,
  Sparkles,
  AlertCircle,
  Download,
  Eye,
  Layers,
  Music,
  FileVideo,
  Upload,
  Globe,
  Film,
  CheckCircle2,
  Trash2
} from 'lucide-react'

interface VideoAnalysisResult {
  videoId: string
  canonicalUrl: string
  embedUrl: string
  title: string
  authorName: string
  thumbnails: {
    maxres: string
    hq: string
    mq: string
  }
}

interface DirectMediaMetadata {
  url: string
  filename: string
  duration: number | null
  durationFormatted: string | null
  resolution: { width: number; height: number } | null
  format: string
  sizeBytes: number | null
  sizeFormatted: string
  mimeType: string
}

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function formatBytes(bytes: number): string {
  if (!bytes || isNaN(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

export const YouTubeLinkAnalyzer: React.FC = () => {
  // ==========================================
  // CARD 1: YOUTUBE LINK ANALYZER STATE
  // ==========================================
  const [ytUrl, setYtUrl] = useState<string>('')
  const [isAnalyzingYt, setIsAnalyzingYt] = useState<boolean>(false)
  const [ytError, setYtError] = useState<string | null>(null)
  const [ytResult, setYtResult] = useState<VideoAnalysisResult | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [selectedThumbRes, setSelectedThumbRes] = useState<'maxres' | 'hq' | 'mq'>('maxres')
  const [showThumbModal, setShowThumbModal] = useState<boolean>(false)

  // Embed customization options
  const [startTime, setStartTime] = useState<string>('0')
  const [endTime, setEndTime] = useState<string>('')
  const [autoplay, setAutoplay] = useState<boolean>(false)
  const [showControls, setShowControls] = useState<boolean>(true)
  const [loop, setLoop] = useState<boolean>(false)

  // ==========================================
  // CARD 2: VIDEO FILE DOWNLOADER STATE
  // ==========================================
  const [downloaderTab, setDownloaderTab] = useState<'url' | 'upload'>('url')

  // Direct Media URL Mode
  const [mediaUrl, setMediaUrl] = useState<string>('')
  const [isAnalyzingMedia, setIsAnalyzingMedia] = useState<boolean>(false)
  const [isDownloadingMedia, setIsDownloadingMedia] = useState<boolean>(false)
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [directMediaMeta, setDirectMediaMeta] = useState<DirectMediaMetadata | null>(null)

  // Local File Upload Mode
  const [localFile, setLocalFile] = useState<File | null>(null)
  const [localFileUrl, setLocalFileUrl] = useState<string | null>(null)
  const [localMeta, setLocalMeta] = useState<{
    filename: string
    resolution: { width: number; height: number } | null
    duration: number | null
    sizeFormatted: string
  } | null>(null)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Paste into YouTube URL input
  const handlePasteYt = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setYtUrl(text.trim())
        setYtError(null)
      }
    } catch {
      setYtError('Could not access clipboard. Please paste manually into the input box.')
    }
  }

  // Paste into Media URL input
  const handlePasteMedia = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setMediaUrl(text.trim())
        setMediaError(null)
      }
    } catch {
      setMediaError('Could not access clipboard. Please paste manually into the input box.')
    }
  }

  // ==========================================
  // YOUTUBE URL PARSER & ANALYZER
  // ==========================================
  const extractVideoId = (url: string): string | null => {
    const cleanUrl = url.trim()
    const watchRegex = /(?:youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/
    const watchMatch = cleanUrl.match(watchRegex)
    if (watchMatch) return watchMatch[1]

    const shortRegex = /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const shortMatch = cleanUrl.match(shortRegex)
    if (shortMatch) return shortMatch[1]

    const shortsRegex = /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    const shortsMatch = cleanUrl.match(shortsRegex)
    if (shortsMatch) return shortsMatch[1]

    const embedRegex = /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
    const embedMatch = cleanUrl.match(embedRegex)
    if (embedMatch) return embedMatch[1]

    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
      return cleanUrl
    }
    return null
  }

  const handleAnalyzeYt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setYtError(null)

    if (!ytUrl.trim()) {
      setYtError('Please enter a YouTube video URL.')
      return
    }

    const videoId = extractVideoId(ytUrl)
    if (!videoId) {
      setYtError('Invalid YouTube URL. Please provide a valid watch, youtu.be, shorts, or embed link.')
      return
    }

    setIsAnalyzingYt(true)
    const canonical = `https://www.youtube.com/watch?v=${videoId}`
    const embed = `https://www.youtube.com/embed/${videoId}`

    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(canonical)}&format=json`
      const res = await fetch(oembedUrl)

      let title = `YouTube Video (${videoId})`
      let authorName = 'YouTube Creator'

      if (res.ok) {
        const data = await res.json()
        title = data.title || title
        authorName = data.author_name || authorName
      } else if (res.status === 404 || res.status === 401 || res.status === 403) {
        setYtError('Notice: This video may be private, restricted, or unavailable on YouTube.')
      }

      setYtResult({
        videoId,
        canonicalUrl: canonical,
        embedUrl: embed,
        title,
        authorName,
        thumbnails: {
          maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          hq: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          mq: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        },
      })
    } catch {
      setYtResult({
        videoId,
        canonicalUrl: canonical,
        embedUrl: embed,
        title: `YouTube Video (${videoId})`,
        authorName: 'YouTube Creator',
        thumbnails: {
          maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          hq: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          mq: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        },
      })
    } finally {
      setIsAnalyzingYt(false)
    }
  }

  const getEmbedCode = (): string => {
    if (!ytResult) return ''
    const params = new URLSearchParams()
    const startSec = parseInt(startTime) || 0
    if (startSec > 0) params.set('start', startSec.toString())
    const endSec = parseInt(endTime) || 0
    if (endSec > 0) params.set('end', endSec.toString())
    if (autoplay) params.set('autoplay', '1')
    if (!showControls) params.set('controls', '0')
    if (loop) {
      params.set('loop', '1')
      params.set('playlist', ytResult.videoId)
    }
    const query = params.toString() ? `?${params.toString()}` : ''
    const fullEmbedUrl = `${ytResult.embedUrl}${query}`

    return `<iframe width="560" height="315" src="${fullEmbedUrl}" title="${ytResult.title.replace(/"/g, '&quot;')}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
  }

  const handleDownloadThumbnail = async (url: string, resName: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${ytResult?.videoId || 'video'}-thumbnail-${resName}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(url, '_blank')
    }
  }

  // ==========================================
  // DIRECT MEDIA URL ANALYZER & DOWNLOADER
  // ==========================================
  const analyzeDirectMediaUrl = async (url: string): Promise<DirectMediaMetadata> => {
    const cleanUrl = url.trim()

    let filename = 'video.mp4'
    try {
      const parsed = new URL(cleanUrl)
      const pathnameSegments = parsed.pathname.split('/').filter(Boolean)
      if (pathnameSegments.length > 0) {
        const last = pathnameSegments[pathnameSegments.length - 1]
        if (last && last.includes('.')) {
          filename = decodeURIComponent(last)
        }
      }
    } catch {
      // Fallback filename
    }

    let format = 'MP4'
    let mimeType = 'video/mp4'
    if (filename.toLowerCase().endsWith('.webm')) {
      format = 'WebM'
      mimeType = 'video/webm'
    } else if (filename.toLowerCase().endsWith('.mov')) {
      format = 'MOV'
      mimeType = 'video/quicktime'
    } else if (filename.toLowerCase().endsWith('.m4v')) {
      format = 'M4V'
      mimeType = 'video/x-m4v'
    }

    let sizeBytes: number | null = null
    let sizeFormatted = 'Estimated on download'

    try {
      const headRes = await fetch(cleanUrl, { method: 'HEAD', mode: 'cors' })
      if (headRes.ok) {
        const cType = headRes.headers.get('content-type')
        if (cType && cType.startsWith('video/')) {
          mimeType = cType.split(';')[0].trim()
          if (mimeType.includes('webm')) format = 'WebM'
          else if (mimeType.includes('mp4')) format = 'MP4'
          else if (mimeType.includes('quicktime')) format = 'MOV'
        }

        const cLen = headRes.headers.get('content-length')
        if (cLen) {
          const bytes = parseInt(cLen, 10)
          if (!isNaN(bytes) && bytes > 0) {
            sizeBytes = bytes
            sizeFormatted = formatBytes(bytes)
          }
        }

        const cDisp = headRes.headers.get('content-disposition')
        if (cDisp) {
          const match = cDisp.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
          if (match && match[1]) {
            filename = match[1].replace(/['"]/g, '').trim()
          }
        }
      }
    } catch {
      // CORS restricted HEAD request
    }

    const videoData = await new Promise<{
      resolution: { width: number; height: number } | null
      duration: number | null
    }>((resolve) => {
      const v = document.createElement('video')
      v.preload = 'metadata'
      v.src = cleanUrl

      const cleanup = () => {
        v.removeAttribute('src')
        v.load()
      }

      const timer = setTimeout(() => {
        cleanup()
        resolve({ resolution: null, duration: null })
      }, 4000)

      v.onloadedmetadata = () => {
        clearTimeout(timer)
        const res =
          v.videoWidth > 0 && v.videoHeight > 0
            ? { width: v.videoWidth, height: v.videoHeight }
            : null
        const dur = v.duration && !isNaN(v.duration) && v.duration > 0 ? v.duration : null
        cleanup()
        resolve({ resolution: res, duration: dur })
      }

      v.onerror = () => {
        clearTimeout(timer)
        cleanup()
        resolve({ resolution: null, duration: null })
      }
    })

    return {
      url: cleanUrl,
      filename,
      duration: videoData.duration,
      durationFormatted: videoData.duration ? formatDuration(videoData.duration) : null,
      resolution: videoData.resolution,
      format,
      sizeBytes,
      sizeFormatted,
      mimeType,
    }
  }

  const handleAnalyzeMedia = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setMediaError(null)

    if (!mediaUrl.trim()) {
      setMediaError('Please enter a direct media URL (e.g. https://example.com/video.mp4).')
      return
    }

    if (
      mediaUrl.includes('youtube.com') ||
      mediaUrl.includes('youtu.be') ||
      mediaUrl.includes('youtube-nocookie.com')
    ) {
      setMediaError(
        'Notice: This input is for authorized direct media URLs (e.g. MP4, WebM). For YouTube videos, please use the YouTube Link Analyzer card above.'
      )
      return
    }

    if (!mediaUrl.startsWith('http://') && !mediaUrl.startsWith('https://')) {
      setMediaError('Invalid URL. Please enter an absolute URL starting with http:// or https://')
      return
    }

    setIsAnalyzingMedia(true)
    try {
      const meta = await analyzeDirectMediaUrl(mediaUrl)
      setDirectMediaMeta(meta)
    } catch {
      setMediaError('Could not retrieve metadata for this media link. Verify the URL is accessible.')
    } finally {
      setIsAnalyzingMedia(false)
    }
  }

  const handleDownloadDirectMedia = async () => {
    setMediaError(null)

    const targetUrl = directMediaMeta?.url || mediaUrl.trim()
    if (!targetUrl) {
      setMediaError('Please provide a direct media URL first.')
      return
    }

    let meta = directMediaMeta
    if (!meta) {
      setIsAnalyzingMedia(true)
      try {
        meta = await analyzeDirectMediaUrl(targetUrl)
        setDirectMediaMeta(meta)
      } catch {
        // Fallback
      } finally {
        setIsAnalyzingMedia(false)
      }
    }

    const filename = meta?.filename || 'downloaded-video.mp4'
    setIsDownloadingMedia(true)
    setDownloadProgress(0)

    try {
      const response = await fetch(targetUrl, { mode: 'cors' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const contentLength = response.headers.get('content-length')
      const total = contentLength ? parseInt(contentLength, 10) : 0

      if (response.body && total > 0) {
        const reader = response.body.getReader()
        let received = 0
        const chunks: Uint8Array[] = []

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          if (value) {
            chunks.push(value)
            received += value.length
            setDownloadProgress(Math.min(99, Math.round((received / total) * 100)))
          }
        }

        const blob = new Blob(chunks as unknown as BlobPart[], {
          type: meta?.mimeType || 'video/mp4',
        })
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setDownloadProgress(100)
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000)
        return
      }

      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setDownloadProgress(100)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000)
    } catch {
      // Direct browser fallback
      const a = document.createElement('a')
      a.href = targetUrl
      a.download = filename
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setDownloadProgress(100)
    } finally {
      setTimeout(() => {
        setIsDownloadingMedia(false)
        setDownloadProgress(null)
      }, 1200)
    }
  }

  // ==========================================
  // LOCAL FILE UPLOAD & DOWNLOAD
  // ==========================================
  const handleLocalFileSelect = (file: File) => {
    setMediaError(null)
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv|avi|m4v)$/i)) {
      setMediaError('Please upload a valid video file (MP4, WebM, MOV, MKV).')
      return
    }

    if (localFileUrl) URL.revokeObjectURL(localFileUrl)

    const url = URL.createObjectURL(file)
    setLocalFile(file)
    setLocalFileUrl(url)

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`

    setLocalMeta({
      filename: file.name,
      resolution: null,
      duration: null,
      sizeFormatted,
    })
  }

  const handleLocalLoadedMetadata = () => {
    if (!localVideoRef.current || !localFile) return
    const v = localVideoRef.current
    setLocalMeta({
      filename: localFile.name,
      resolution:
        v.videoWidth > 0 && v.videoHeight > 0
          ? { width: v.videoWidth, height: v.videoHeight }
          : null,
      duration: v.duration || null,
      sizeFormatted:
        localFile.size > 1024 * 1024
          ? `${(localFile.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(localFile.size / 1024).toFixed(0)} KB`,
    })
  }

  const handleDownloadOriginal = () => {
    if (!localFile || !localFileUrl) return
    const a = document.createElement('a')
    a.href = localFileUrl
    a.download = localFile.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleClearLocal = () => {
    if (localFileUrl) URL.revokeObjectURL(localFileUrl)
    setLocalFile(null)
    setLocalFileUrl(null)
    setLocalMeta(null)
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Page Title */}
      <div className="pb-6 border-b border-slate-200 dark:border-white/[0.08]">
        <div className="glass-pill inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Creator Utility & Media Suite</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          YouTube Link Analyzer & Media Downloader
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
          Analyze YouTube video links for metadata, artwork, and embeds in Card 1. Download authorized direct media or inspect and download your local video files in Card 2.
        </p>
      </div>

      {/* ========================================================= */}
      {/* CARD 1: YOUTUBE LINK ANALYZER */}
      {/* ========================================================= */}
      <div className="p-6 sm:p-8 glass-surface rounded-3xl shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 shadow-inner">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                Card 1 • YouTube Public Tools
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                YouTube Link Analyzer
              </h2>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400">
            Public Metadata & Embeds
          </span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAnalyzeYt} className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Paste YouTube Video URL
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={ytUrl}
                onChange={(e) => {
                  setYtUrl(e.target.value)
                  setYtError(null)
                }}
                placeholder="https://www.youtube.com/watch?v=..."
                className="glass-inset w-full pl-4 pr-10 py-3.5 rounded-2xl text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-mono"
              />
              {ytUrl && (
                <button
                  type="button"
                  onClick={() => setYtUrl('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePasteYt}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-300 dark:border-white/10 transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Paste Link</span>
              </button>

              <button
                type="submit"
                disabled={isAnalyzingYt}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all shadow-md shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAnalyzingYt ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Analyze</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-2 items-center pt-1">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Formats:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 font-medium border border-slate-200/60 dark:border-white/[0.06]">youtube.com/watch?v=</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 font-medium border border-slate-200/60 dark:border-white/[0.06]">youtu.be/</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 font-medium border border-slate-200/60 dark:border-white/[0.06]">youtube.com/shorts/</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 font-medium border border-slate-200/60 dark:border-white/[0.06]">youtube.com/embed/</span>
          </div>
        </form>

        {ytError && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{ytError}</span>
          </div>
        )}

        {/* YouTube Analysis Results */}
        {ytResult && (
          <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] space-y-8 animate-in fade-in duration-300">
            {/* Video Overview */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="w-full lg:w-72 flex-shrink-0 group relative rounded-2xl overflow-hidden shadow-md aspect-video bg-slate-900 border border-slate-200 dark:border-white/10">
                <img
                  src={ytResult.thumbnails[selectedThumbRes]}
                  alt={ytResult.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowThumbModal(true)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs font-bold text-white cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Fullsize</span>
                </button>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    {ytResult.title}
                  </h3>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">
                    Channel: <span className="text-slate-900 dark:text-slate-200">{ytResult.authorName}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                    <span className="text-slate-500 dark:text-slate-400 block font-sans text-[11px] mb-0.5">Video ID:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{ytResult.videoId}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                    <span className="text-slate-500 dark:text-slate-400 block font-sans text-[11px] mb-0.5">Short Link:</span>
                    <span className="text-slate-800 dark:text-slate-200 truncate block">youtu.be/{ytResult.videoId}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={ytResult.canonicalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open on YouTube</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopy(ytResult.canonicalUrl, 'video-url')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-300 dark:border-white/10 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'video-url' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedKey === 'video-url' ? 'Copied URL!' : 'Copy Video URL'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(ytResult.embedUrl, 'embed-url')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-300 dark:border-white/10 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'embed-url' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedKey === 'embed-url' ? 'Copied Embed!' : 'Copy Embed URL'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Thumbnail Tools */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Thumbnail Tools</span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Official Image CDNs</span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {(
                    [
                      { id: 'maxres', label: 'Maxres (1280×720)' },
                      { id: 'hq', label: 'High (480×360)' },
                      { id: 'mq', label: 'Medium (320×180)' },
                    ] as { id: 'maxres' | 'hq' | 'mq'; label: string }[]
                  ).map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedThumbRes(id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        selectedThumbRes === id
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-white dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowThumbModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-white bg-slate-200 dark:bg-white/[0.08] hover:bg-slate-300 dark:hover:bg-white/[0.14] transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <a
                    href={ytResult.thumbnails[selectedThumbRes]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-white bg-slate-200 dark:bg-white/[0.08] hover:bg-slate-300 dark:hover:bg-white/[0.14] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </a>

                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadThumbnail(ytResult.thumbnails[selectedThumbRes], selectedThumbRes)
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save Thumbnail</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Embed Generator */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Embed Generator</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(getEmbedCode(), 'embed-code')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-sm cursor-pointer"
                >
                  {copiedKey === 'embed-code' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'embed-code' ? 'Copied Code!' : 'Copy Embed Code'}</span>
                </button>
              </div>

              {/* Start/End time inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Start Time (sec):</label>
                  <input
                    type="number"
                    min="0"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">End Time (sec):</label>
                  <input
                    type="number"
                    min="0"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white"
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Live Preview */}
              <div className="rounded-2xl overflow-hidden aspect-video bg-black max-w-xl mx-auto shadow-md border border-slate-200 dark:border-white/10">
                <iframe
                  src={`${ytResult.embedUrl}${startTime !== '0' ? `?start=${startTime}` : ''}`}
                  title={ytResult.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoplay}
                    onChange={(e) => setAutoplay(e.target.checked)}
                    className="accent-red-600 rounded"
                  />
                  <span>Autoplay</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showControls}
                    onChange={(e) => setShowControls(e.target.checked)}
                    className="accent-red-600 rounded"
                  />
                  <span>Controls</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loop}
                    onChange={(e) => setLoop(e.target.checked)}
                    className="accent-red-600 rounded"
                  />
                  <span>Loop</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* CARD 2: VIDEO FILE DOWNLOADER (REAL DOWNLOAD WORKFLOW) */}
      {/* ========================================================= */}
      <div className="glass-surface p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                Card 2 • Authorized Media Retrieval
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Download Video
              </h2>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setDownloaderTab('url')
                setMediaError(null)
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                downloaderTab === 'url'
                  ? 'bg-white dark:bg-[#14151f] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-red-500" />
              <span>Direct Media URL</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDownloaderTab('upload')
                setMediaError(null)
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                downloaderTab === 'upload'
                  ? 'bg-white dark:bg-[#14151f] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-red-500" />
              <span>Upload Video</span>
            </button>
          </div>
        </div>

        {/* TAB A: DIRECT MEDIA URL */}
        {downloaderTab === 'url' && (
          <div className="space-y-6">
            <form onSubmit={handleAnalyzeMedia} className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Direct Video File URL (MP4, WebM, MOV)
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => {
                      setMediaUrl(e.target.value)
                      setMediaError(null)
                    }}
                    placeholder="https://example.com/video.mp4"
                    className="glass-inset w-full pl-4 pr-10 py-3.5 rounded-2xl text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-mono"
                  />
                  {mediaUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setMediaUrl('')
                        setDirectMediaMeta(null)
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePasteMedia}
                    disabled={isAnalyzingMedia || isDownloadingMedia}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-300 dark:border-white/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Paste</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isAnalyzingMedia || isDownloadingMedia}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-800 dark:text-white bg-slate-200 dark:bg-white/[0.08] hover:bg-slate-300 dark:hover:bg-white/[0.14] border border-slate-300 dark:border-white/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzingMedia ? (
                      <>
                        <span className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 text-red-500" />
                        <span>Analyze</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadDirectMedia}
                    disabled={isDownloadingMedia || isAnalyzingMedia}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all shadow-md shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isDownloadingMedia ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Downloading{downloadProgress !== null ? ` ${downloadProgress}%` : '...'}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download Video</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Enter an authorized direct media URL (e.g. cloud storage or CDN MP4).</span>
                <button
                  type="button"
                  onClick={() => {
                    const sample = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
                    setMediaUrl(sample)
                    setMediaError(null)
                  }}
                  className="text-red-600 dark:text-red-400 hover:underline cursor-pointer self-start sm:self-auto"
                >
                  Load Sample MP4
                </button>
              </div>
            </form>

            {/* Direct Media Analysis Results */}
            {directMediaMeta && (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      Media Analyzed & Ready for Download
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    {directMediaMeta.format}
                  </span>
                </div>

                {/* The 6 Required Metadata Fields */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
                    <span className="text-slate-500 dark:text-slate-400 block font-sans text-[11px] mb-0.5">Filename:</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold truncate block" title={directMediaMeta.filename}>
                      {directMediaMeta.filename}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
                    <span className="text-slate-500 dark:text-slate-400 block font-sans text-[11px] mb-0.5">Video Duration:</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold">
                      {directMediaMeta.durationFormatted || 'Available on stream'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
                    <span className="text-slate-500 dark:text-slate-400 block font-sans text-[11px] mb-0.5">Resolution:</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold">
                      {directMediaMeta.resolution
                        ? `${directMediaMeta.resolution.width} × ${directMediaMeta.resolution.height}`
                        : 'Dynamic / Stream'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
                    <span className="text-slate-500 dark:text-slate-400 block font-sans text-[11px] mb-0.5">File Format:</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold uppercase">
                      {directMediaMeta.format}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
                    <span className="text-slate-500 dark:text-slate-400 block font-sans text-[11px] mb-0.5">File Size:</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold">
                      {directMediaMeta.sizeFormatted}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
                    <span className="text-slate-500 dark:text-slate-400 block font-sans text-[11px] mb-0.5">MIME Type:</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold">
                      {directMediaMeta.mimeType}
                    </span>
                  </div>
                </div>

                {/* Download Progress Bar (during download) */}
                {isDownloadingMedia && downloadProgress !== null && (
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>Downloading file...</span>
                      <span>{downloadProgress}%</span>
                    </div>
                    <div
                      className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden"
                      role="progressbar"
                      aria-valuenow={downloadProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full bg-red-600 rounded-full transition-all duration-150"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Primary Download Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadDirectMedia}
                    disabled={isDownloadingMedia}
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-extrabold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 transition-all shadow-xl shadow-red-600/35 hover:shadow-red-600/50 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-5 h-5 stroke-[2.5]" />
                    <span>Download {directMediaMeta.format.toUpperCase()}</span>
                  </button>

                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Triggers a direct browser file download to your machine.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB B: LOCAL FILE UPLOAD */}
        {downloaderTab === 'upload' && (
          <div className="space-y-6">
            {!localFileUrl ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleLocalFileSelect(e.dataTransfer.files[0])
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-red-500 dark:hover:border-red-500 rounded-3xl p-10 sm:p-12 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-white/[0.01] flex flex-col items-center justify-center min-h-[260px]"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,.mp4,.webm,.mov,.mkv,.avi,.m4v"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleLocalFileSelect(e.target.files[0])
                    }
                  }}
                />

                <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 group-hover:scale-110 transition-transform">
                  <Film className="w-8 h-8" />
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1">
                  Upload a Local Video
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5">
                  Drag and drop a video from your device or browse files (MP4, WebM, MOV, MKV).
                </p>

                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-md shadow-red-600/30 transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Upload Video</span>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileVideo className="w-5 h-5 text-red-500" />
                    <span className="text-base font-bold text-slate-900 dark:text-white truncate max-w-md">
                      {localMeta?.filename}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearLocal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                {/* Video Preview */}
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-2xl mx-auto border border-slate-200 dark:border-white/10 shadow-md flex items-center justify-center">
                  <video
                    ref={localVideoRef}
                    src={localFileUrl}
                    onLoadedMetadata={handleLocalLoadedMetadata}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Metadata Readout */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
                    <span className="text-slate-500 dark:text-slate-400 block font-sans text-[11px] mb-0.5">Filename:</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold truncate block" title={localMeta?.filename}>
                      {localMeta?.filename}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
                    <span className="text-slate-500 dark:text-slate-400 block font-sans text-[11px] mb-0.5">Resolution:</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold">
                      {localMeta?.resolution
                        ? `${localMeta.resolution.width} × ${localMeta.resolution.height}`
                        : 'Loading...'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
                    <span className="text-slate-500 dark:text-slate-400 block font-sans text-[11px] mb-0.5">Duration:</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold">
                      {localMeta?.duration ? formatDuration(localMeta.duration) : '00:00'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
                    <span className="text-slate-500 dark:text-slate-400 block font-sans text-[11px] mb-0.5">File Size:</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold">
                      {localMeta?.sizeFormatted}
                    </span>
                  </div>
                </div>

                {/* Download Original Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadOriginal}
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-extrabold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 transition-all shadow-xl shadow-red-600/35 hover:shadow-red-600/50 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <Download className="w-5 h-5 stroke-[2.5]" />
                    <span>Download Original</span>
                  </button>

                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Triggers a browser file download of your original uploaded media.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {mediaError && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{mediaError}</span>
          </div>
        )}
      </div>

      {/* Utility Footer Card: Convert My Video to Audio */}
      <div className="p-6 sm:p-8 glass-surface rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400">
              <Music className="w-3.5 h-3.5" />
              <span>Audio Extractor</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Convert My Video to Audio
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Need only the sound? Upload your video to extract MP3, WAV, or M4A audio tracks 100% locally in your browser.
            </p>
          </div>

          <Link
            to="/tools/video-to-audio"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.14] border border-slate-300 dark:border-white/10 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <Music className="w-4 h-4 text-red-500" />
            <span>Convert My Video to Audio</span>
          </Link>
        </div>
      </div>

      {/* Full Thumbnail Modal */}
      {showThumbModal && ytResult && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowThumbModal(false)}
        >
          <div
            className="glass-surface-elevated relative max-w-4xl max-h-[90vh] rounded-3xl p-6 flex flex-col items-center gap-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full border-b border-slate-200/70 dark:border-white/[0.08] pb-3">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Thumbnail Preview ({selectedThumbRes.toUpperCase()})
              </h4>
              <button
                type="button"
                onClick={() => setShowThumbModal(false)}
                className="glass-pill text-slate-700 dark:text-slate-200 px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto flex items-center justify-center">
              <img
                src={ytResult.thumbnails[selectedThumbRes]}
                alt="Full thumbnail view"
                className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-2xl"
              />
            </div>

            <div className="flex justify-end w-full gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  handleDownloadThumbnail(ytResult.thumbnails[selectedThumbRes], selectedThumbRes)
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Save This Thumbnail</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
