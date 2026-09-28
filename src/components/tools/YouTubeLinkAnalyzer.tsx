import React, { useState } from 'react'
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
  Play,
  Layers,
  ArrowDown,
  Music
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

export const YouTubeLinkAnalyzer: React.FC = () => {
  const [inputUrl, setInputUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [selectedThumbRes, setSelectedThumbRes] = useState<'maxres' | 'hq' | 'mq'>('maxres')
  const [showThumbModal, setShowThumbModal] = useState<boolean>(false)

  // Embed customization options
  const [startTime, setStartTime] = useState<string>('0')
  const [endTime, setEndTime] = useState<string>('')
  const [autoplay, setAutoplay] = useState<boolean>(false)
  const [showControls, setShowControls] = useState<boolean>(true)
  const [loop, setLoop] = useState<boolean>(false)

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Paste Link from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setInputUrl(text.trim())
        setErrorMsg(null)
      }
    } catch {
      setErrorMsg('Could not access clipboard. Please paste manually into the input box.')
    }
  }

  // Extract YouTube Video ID from supported formats
  const extractVideoId = (url: string): string | null => {
    const cleanUrl = url.trim()

    // 1. youtube.com/watch?v=ID
    const watchRegex = /(?:youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/
    const watchMatch = cleanUrl.match(watchRegex)
    if (watchMatch) return watchMatch[1]

    // 2. youtu.be/ID
    const shortRegex = /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const shortMatch = cleanUrl.match(shortRegex)
    if (shortMatch) return shortMatch[1]

    // 3. youtube.com/shorts/ID
    const shortsRegex = /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    const shortsMatch = cleanUrl.match(shortsRegex)
    if (shortsMatch) return shortsMatch[1]

    // 4. youtube.com/embed/ID
    const embedRegex = /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
    const embedMatch = cleanUrl.match(embedRegex)
    if (embedMatch) return embedMatch[1]

    // 5. Direct 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
      return cleanUrl
    }

    return null
  }

  // Analyze URL action
  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorMsg(null)

    if (!inputUrl.trim()) {
      setErrorMsg('Please enter a YouTube video URL.')
      return
    }

    const videoId = extractVideoId(inputUrl)
    if (!videoId) {
      setErrorMsg('Invalid YouTube URL. Please provide a valid watch, youtu.be, shorts, or embed link.')
      return
    }

    setIsLoading(true)
    const canonical = `https://www.youtube.com/watch?v=${videoId}`
    const embed = `https://www.youtube.com/embed/${videoId}`

    // Fetch official public oEmbed data
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
        setErrorMsg('Notice: This video may be private, restricted, or unavailable on YouTube.')
      }

      setAnalysisResult({
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
      // Offline or network fallback
      setAnalysisResult({
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
      setIsLoading(false)
    }
  }

  // Construct iframe embed code
  const getEmbedCode = (): string => {
    if (!analysisResult) return ''

    const params = new URLSearchParams()
    const startSec = parseInt(startTime) || 0
    if (startSec > 0) params.set('start', startSec.toString())

    const endSec = parseInt(endTime) || 0
    if (endSec > 0) params.set('end', endSec.toString())

    if (autoplay) params.set('autoplay', '1')
    if (!showControls) params.set('controls', '0')
    if (loop) {
      params.set('loop', '1')
      params.set('playlist', analysisResult.videoId)
    }

    const query = params.toString() ? `?${params.toString()}` : ''
    const fullEmbedUrl = `${analysisResult.embedUrl}${query}`

    return `<iframe width="560" height="315" src="${fullEmbedUrl}" title="${analysisResult.title.replace(/"/g, '&quot;')}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
  }

  // Download thumbnail image safely
  const handleDownloadThumbnail = async (url: string, resName: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${analysisResult?.videoId || 'video'}-thumbnail-${resName}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      // Direct fallback
      window.open(url, '_blank')
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-white/[0.08]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Creator Utility Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          YouTube Link Analyzer
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
          Paste a YouTube URL to analyze the video and access creator tools.
        </p>
      </div>

      {/* URL Input Form Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] shadow-sm">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Enter YouTube Video Link
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value)
                  setErrorMsg(null)
                }}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full pl-4 pr-10 py-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-mono"
              />
              {inputUrl && (
                <button
                  type="button"
                  onClick={() => setInputUrl('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePaste}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-300 dark:border-white/10 transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Paste Link</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all shadow-md shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
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

          <div className="text-xs text-slate-400 flex flex-wrap gap-2 items-center pt-1">
            <span className="font-semibold text-slate-500">Supported formats:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04]">youtube.com/watch?v=</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04]">youtu.be/</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04]">youtube.com/shorts/</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04]">youtube.com/embed/</span>
          </div>
        </form>

        {errorMsg && (
          <div className="mt-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Video Information Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] shadow-sm">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Thumbnail Display */}
              <div className="w-full lg:w-80 flex-shrink-0 group relative rounded-2xl overflow-hidden shadow-md aspect-video bg-slate-900 border border-slate-200 dark:border-white/10">
                <img
                  src={analysisResult.thumbnails[selectedThumbRes]}
                  alt={analysisResult.title}
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

              {/* Video Metadata & Quick Action Buttons */}
              <div className="flex-1 space-y-4">
                <div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                    YouTube Video
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-2 leading-tight">
                    {analysisResult.title}
                  </h2>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">
                    Channel: <span className="text-slate-900 dark:text-slate-200">{analysisResult.authorName}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                    <span className="text-slate-400 block font-sans text-[11px] mb-0.5">Video ID:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{analysisResult.videoId}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                    <span className="text-slate-400 block font-sans text-[11px] mb-0.5">Standard Link:</span>
                    <span className="text-slate-800 dark:text-slate-200 truncate block">youtu.be/{analysisResult.videoId}</span>
                  </div>
                </div>

                {/* The 4 Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <a
                    href={analysisResult.canonicalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open on YouTube</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopy(analysisResult.canonicalUrl, 'video-url')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-300 dark:border-white/10 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'video-url' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'video-url' ? 'Copied URL!' : 'Copy Video URL'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(analysisResult.embedUrl, 'embed-url')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-300 dark:border-white/10 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'embed-url' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'embed-url' ? 'Copied Embed!' : 'Copy Embed URL'}</span>
                  </button>

                  <a
                    href={analysisResult.embedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-300 dark:border-white/10 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-red-500" />
                    <span>Open Embed</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Download Video Section (Official YouTube Studio) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-red-500/[0.04] via-white to-slate-50 dark:from-red-500/[0.08] dark:via-[#14151f] dark:to-[#181928] border-2 border-red-500/25 dark:border-red-500/35 shadow-xl shadow-red-500/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 mb-2">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Official YouTube Studio</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Download Video
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1">
                  Download a video you own through the official YouTube Studio tools.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://studio.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 sm:px-10 sm:py-5 rounded-2xl text-base sm:text-lg font-extrabold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 transition-all shadow-xl shadow-red-600/35 hover:shadow-red-600/50 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                <span>Download Video</span>
              </a>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                Works for videos uploaded to your own channel.<br />
                For other videos, use YouTube’s official viewing and sharing options.
              </p>
            </div>
          </div>

          {/* Thumbnail Tools Section */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thumbnail Tools</h3>
              </div>
              <span className="text-xs text-slate-500">Public Creator Artworks</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              {/* Resolution options */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-slate-400 mr-1">Quality:</span>
                {(
                  [
                    { id: 'maxres', label: 'Max Resolution (1280×720)' },
                    { id: 'hq', label: 'High Quality (480×360)' },
                    { id: 'mq', label: 'Medium Quality (320×180)' },
                  ] as { id: 'maxres' | 'hq' | 'mq'; label: string }[]
                ).map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedThumbRes(id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedThumbRes === id
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-white dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Thumbnail Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowThumbModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-white bg-slate-200 dark:bg-white/[0.08] hover:bg-slate-300 dark:hover:bg-white/[0.14] transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Thumbnail</span>
                </button>

                <a
                  href={analysisResult.thumbnails[selectedThumbRes]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-white bg-slate-200 dark:bg-white/[0.08] hover:bg-slate-300 dark:hover:bg-white/[0.14] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Thumbnail</span>
                </a>

                <button
                  type="button"
                  onClick={() =>
                    handleDownloadThumbnail(
                      analysisResult.thumbnails[selectedThumbRes],
                      selectedThumbRes
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save Thumbnail</span>
                </button>
              </div>
            </div>
          </div>

          {/* Embed Generator Section */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Embed Code Generator</h3>
              </div>
              <span className="text-xs text-slate-500">Customizable Player Code</span>
            </div>

            {/* Customization Options Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Start Time (sec):</label>
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
                <label className="text-xs font-semibold text-slate-500 block mb-1">End Time (sec):</label>
                <input
                  type="number"
                  min="0"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-300 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white"
                  placeholder="Optional"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={autoplay}
                    onChange={(e) => setAutoplay(e.target.checked)}
                    className="accent-red-600 rounded"
                  />
                  <span>Autoplay</span>
                </label>
              </div>

              <div className="flex flex-col justify-end">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={showControls}
                    onChange={(e) => setShowControls(e.target.checked)}
                    className="accent-red-600 rounded"
                  />
                  <span>Show Controls</span>
                </label>
              </div>

              <div className="flex flex-col justify-end">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={loop}
                    onChange={(e) => setLoop(e.target.checked)}
                    className="accent-red-600 rounded"
                  />
                  <span>Loop Video</span>
                </label>
              </div>
            </div>

            {/* Generated Code Snippet */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">HTML IFrame Code:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(getEmbedCode(), 'embed-code')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-sm cursor-pointer"
                >
                  {copiedKey === 'embed-code' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'embed-code' ? 'Code Copied!' : 'Copy Embed Code'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                {getEmbedCode()}
              </pre>
            </div>

            {/* Live Embed Player Preview */}
            <div className="pt-2 space-y-2">
              <span className="text-xs font-bold uppercase text-slate-500 block">Live Player Preview:</span>
              <div className="rounded-2xl overflow-hidden aspect-video bg-black max-w-2xl mx-auto shadow-xl border border-slate-200 dark:border-white/10">
                <iframe
                  src={`${analysisResult.embedUrl}${startTime !== '0' ? `?start=${startTime}` : ''}`}
                  title={analysisResult.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          {/* 6. Convert My Video to Audio Section */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400">
                  <Music className="w-3.5 h-3.5" />
                  <span>Audio Utility</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Convert My Video to Audio
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Need to extract audio from a video? Upload a video file from your device and convert it to MP3, WAV, or M4A format 100% locally in your browser.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-slate-400">Supported audio outputs:</span>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08]">
                    MP3
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08]">
                    WAV
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08]">
                    M4A
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  to="/tools/video-to-audio"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-sm sm:text-base font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Music className="w-4 h-4 text-red-500" />
                  <span>Convert My Video to Audio</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Thumbnail Modal */}
      {showThumbModal && analysisResult && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowThumbModal(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl p-6 flex flex-col items-center gap-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white">
                Thumbnail Preview ({selectedThumbRes.toUpperCase()})
              </h4>
              <button
                type="button"
                onClick={() => setShowThumbModal(false)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded-lg"
              >
                ✕ Close
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto flex items-center justify-center">
              <img
                src={analysisResult.thumbnails[selectedThumbRes]}
                alt="Full thumbnail view"
                className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-2xl"
              />
            </div>

            <div className="flex justify-end w-full gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  handleDownloadThumbnail(
                    analysisResult.thumbnails[selectedThumbRes],
                    selectedThumbRes
                  )
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
