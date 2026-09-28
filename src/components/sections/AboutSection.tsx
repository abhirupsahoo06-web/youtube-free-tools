import React from 'react'
import { CheckCircle2, Shield, Zap, Sparkles, HeartHandshake } from 'lucide-react'

export const AboutSection: React.FC = () => {
  const pillars = [
    {
      icon: Sparkles,
      title: 'Creator-Centric Focus',
      description:
        'Built specifically for creators, focusing on simplicity, clean design, and a distraction-free experience.',
    },
    {
      icon: HeartHandshake,
      title: '100% Free Forever',
      description:
        'No monthly subscriptions, no hidden tokens, and no paywalls. Free and accessible to creators of all sizes.',
    },
    {
      icon: Zap,
      title: 'Fast & Browser-Native',
      description:
        'No software to install. Fast loading times and responsive web interfaces designed to save creators time.',
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description:
        'Respecting creator privacy with no unnecessary data collection or account tracking.',
    },
  ]

  return (
    <section id="about" className="relative py-24 sm:py-32 border-t border-white/[0.06] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Core Description */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-xs font-semibold uppercase tracking-wider text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>About The Platform</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Empowering Creators with{' '}
              <span className="bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent">
                Simple Utilities
              </span>
            </h2>

            {/* Exact Required Copy */}
            <p className="text-lg sm:text-xl text-slate-200 font-medium leading-relaxed">
              <span className="text-white font-semibold">YouTube Free Tools</span> is a free creator-focused
              platform designed to bring useful YouTube utilities into one simple website.
            </p>

            <p className="text-base text-slate-400 leading-relaxed">
              Our mission is to provide independent YouTube creators with a reliable, streamlined web platform.
              As the platform expands, new free utilities will be introduced directly into this unified hub.
            </p>

            <div className="pt-2">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>No account or sign-up needed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>Modular platform architecture</span>
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
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.07] hover:border-white/[0.15] transition-all duration-200 backdrop-blur-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{pillar.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
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
