import React from 'react'
import { Link } from 'react-router-dom'
import { Video, Image, Search, FileCode, ArrowRight, Sparkles, CheckCircle2, Clock, Music, Zap, Wand2 } from 'lucide-react'

type ToolCard = {
  title: string
  subtitle: string
  description: string
  tags: string[]
  route: string
  icon: React.ElementType
  badge: string
  badgeColor: 'green' | 'blue' | 'red'
  featured?: boolean
}

const tools: ToolCard[] = [
  {
    title: 'Video Quality Enhancer',
    subtitle: 'Upscale & enhance up to 4K UHD',
    description:
      'Enhance video resolution up to 4K UHD using FFmpeg Lanczos scaling or configured Real-ESRGAN AI super-resolution while preserving original aspect ratio and audio sync.',
    tags: ['Original', '720p HD', '1080p FHD', '1440p QHD', '4K UHD', 'H.264 / H.265'],
    route: '/tools/video-enhancer',
    icon: Wand2,
    badge: 'New • Up to 4K',
    badgeColor: 'red',
    featured: true,
  },
  {
    title: 'YouTube Link Analyzer',
    subtitle: 'Inspect, preview & embed',
    description:
      'Analyze any YouTube link to inspect video metadata, HD thumbnails, responsive embed codes, and authorized media download utilities.',
    tags: ['Metadata', 'HD Thumbnails', 'Embed Generator', 'Media Hub'],
    route: '/tools/youtube-analyzer',
    icon: Search,
    badge: 'Most Popular',
    badgeColor: 'green',
  },
  {
    title: 'Video Cropper',
    subtitle: 'Crop for every platform',
    description:
      'Crop your videos to the exact aspect ratio for YouTube, Shorts, TikTok, and Reels with an 8-handle interactive frame directly in your browser.',
    tags: ['16:9 Landscape', '9:16 Shorts', '1:1 Square', '4:5 Portrait', 'Free Crop'],
    route: '/tools/video-cropper',
    icon: Video,
    badge: '8-Handle Resizer',
    badgeColor: 'green',
  },
  {
    title: 'Image Cropper',
    subtitle: 'Thumbnail & channel art',
    description:
      'Crop and resize images for thumbnails, channel art, and community posts. Supports PNG, JPG, and WebP with zoom, rotation, and flip controls.',
    tags: ['16:9 Thumbnail', '9:16 Shorts', '1:1 Avatar', 'PNG / JPG / WebP'],
    route: '/tools/image-cropper',
    icon: Image,
    badge: '8-Handle Resizer',
    badgeColor: 'green',
  },
  {
    title: 'Video to Audio',
    subtitle: 'Extract MP3, WAV & M4A',
    description:
      'Upload any local video file and extract high-quality audio tracks directly in your browser. Zero server uploads, zero quality loss.',
    tags: ['MP3 (128–320k)', 'WAV Lossless', 'M4A (AAC)', 'Client-Side'],
    route: '/tools/video-to-audio',
    icon: Music,
    badge: '100% In-Browser',
    badgeColor: 'blue',
  },
  {
    title: 'Local Video Converter',
    subtitle: 'Convert & extract in-browser',
    description:
      'Convert your local video files to WebM, MP4, or extract WAV audio locally. Fast browser-native conversion with no server round-trips.',
    tags: ['WebM', 'MP4', 'WAV Extract', 'Direct Upload', 'Client-Side'],
    route: '/tools/video-converter',
    icon: FileCode,
    badge: 'Local Direct Upload',
    badgeColor: 'blue',
  },
]

const badgeStyles = {
  green: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  red: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
}

export const ToolsSection: React.FC = () => {
  return (
    <section id="tools" className="relative py-20 sm:py-28 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="glass-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-red-600 dark:text-red-400 text-xs font-bold tracking-widest uppercase mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Creator Toolkit</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
            All Tools, Zero{' '}
            <span className="text-red-600 dark:text-red-500">
              Compromise
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Precision media editing, analysis, and up to 4K video enhancement designed for modern YouTube workflows.
          </p>

          {/* Stats Row */}
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-6 sm:gap-10 px-6 py-3 rounded-2xl glass-surface text-sm">
            {[
              { value: '6', label: 'Active Tools' },
              { value: '4K', label: 'Max Output' },
              { value: '0', label: 'Sign-ups' },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">{value}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <div
                key={tool.route}
                className={`glass-surface glass-interactive group relative rounded-3xl overflow-hidden flex flex-col ${
                  tool.featured ? 'md:col-span-2' : ''
                }`}
              >
                <div className={`p-7 sm:p-8 flex flex-col flex-1 ${tool.featured ? 'sm:flex-row sm:gap-10 sm:items-start' : ''}`}>
                  <div className={`flex items-start justify-between gap-4 mb-5 ${tool.featured ? 'sm:flex-col sm:mb-0 sm:items-start sm:justify-start sm:gap-4 sm:min-w-[190px]' : ''}`}>
                    <div className="flex items-center gap-3.5">
                      <div className="glass-inset w-13 h-13 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      {!tool.featured && (
                        <div className="sm:hidden">
                          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">{tool.title}</h3>
                          <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-0.5">{tool.subtitle}</p>
                        </div>
                      )}
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeStyles[tool.badgeColor]} flex-shrink-0`}>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{tool.badge}</span>
                    </span>
                  </div>

                  <div className="flex flex-col flex-1">
                    <h3 className={`font-extrabold text-slate-900 dark:text-white tracking-tight ${tool.featured ? 'text-2xl sm:text-3xl' : 'hidden sm:block text-xl sm:text-2xl'}`}>
                      {tool.title}
                    </h3>
                    <p className={`font-semibold text-red-600 dark:text-red-400 mt-1 ${tool.featured ? 'text-sm sm:text-base' : 'hidden sm:block text-sm'}`}>
                      {tool.subtitle}
                    </p>

                    <p className={`text-slate-600 dark:text-slate-300 leading-relaxed mt-3 ${tool.featured ? 'text-sm sm:text-base max-w-xl' : 'text-sm'}`}>
                      {tool.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {tool.tags.map((tag) => (
                        <span
                          key={tag}
                          className="glass-inset px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-7 pt-5 border-t border-slate-200/70 dark:border-white/[0.08]">
                      <Link
                        to={tool.route}
                        className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 ${
                          tool.featured
                            ? 'w-full sm:w-auto text-sm sm:text-base text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-600/20'
                            : 'glass-pill glass-interactive w-full text-sm text-slate-900 dark:text-white'
                        }`}
                      >
                        <span>Open {tool.title}</span>
                        <ArrowRight className={`w-4 h-4 ${tool.featured ? '' : 'text-red-500'}`} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Coming Soon Glass Banner */}
        <div className="glass-surface mt-12 max-w-5xl mx-auto rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="glass-inset w-12 h-12 rounded-2xl text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">More creator tools in development</h4>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Additional utilities including subtitle timing editors and thumbnail A/B previewers are planned next.
            </p>
          </div>
          <div className="glass-pill px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium flex-shrink-0">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Active Roadmap</span>
          </div>
        </div>
      </div>
    </section>
  )
}
