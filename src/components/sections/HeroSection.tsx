import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, Sparkles, Zap, ShieldCheck, Video, Image, Search, Music, FileCode, Wand2 } from 'lucide-react'

const tools = [
  { label: '4K Video Enhancer', route: '/tools/video-enhancer', icon: Wand2 },
  { label: 'Link Analyzer', route: '/tools/youtube-analyzer', icon: Search },
  { label: 'Video Cropper', route: '/tools/video-cropper', icon: Video },
  { label: 'Image Cropper', route: '/tools/image-cropper', icon: Image },
  { label: 'Video to Audio', route: '/tools/video-to-audio', icon: Music },
  { label: 'Video Converter', route: '/tools/video-converter', icon: FileCode },
]

export const HeroSection: React.FC = () => {
  const scrollToTools = () => {
    const el = document.getElementById('tools')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      id="home"
      className="relative pt-14 pb-20 md:pt-20 md:pb-28 overflow-hidden flex flex-col items-center justify-center text-center"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Top Glass Pill Badge */}
        <div className="glass-pill inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 mb-9">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-slate-900 dark:text-white font-semibold">Creator Studio Suite</span>
          <span className="hidden sm:inline text-slate-300 dark:text-white/20">|</span>
          <span className="hidden sm:inline text-slate-600 dark:text-slate-300">Fast, Private & Up to 4K UHD</span>
        </div>

        {/* Hero Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.06] max-w-4xl">
          Free Tools for{' '}
          <span className="text-red-600 dark:text-red-500">
            YouTube
          </span>{' '}
          Creators
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed">
          Enhance videos up to 4K, crop for Shorts, edit thumbnails, analyze links, and extract audio —{' '}
          <span className="text-slate-900 dark:text-white font-medium">crafted in a clean, fast workspace.</span>
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3.5">
          <button
            type="button"
            onClick={scrollToTools}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white bg-red-600 hover:bg-red-500 transition-all duration-200 shadow-lg shadow-red-600/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explore All Tools</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>

          <Link
            to="/tools/video-enhancer"
            className="glass-surface glass-interactive w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-base font-semibold text-slate-800 dark:text-white"
          >
            <Wand2 className="w-4 h-4 text-red-500" />
            <span>4K Video Enhancer</span>
          </Link>
        </div>

        {/* Quick Tool Glass Pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {tools.map(({ label, route, icon: Icon }) => (
            <Link
              key={route}
              to={route}
              className="glass-pill glass-interactive inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400"
            >
              <Icon className="w-3 h-3 text-red-500" />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* Trust Strip */}
        <div className="glass-surface mt-12 px-6 py-3.5 rounded-2xl flex flex-wrap items-center justify-center gap-6 sm:gap-9 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium">100% Free Forever</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="font-medium">Zero Sign-Up Required</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium">Privacy-First Architecture</span>
          </div>
        </div>
      </div>
    </section>
  )
}
