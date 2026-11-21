import React, { useEffect } from 'react'
import { X, Shield, FileText, Mail } from 'lucide-react'

export type ModalType = 'privacy' | 'terms' | 'contact' | null

interface InfoModalProps {
  type: ModalType
  onClose: () => void
}

export const InfoModal: React.FC<InfoModalProps> = ({ type, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    if (!type) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [type, onClose])

  if (!type) return null

  const contentMap = {
    privacy: {
      title: 'Privacy Policy',
      icon: Shield,
      subtitle: 'Commitment to Creator Privacy & Data Minimization',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      body: (
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            At <strong className="text-white">YouTube Free Tools</strong>, privacy is fundamentally respected. This website does not require creator account registration, passwords, or credit cards.
          </p>
          <p>
            All tools on this platform operate client-side directly within your browser. We do not store, sell, or monetize your channel data or personal media assets.
          </p>
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Zero Data Collection</p>
            <p className="text-xs text-slate-400">Your video, image, and audio files never leave your device. All processing happens locally in your browser's memory.</p>
          </div>
          <p className="text-xs text-slate-500">
            Last updated: September 2026. This policy applies to all current and future tools hosted under YouTube Free Tools.
          </p>
        </div>
      ),
    },
    terms: {
      title: 'Terms of Service',
      icon: FileText,
      subtitle: 'Acceptable Use & Platform Guidelines',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      body: (
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            <strong className="text-white">YouTube Free Tools</strong> provides free, web-based creator utilities for lawful, productive channel management and content enhancement.
          </p>
          <p>
            By using this website, you agree to comply with applicable local laws and YouTube's Terms of Service. This platform is provided "as is" without warranties of any kind.
          </p>
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Independent Platform</p>
            <p className="text-xs text-slate-400">YouTube Free Tools is an independent creator project and is not affiliated with YouTube, Google LLC, or Alphabet Inc.</p>
          </div>
        </div>
      ),
    },
    contact: {
      title: 'Contact & Feedback',
      icon: Mail,
      subtitle: 'Get in Touch with the Development Team',
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10 border-red-500/20',
      body: (
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            Have feedback, feature requests, or a tool you'd like to see built? We're actively expanding the suite and welcome suggestions from creators of all sizes.
          </p>
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Creator Support & Inquiries</p>
            <p className="text-base text-red-400 font-mono font-semibold">support@youtubefreetools.com</p>
          </div>
          <p className="text-xs text-slate-500">
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.2s ease' }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div
        className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-[#13141e] border border-white/[0.1] p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden w-10 h-1 rounded-full bg-white/20 mx-auto mb-5" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`p-3 rounded-xl border ${activeContent.iconBg} ${activeContent.iconColor}`}>
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
        <div className="py-4 border-y border-white/[0.06] mb-6">
          {activeContent.body}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] text-white text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 border border-white/[0.08]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
