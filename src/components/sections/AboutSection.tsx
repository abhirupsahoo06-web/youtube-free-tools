import React from 'react'
import { CheckCircle2, Shield, Zap, Sparkles, HeartHandshake } from 'lucide-react'

export const AboutSection: React.FC = () => {
  const pillars = [
    {
      icon: Sparkles,
      title: 'Creator-Centric Utilities',
      description:
        'Focused on speed, simplicity, and clean workflows. Zero learning curves or cluttered menus.',
    },
    {
      icon: HeartHandshake,
      title: '100% Free Forever',
      description:
        'No subscriptions, no watermarks, no tokens, and no hidden charges. Free for creators of all channel sizes.',
    },
    {
      icon: Zap,
      title: 'Client-Side Execution',
      description:
        'Video and image processing happens locally right in your browser. Fast rendering and zero waiting for remote servers.',
    },
    {
      icon: Shield,
      title: 'Privacy By Design',
      description:
        'Your media files stay on your machine. We do not store, upload, or inspect your private video or image assets.',
    },
  ]

  return (
    <section id="about" className="relative py-20 sm:py-28 border-t border-slate-200 dark:border-white/[0.06] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Core Description */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>About The Platform</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              Empowering Creators with{' '}
              <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-500 bg-clip-text text-transparent">
                Frictionless Utilities
              </span>
            </h2>

            {/* Exact Required Sentence */}
            <p className="text-lg sm:text-xl text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
              <span className="text-slate-900 dark:text-white font-bold">YouTube Free Tools</span> is a free
              collection of simple creator utilities designed to make everyday YouTube content creation faster and easier.
            </p>

            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Whether you need to quickly frame a 16:9 widescreen video into a 9:16 vertical Short or crop a thumbnail for a high-converting video title, our tools operate directly inside your browser with maximum speed and zero hassle.
            </p>

            <div className="pt-2">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>No login or registration required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>Client-side private processing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Key Pillars */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillars.map((pillar) => {
              const Icon = pillar.icon
              return (
                <div
                  key={pillar.title}
                  className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.15] shadow-sm transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{pillar.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
