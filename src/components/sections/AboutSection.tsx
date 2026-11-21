import React from 'react'
import { CheckCircle2, Shield, Zap, Sparkles, HeartHandshake, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const pillars = [
  {
    icon: Sparkles,
    title: 'Creator-Centric Design',
    description: 'Focused on speed, simplicity, and clean workflows. Zero learning curves or cluttered menus.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
  },
  {
    icon: HeartHandshake,
    title: '100% Free Forever',
    description: 'No subscriptions, no watermarks, no tokens, and no hidden charges. Free for every creator.',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    border: 'border-rose-200 dark:border-rose-500/20',
  },
  {
    icon: Zap,
    title: 'Instant Client-Side Speed',
    description: 'Processing runs locally in your browser. Fast rendering with zero waiting for servers.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-200 dark:border-blue-500/20',
  },
  {
    icon: Shield,
    title: 'Privacy By Design',
    description: 'Your media never leaves your machine. We do not store, upload, or inspect your files.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/20',
  },
]

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="relative py-24 sm:py-32 border-t border-slate-200 dark:border-white/[0.06] scroll-mt-24">
      {/* Background glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-red-600/[0.04] dark:bg-red-500/[0.05] blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 items-start">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>About The Platform</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                Empowering Creators with{' '}
                <span className="bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent">
                  Frictionless
                </span>{' '}
                Utilities
              </h2>
            </div>

            <div className="space-y-5 text-slate-600 dark:text-slate-400">
              <p className="text-lg sm:text-xl leading-relaxed">
                <span className="text-slate-900 dark:text-white font-bold">YouTube Free Tools</span> is a free collection
                of creator utilities built to make everyday YouTube content creation faster and easier.
              </p>
              <p className="text-base leading-relaxed">
                Whether you need to frame a 16:9 video into a 9:16 Short, crop a thumbnail, extract audio, or analyze a
                YouTube link — our tools work directly in your browser with maximum speed and zero friction.
              </p>
            </div>

            {/* Check list */}
            <div className="space-y-3">
              {[
                'No login or account registration required',
                'Client-side, private media processing',
                'Free for creators of all channel sizes',
                'No watermarks, subscriptions, or limits',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center flex-shrink-0">
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

          {/* Right Column — Pillars */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {pillars.map((pillar) => {
              const Icon = pillar.icon
              return (
                <div
                  key={pillar.title}
                  className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.14] shadow-sm hover:shadow-md dark:hover:shadow-black/20 transition-all duration-200 group"
                >
                  <div className={`w-11 h-11 rounded-xl ${pillar.bg} border ${pillar.border} flex items-center justify-center ${pillar.color} mb-4 group-hover:scale-105 transition-transform duration-200`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{pillar.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{pillar.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
