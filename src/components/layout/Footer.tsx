import React from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../common/Logo'
import { SITE_CONFIG } from '../../config/siteConfig'
import type { ModalType } from '../modals/InfoModal'
import { Heart, Video, Image } from 'lucide-react'

interface FooterProps {
  onOpenModal: (type: ModalType) => void
}

export const Footer: React.FC<FooterProps> = ({ onOpenModal }) => {
  return (
    <footer className="relative border-t border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#090a0e] pt-16 pb-12 overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-200 dark:border-white/[0.06]">
          {/* Brand Column */}
          <div className="md:col-span-6 space-y-4">
            <Logo iconSize="md" />

            <p className="text-base font-medium text-slate-700 dark:text-slate-300">
              Free tools for YouTube creators
            </p>

            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Client-side creator utilities designed to make video and image editing fast, private, and 100% free.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <Link
                to="/tools/video-cropper"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <Video className="w-3.5 h-3.5 text-red-500" />
                <span>Video Cropper</span>
              </Link>
              <Link
                to="/tools/image-cropper"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <Image className="w-3.5 h-3.5 text-red-500" />
                <span>Image Cropper</span>
              </Link>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/tools/video-cropper"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Video Cropper
                </Link>
              </li>
              <li>
                <Link
                  to="/tools/image-cropper"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Image Cropper
                </Link>
              </li>
              <li>
                <a
                  href="/#about"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / Contact Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Information</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenModal('contact')}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-left cursor-pointer"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenModal('privacy')}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-left cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenModal('terms')}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-left cursor-pointer"
                >
                  Terms
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer and Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p className="text-center md:text-left max-w-2xl leading-relaxed">
            {SITE_CONFIG.disclaimer}
          </p>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>• Copyright © {new Date().getFullYear()} YouTube Free Tools. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
