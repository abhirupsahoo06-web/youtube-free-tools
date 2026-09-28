import React from 'react'
import { X, Shield, FileText, Mail } from 'lucide-react'

export type ModalType = 'privacy' | 'terms' | 'contact' | null

interface InfoModalProps {
  type: ModalType
  onClose: () => void
}

export const InfoModal: React.FC<InfoModalProps> = ({ type, onClose }) => {
  if (!type) return null

  const contentMap = {
    privacy: {
      title: 'Privacy Policy',
      icon: Shield,
      subtitle: 'Commitment to Creator Privacy & Data Minimization',
      body: (
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            At <strong className="text-white">YouTube Free Tools</strong>, privacy is fundamentally respected. This website does not require creator account registration, passwords, or credit cards.
          </p>
          <p>
            Future utilities on this platform are architected to operate client-side directly within your browser whenever possible. We do not store, sell, or monetize your channel data or personal assets.
          </p>
          <p className="text-xs text-slate-400">
            Last updated: September 2026. This policy applies to all current and future tools hosted under YouTube Free Tools.
          </p>
        </div>
      ),
    },
    terms: {
      title: 'Terms of Service',
      icon: FileText,
      subtitle: 'Acceptable Use & Platform Guidelines',
      body: (
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            <strong className="text-white">YouTube Free Tools</strong> provides free, web-based creator utilities for lawful, productive channel management and content enhancement.
          </p>
          <p>
            By using this website, you agree to comply with applicable local laws and YouTube's Terms of Service. This platform is provided &quot;as is&quot; without warranties of any kind.
          </p>
          <p className="text-xs text-slate-400">
            YouTube Free Tools is an independent project and is not affiliated with YouTube, Google LLC, or Alphabet Inc.
          </p>
        </div>
      ),
    },
    contact: {
      title: 'Contact & Feedback',
      icon: Mail,
      subtitle: 'Get in Touch with the Development Team',
      body: (
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            Have feedback, feature requests, or a specific tool you would like built next? We are actively building out the suite for Version 2 and welcome suggestions from creators of all channel sizes.
          </p>
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Creator Support & Inquiries</p>
            <p className="text-base text-red-400 font-mono mt-1 font-semibold">support@youtubefreetools.com</p>
          </div>
          <p className="text-xs text-slate-400">
            We review creator submissions as new tool modules are planned and scheduled for release.
          </p>
        </div>
      ),
    },
  }

  const activeContent = contentMap[type]
  const Icon = activeContent.icon

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#14151f] border border-white/[0.12] p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 id="modal-title" className="text-xl font-bold text-white">
              {activeContent.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{activeContent.subtitle}</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="py-2 border-y border-white/[0.06] mb-6">
          {activeContent.body}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
