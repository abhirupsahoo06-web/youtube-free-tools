import React from 'react'
import { Logo } from '../common/Logo'
import { SITE_CONFIG } from '../../config/siteConfig'
import type { ModalType } from '../modals/InfoModal'
import { Heart } from 'lucide-react'

interface FooterProps {
  onOpenModal: (type: ModalType) => void
}

export const Footer: React.FC<FooterProps> = ({ onOpenModal }) => {
  return (
    <footer className="relative border-t border-white/[0.08] bg-[#090a0e] pt-16 pb-12 overflow-hidden">
      {/* Subtle bottom ambient red reflection */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[150px] bg-red-600/[0.03] blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/[0.06]">
          {/* Brand Column */}
          <div className="md:col-span-6 space-y-4">
            <Logo iconSize="md" />

            {/* Exact Required Text */}
            <p className="text-base font-medium text-slate-300">
              Free tools for creators
            </p>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              A modern, lightweight platform built to streamline YouTube creator workflows with zero subscriptions and zero hassle.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#home"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#tools"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Tools
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / Contact Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Information</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenModal('contact')}
                  className="text-slate-400 hover:text-white transition-colors text-left cursor-pointer"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenModal('privacy')}
                  className="text-slate-400 hover:text-white transition-colors text-left cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenModal('terms')}
                  className="text-slate-400 hover:text-white transition-colors text-left cursor-pointer"
                >
                  Terms
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer and Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-center md:text-left max-w-2xl leading-relaxed">
            {SITE_CONFIG.disclaimer}
          </p>

          <div className="flex items-center gap-1.5 flex-shrink-0 text-slate-400">
            <span>Built for video creators with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>• © {new Date().getFullYear()} YouTube Free Tools</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
