import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, Sparkles, Zap, ShieldCheck, Video, Image } from 'lucide-react'

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
      className="relative pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden flex flex-col items-center justify-center text-center"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[750px] h-[350px] bg-gradient-to-tr from-red-600/15 via-rose-600/10 to-transparent blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Decorative Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] pointer-events-none -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Top Tag / Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 backdrop-blur-md mb-8 shadow-sm hover:border-red-500/40 transition-colors">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-slate-900 dark:text-white font-semibold">100% In-Browser</span>
          <span className="text-slate-400 dark:text-slate-500">•</span>
          <span className="text-slate-600 dark:text-slate-300">Fast & Zero Upload Latency</span>
        </div>

        {/* Hero Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl">
          Free Tools for{' '}
          <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-500 bg-clip-text text-transparent">
            YouTube Creators
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed">
          Simple, fast and free tools to create, edit and optimize your YouTube content.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <button
            type="button"
            onClick={scrollToTools}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all duration-300 shadow-xl shadow-red-600/30 hover:shadow-red-500/50 hover:-translate-y-1 active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-500/50 cursor-pointer"
          >
            <span>Explore Tools</span>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </button>

          <div className="flex items-center gap-2">
            <Link
              to="/tools/video-cropper"
              className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-300 dark:border-white/[0.1] transition-all"
            >
              <Video className="w-4 h-4 text-red-500" />
              <span>Video Cropper</span>
            </Link>

            <Link
              to="/tools/image-cropper"
              className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-300 dark:border-white/[0.1] transition-all"
            >
              <Image className="w-4 h-4 text-red-500" />
              <span>Image Cropper</span>
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">100% Free Forever</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Zero Sign-Up Required</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Privacy-First (Local Browser Processing)</span>
          </div>
        </div>
      </div>
    </section>
  )
}
