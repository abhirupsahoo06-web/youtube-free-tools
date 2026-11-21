import React from 'react'
import { Link } from 'react-router-dom'
import { Video, Image, Search, FileCode, ArrowRight, Sparkles, CheckCircle2, Clock, Music, Zap } from 'lucide-react'

type ToolCard = {
  title: string
  subtitle: string
  description: string
  tags: string[]
  route: string
  icon: React.ElementType
  badge: string
  badgeColor: 'green' | 'blue'
  topBarColor: string
  featured?: boolean
}

const tools: ToolCard[] = [
  {
    title: 'YouTube Link Analyzer',
    subtitle: 'Inspect, preview & embed',
    description:
      'Analyze any YouTube link to get video metadata, HD thumbnails, embed code generator, and official download resources.',
    tags: ['Metadata', 'HD Thumbnails', 'Embed Generator', 'Download Hub'],
    route: '/tools/youtube-analyzer',
    icon: Search,
    badge: 'Most Popular',
    badgeColor: 'green',
    topBarColor: 'from-red-600 via-rose-500 to-amber-500',
    featured: true,
  },
  {
    title: 'Video Cropper',
    subtitle: 'Crop for every platform',
    description:
      'Crop your videos to the perfect aspect ratio for YouTube, Shorts, TikTok, Reels and more — all inside your browser.',
    tags: ['16:9 Landscape', '9:16 Shorts', '1:1 Square', '4:5 Portrait', 'Free Crop'],
    route: '/tools/video-cropper',
    icon: Video,
    badge: '8-Handle Resizer',
    badgeColor: 'green',
    topBarColor: 'from-red-600 to-rose-600',
  },
  {
    title: 'Image Cropper',
    subtitle: 'Thumbnail & channel art',
    description:
      'Crop and resize images for thumbnails, channel art, and social posts. Supports PNG, JPG, and WebP with zoom & rotate.',
    tags: ['16:9 Thumbnail', '9:16 Shorts', '1:1 Avatar', 'PNG/JPG/WebP', 'Zoom & Rotate'],
    route: '/tools/image-cropper',
    icon: Image,
    badge: '8-Handle Resizer',
    badgeColor: 'green',
    topBarColor: 'from-rose-600 to-pink-600',
  },
  {
    title: 'Video to Audio',
    subtitle: 'Extract MP3, WAV & M4A',
    description:
      'Upload any local video file and extract high-quality audio tracks directly in your browser. Zero server uploads, zero quality loss.',
    tags: ['MP3 (128–320k)', 'WAV Lossless', 'M4A (AAC)', 'Direct Upload', 'Client-Side'],
    route: '/tools/video-to-audio',
    icon: Music,
    badge: '100% In-Browser',
    badgeColor: 'blue',
    topBarColor: 'from-violet-500 to-purple-600',
  },
  {
    title: 'Local Video Converter',
    subtitle: 'Convert & extract in-browser',
    description:
      'Convert your local video files to WebM, MP4, or extract audio locally. Fast browser-native conversion with no server round-trips.',
    tags: ['WebM', 'MP4', 'WAV Extract', 'Direct Upload', 'Client-Side'],
    route: '/tools/video-converter',
    icon: FileCode,
    badge: 'Local Direct Upload',
    badgeColor: 'blue',
    topBarColor: 'from-amber-500 to-orange-500',
  },
]

const badgeStyles = {
  green: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
}

export const ToolsSection: React.FC = () => {
  return (
    <section id="tools" className="relative py-24 sm:py-32 scroll-mt-24">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-red-600/[0.04] dark:bg-red-500/[0.06] blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/8 dark:bg-red-500/12 border border-red-500/20 dark:border-red-500/25 text-red-600 dark:text-red-400 text-xs font-bold tracking-widest uppercase mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Free Creator Toolkit</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
            All Tools, Zero{' '}
            <span className="bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent">
              Compromise
            </span>
          </h2>

          <p className="mt-5 text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            High-speed, browser-native media editing for YouTube creators. No servers, no sign-ups, no limits.
          </p>

          {/* Stats Row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm">
            {[
              { value: '5', label: 'Free Tools' },
              { value: '100%', label: 'In-Browser' },
              { value: '0', label: 'Sign-ups' },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tools Grid — featured on top, then 2-col */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <div
                key={tool.route}
                className={`group relative rounded-3xl bg-white dark:bg-[#13141e] border border-slate-200/80 dark:border-white/[0.07] shadow-sm hover:shadow-xl dark:hover:shadow-black/40 hover:border-slate-300 dark:hover:border-white/[0.14] transition-all duration-300 overflow-hidden flex flex-col ${tool.featured ? 'md:col-span-2' : ''}`}
              >
                {/* Top color accent bar */}
                <div className={`h-1 bg-gradient-to-r ${tool.topBarColor} opacity-85`} />

                {/* Card body */}
                <div className={`p-7 sm:p-8 flex flex-col flex-1 ${tool.featured ? 'sm:flex-row sm:gap-10 sm:items-start' : ''}`}>
                  {/* Icon + badge row */}
                  <div className={`flex items-start justify-between gap-4 mb-6 ${tool.featured ? 'sm:flex-col sm:mb-0 sm:items-start sm:justify-start sm:gap-5 sm:min-w-[200px]' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-red-50 dark:from-white/[0.04] dark:to-red-500/10 border border-slate-200 dark:border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 shadow-sm group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      {!tool.featured && (
                        <div className="sm:hidden">
                          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">{tool.title}</h3>
                          <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-0.5">{tool.subtitle}</p>
                        </div>
                      )}
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${badgeStyles[tool.badgeColor]} flex-shrink-0`}>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{tool.badge}</span>
                    </span>
                  </div>

                  {/* Text content */}
                  <div className="flex flex-col flex-1">
                    <h3 className={`font-extrabold text-slate-900 dark:text-white tracking-tight hidden sm:block ${tool.featured ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'}`}>
                      {tool.title}
                    </h3>
                    <p className={`font-semibold text-red-600 dark:text-red-400 mt-1 hidden sm:block ${tool.featured ? 'text-base' : 'text-sm'}`}>
                      {tool.subtitle}
                    </p>

                    <p className={`text-slate-500 dark:text-slate-400 leading-relaxed mt-3 ${tool.featured ? 'text-base sm:text-lg max-w-lg' : 'text-sm'}`}>
                      {tool.description}
                    </p>

                    {/* Tags */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {tool.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-7 pt-6 border-t border-slate-100 dark:border-white/[0.05]">
                      <Link
                        to={tool.route}
                        className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                          tool.featured
                            ? 'w-full sm:w-auto text-base text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-600/25 hover:shadow-red-500/40'
                            : 'w-full text-sm text-slate-800 dark:text-white bg-slate-100 dark:bg-white/[0.07] hover:bg-slate-200 dark:hover:bg-white/[0.12] border border-slate-200 dark:border-white/[0.1]'
                        }`}
                      >
                        <span>Open {tool.title}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Coming Soon Banner */}
        <div className="mt-14 max-w-5xl mx-auto rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-white/[0.02] dark:to-white/[0.03] border border-dashed border-slate-300 dark:border-white/[0.08] p-7 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-bold text-slate-800 dark:text-white">More tools coming soon</h4>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              We're actively building additional browser-native utilities — subtitle editors, thumbnail generators, and more.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium flex-shrink-0">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Actively in development</span>
          </div>
        </div>
      </div>
    </section>
  )
}
