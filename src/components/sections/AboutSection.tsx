import React from 'react'
import { CheckCircle2, Shield, Zap, Sparkles, HeartHandshake, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const pillars = [
  {
    icon: Sparkles,
    title: 'Creator-Centric Design',
    description: 'Focused on speed, simplicity, and clean workflows. Zero learning curves or cluttered menus.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: HeartHandshake,
    title: '100% Free Forever',
    description: 'No subscriptions, no watermarks, no tokens, and no hidden charges. Free for every creator.',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500/10',
  },
  {
    icon: Zap,
    title: 'Fast Media Pipelines',
    description: 'Instant in-browser editing for crops & audio plus scalable FFmpeg/GPU workers for up to 4K enhancement.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Shield,
    title: 'Privacy By Design',
    description: 'Browser tools keep files on your device; cloud upscaling uses signed URLs and automatic temporary file deletion.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
]

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="relative py-20 sm:py-28 border-t border-slate-200/70 dark:border-white/[0.08] scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-7">
            <div>
              <div className="glass-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>About The Platform</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                Empowering Creators with{' '}
                <span className="text-red-600 dark:text-red-500">
                  Frictionless
                </span>{' '}
                Utilities
              </h2>
            </div>

            <div className="space-y-4 text-slate-600 dark:text-slate-300">
              <p className="text-lg leading-relaxed">
                <span className="text-slate-900 dark:text-white font-bold">YouTube Free Tools</span> is a free collection
                of creator utilities built to make everyday YouTube content creation faster and easier.
              </p>
              <p className="text-base leading-relaxed">
                Whether you need to frame a 16:9 video into a 9:16 Short, crop a thumbnail, extract audio, analyze a
                YouTube link, or enhance footage up to 4K UHD — every tool stays intuitive and distraction-free.
              </p>
            </div>

            <div className="space-y-3">
              {[
                'No login or account registration required',
                'Client-side media editing for crops, audio & images',
                'Signed S3 URLs & automatic retention cleanup for 4K upscaling',
                'No watermarks, subscriptions, or hidden limits',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <Link
              to="/#tools"
              className="inline-flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors group"
            >
              <span>Explore all tools</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Right Column — Glass Pillars */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {pillars.map((pillar) => {
              const Icon = pillar.icon
              return (
                <div
                  key={pillar.title}
                  className="glass-surface glass-interactive p-6 rounded-2xl group"
                >
                  <div className={`w-11 h-11 rounded-xl ${pillar.bg} border border-slate-200/60 dark:border-white/10 flex items-center justify-center ${pillar.color} mb-4 group-hover:scale-105 transition-transform duration-200`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{pillar.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{pillar.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
