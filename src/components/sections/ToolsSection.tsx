import React from 'react'
import { COMING_SOON_PLACEHOLDERS } from '../../config/toolsRegistry'
import { Sparkles, Clock } from 'lucide-react'

export const ToolsSection: React.FC = () => {
  return (
    <section id="tools" className="relative py-24 sm:py-32 scroll-mt-20">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-600/[0.04] blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tools</span>
          </div>

          {/* Exact Section Title */}
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            YouTube Free Tools
          </h2>

          {/* Exact Required Placeholder Heading */}
          <h3 className="mt-4 text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-400 via-rose-300 to-white bg-clip-text text-transparent">
            Powerful creator tools are coming soon.
          </h3>

          {/* Short description */}
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            More free tools will be added soon to help creators manage, optimize, and streamline their YouTube workflow.
          </p>
        </div>

        {/* 4 Non-Functional Placeholder Cards Labeled "Coming Soon" */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {COMING_SOON_PLACEHOLDERS.map((placeholder) => (
            <div
              key={placeholder.id}
              className="relative rounded-2xl bg-[#14151e]/60 border border-white/[0.08] p-8 backdrop-blur-md flex flex-col items-center justify-center text-center min-h-[220px] transition-all duration-300 hover:border-red-500/30 hover:bg-[#181926]/70 group select-none"
            >
              {/* Subtle Ambient Icon */}
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-400 mb-5 group-hover:text-red-400 group-hover:border-red-500/20 transition-all duration-300">
                <Clock className="w-6 h-6 opacity-75" />
              </div>

              {/* Exact Card Label */}
              <h4 className="text-lg font-bold text-white tracking-tight mb-2">
                {placeholder.label}
              </h4>

              {/* Status Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse" />
                Coming Soon
              </span>

              {/* Visual wireframe placeholder lines */}
              <div className="mt-5 w-full flex flex-col items-center gap-1.5 opacity-30">
                <div className="h-1.5 w-24 bg-white/20 rounded-full" />
                <div className="h-1.5 w-16 bg-white/10 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Informational Subtext */}
        <div className="mt-12 text-center">
          <p className="text-xs sm:text-sm text-slate-500">
            Check back soon for the upcoming tools release.
          </p>
        </div>
      </div>
    </section>
  )
}
