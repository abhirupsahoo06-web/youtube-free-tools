import React from 'react'
import { UPCOMING_TOOLS_PLACEHOLDERS } from '../../config/toolsRegistry'
import {
  Sparkles,
  Image,
  Tag,
  Clock,
  BarChart3,
  Layout,
  Lock,
  Hourglass,
  Layers,
} from 'lucide-react'

// Icon mapping helper
const iconMap: Record<string, React.ElementType> = {
  Sparkles,
  Image,
  Tag,
  Clock,
  BarChart3,
  Layout,
}

export const ToolsSection: React.FC = () => {
  return (
    <section id="tools" className="relative py-24 sm:py-32 scroll-mt-20">
      {/* Background Subtle Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-red-600/[0.04] blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>Platform Directory</span>
          </div>

          {/* Exact Section Title */}
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            YouTube Free Tools
          </h2>

          {/* Exact Placeholder Heading */}
          <h3 className="mt-4 text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-400 via-rose-300 to-white bg-clip-text text-transparent">
            Powerful creator tools are coming soon.
          </h3>

          {/* Short description */}
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            We are actively designing a modular suite of free, lightweight utilities to streamline your channel
            workflow. Tools are currently under development and will be released here incrementally.
          </p>
        </div>

        {/* Placeholder Status Banner */}
        <div className="mb-12 max-w-3xl mx-auto rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 sm:p-6 backdrop-blur-md flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex-shrink-0">
            <Hourglass className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white">Version 1 Preview State</h4>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Individual tools are being crafted with clean client-side performance. Below is a preview of the upcoming creator suite.
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Tools Locked</span>
            </span>
          </div>
        </div>

        {/* Grid of Non-Functional Placeholder Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {UPCOMING_TOOLS_PLACEHOLDERS.map((tool) => {
            const IconComponent = iconMap[tool.iconName] || Sparkles

            return (
              <div
                key={tool.id}
                className="group relative rounded-2xl bg-[#14151e]/70 border border-white/[0.08] p-6 sm:p-7 backdrop-blur-md transition-all duration-300 hover:border-red-500/30 hover:bg-[#181926]/90 flex flex-col justify-between"
              >
                {/* Top Card Bar */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-5">
                    {/* Tool Category Badge */}
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {tool.category}
                    </span>

                    {/* Prominent Coming Soon Badge */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/25">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                      Coming Soon
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-3">
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-red-400 group-hover:text-red-300 group-hover:scale-105 transition-all duration-200">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                        {tool.title}
                      </h4>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-400 leading-relaxed mt-2">
                    {tool.description}
                  </p>
                </div>

                {/* Card Footer / Non-functional Indicator */}
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    {tool.tags?.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-white/[0.03] text-[11px] text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>In Development</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Assurance Note */}
        <div className="mt-16 text-center">
          <p className="text-xs sm:text-sm text-slate-400">
            Have a specific tool you'd like to see included? All future tools will remain <span className="text-white font-medium">100% free</span> for creators.
          </p>
        </div>
      </div>
    </section>
  )
}
