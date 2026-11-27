import React from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../common/Logo'
import { SITE_CONFIG } from '../../config/siteConfig'
import type { ModalType } from '../modals/InfoModal'
import { Heart, Video, Image, Search, Music, FileCode, ArrowUpRight, Shield } from 'lucide-react'

interface FooterProps {
  onOpenModal: (type: ModalType) => void
}

const CURRENT_YEAR = new Date().getFullYear()

const toolLinks = [
  { label: 'YouTube Link Analyzer', route: '/tools/youtube-analyzer', icon: Search },
  { label: 'Video Cropper', route: '/tools/video-cropper', icon: Video },
  { label: 'Image Cropper', route: '/tools/image-cropper', icon: Image },
  { label: 'Video to Audio', route: '/tools/video-to-audio', icon: Music },
  { label: 'Local Video Converter', route: '/tools/video-converter', icon: FileCode },
]

export const Footer: React.FC<FooterProps> = ({ onOpenModal }) => {
  return (
    <footer className="relative border-t border-slate-200 dark:border-white/[0.07] bg-slate-50 dark:bg-[#090a0e] overflow-hidden transition-colors">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-red-600/[0.03] dark:bg-red-500/[0.04] blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="pt-14 pb-10 grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-slate-200 dark:border-white/[0.06]">
          {/* Brand */}
          <div className="md:col-span-5 space-y-5">
            <Logo />

            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              Free, browser-native creator utilities for YouTube. Crop videos, edit thumbnails, analyze links, and extract audio — all locally, all free.
            </p>

            {/* Privacy badge */}
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07] text-xs font-medium text-slate-600 dark:text-slate-400 shadow-sm">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Your files never leave your browser</span>
            </div>
          </div>

          {/* Tools */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Tools</h4>
            <ul className="space-y-2.5">
              {toolLinks.map(({ label, route, icon: Icon }) => (
                <li key={route}>
                  <Link
                    to={route}
                    className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
                  >
                    <Icon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation & Legal */}
          <div className="md:col-span-3 space-y-8">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Navigation</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { label: 'Home', to: '/' },
                  { label: 'Tools Directory', to: '/#tools' },
                  { label: 'About', to: '/#about' },
                ].map(({ label, to }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Legal</h4>
              <ul className="space-y-2 text-sm">
                {(
                  [
                    { label: 'Privacy Policy', type: 'privacy' },
                    { label: 'Terms of Service', type: 'terms' },
                    { label: 'Contact Us', type: 'contact' },
                  ] as { label: string; type: ModalType }[]
                ).map(({ label, type }) => (
                  <li key={type}>
                    <button
                      type="button"
                      onClick={() => onOpenModal(type)}
                      className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-left cursor-pointer group"
                    >
                      <span>{label}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity -mb-0.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center md:text-left max-w-2xl leading-relaxed">
            {SITE_CONFIG.disclaimer}
          </p>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 flex-shrink-0 whitespace-nowrap">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>• © {CURRENT_YEAR} YouTube Free Tools</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
