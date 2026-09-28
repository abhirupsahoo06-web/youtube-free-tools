import React from 'react'
import { ArrowDown, Sparkles, Zap, ShieldCheck, Play } from 'lucide-react'

export const HeroSection: React.FC = () => {
  return (
    <section
      id="home"
      className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden flex flex-col items-center justify-center text-center"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[750px] h-[350px] bg-gradient-to-tr from-red-600/15 via-rose-600/10 to-transparent blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[250px] bg-red-900/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Decorative Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Top Tag / Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs sm:text-sm font-medium text-slate-300 backdrop-blur-md mb-8 shadow-inner hover:border-red-500/40 transition-colors">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-white font-semibold">New Platform</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">Creator-First Utilities</span>
        </div>

        {/* Hero Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl">
          Free Tools for{' '}
          <span className="bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent">
            YouTube Creators
          </span>
        </h1>

        {/* Hero Subheading */}
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
          Simple, fast and free tools to help creators grow, optimize and manage their YouTube content.
        </p>

        {/* Primary CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <a
            href="#tools"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all duration-300 shadow-xl shadow-red-600/30 hover:shadow-red-500/50 hover:-translate-y-1 active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-500/50"
          >
            <span>Explore Tools</span>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </a>

          <a
            href="#about"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-base font-medium text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-white/[0.2] hover:text-white transition-all duration-200 backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <span>Learn About the Platform</span>
          </a>
        </div>

        {/* Feature Highlights Pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span className="text-slate-300 font-medium">100% Free Forever</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-slate-300 font-medium">Zero Sign-Up Required</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-300 font-medium">Privacy-Focused</span>
          </div>
        </div>

        {/* SaaS Dashboard Preview Shell */}
        <div className="mt-16 w-full max-w-4xl relative group">
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-red-600/30 via-rose-500/20 to-red-600/30 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition duration-1000 -z-10" />

          {/* Platform Shell Card */}
          <div className="relative rounded-2xl bg-[#12131b]/90 border border-white/[0.1] backdrop-blur-xl p-5 sm:p-7 shadow-2xl overflow-hidden text-left">
            {/* Window Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 text-xs font-mono text-slate-400 hidden sm:inline-block">
                  youtubefreetools.com • Creator Suite Shell
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                  Version 1.0 Ready
                </span>
              </div>
            </div>

            {/* Inner Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Video Suite</span>
                  <Play className="w-4 h-4 text-red-400" />
                </div>
                <div className="h-2 w-24 bg-white/10 rounded-full mt-1" />
                <div className="h-2 w-36 bg-white/5 rounded-full" />
                <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Optimization Tools</span>
                  <span className="text-[10px] text-red-400 font-medium">In Development</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Metadata Engine</span>
                  <Sparkles className="w-4 h-4 text-rose-400" />
                </div>
                <div className="h-2 w-28 bg-white/10 rounded-full mt-1" />
                <div className="h-2 w-20 bg-white/5 rounded-full" />
                <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">SEO & Tags</span>
                  <span className="text-[10px] text-red-400 font-medium">In Development</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Creator Workflow</span>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="h-2 w-32 bg-white/10 rounded-full mt-1" />
                <div className="h-2 w-24 bg-white/5 rounded-full" />
                <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Browser Utilities</span>
                  <span className="text-[10px] text-red-400 font-medium">In Development</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
