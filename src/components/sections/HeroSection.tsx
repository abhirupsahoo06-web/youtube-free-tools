import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, Sparkles, Zap, ShieldCheck, Video, Image, Search, Music, FileCode } from 'lucide-react'

const tools = [
  { label: 'Video Cropper', route: '/tools/video-cropper', icon: Video },
  { label: 'Image Cropper', route: '/tools/image-cropper', icon: Image },
  { label: 'Link Analyzer', route: '/tools/youtube-analyzer', icon: Search },
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
      className="relative pt-14 pb-24 md:pt-20 md:pb-32 overflow-hidden flex flex-col items-center justify-center text-center"
    >
      {/* Background — multi-layer ambient glows */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-red-600/20 via-rose-500/8 to-transparent blur-[130px] rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-gradient-to-tr from-orange-500/8 to-transparent blur-[100px] rounded-full" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-rose-600/8 to-transparent blur-[100px] rounded-full" />
      </div>

      {/* Dot-grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] pointer-events-none -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Top Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 backdrop-blur-sm mb-10 shadow-sm shadow-black/5 dark:shadow-black/20">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-slate-900 dark:text-white font-semibold">100% In-Browser Processing</span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-500 dark:text-slate-400">Zero Upload Required</span>
        </div>

        {/* Hero Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.05] max-w-4xl">
          Free Tools for{' '}
          <span className="relative">
            <span className="bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent">
              YouTube
            </span>
          </span>
          {' '}Creators
        </h1>

        {/* Subtitle */}
        <p className="mt-7 text-lg sm:text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-2xl font-normal leading-relaxed">
          Crop videos, edit thumbnails, analyze links, and extract audio —{' '}
          <span className="text-slate-700 dark:text-slate-200 font-medium">all in your browser, all for free.</span>
        </p>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <button
            type="button"
            onClick={scrollToTools}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all duration-300 shadow-xl shadow-red-600/35 hover:shadow-red-500/50 hover:-translate-y-1 active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-500/50"
          >
            <Sparkles className="w-5 h-5" />
            <span>Explore All Tools</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>

          <Link
            to="/tools/youtube-analyzer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-base font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] hover:bg-slate-50 dark:hover:bg-white/[0.09] transition-all duration-200 shadow-sm hover:-translate-y-0.5"
          >
            <Search className="w-4 h-4 text-red-500" />
            <span>YouTube Link Analyzer</span>
          </Link>
        </div>

        {/* Quick Tool Pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5">
          {tools.map(({ label, route, icon: Icon }) => (
            <Link
              key={route}
              to={route}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all duration-200"
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="w-7 h-7 rounded-full bg-green-50 dark:bg-emerald-500/10 border border-green-200 dark:border-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-300">100% Free Forever</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-300">Zero Sign-Up Required</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-300">Private & Local Processing</span>
          </div>
        </div>
      </div>
    </section>
  )
}
