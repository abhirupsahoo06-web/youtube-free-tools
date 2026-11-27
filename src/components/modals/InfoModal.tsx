import React, { useEffect, useRef } from 'react'
import { X, Shield, FileText, Mail } from 'lucide-react'

export type ModalType = 'privacy' | 'terms' | 'contact' | null

interface InfoModalProps {
  type: ModalType
  onClose: () => void
}

export const InfoModal: React.FC<InfoModalProps> = ({ type, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (type) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else if (dialog.open) {
      dialog.close()
    }
  }, [type])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleClose = () => {
      dialog.returnValue = ''
      onClose()
    }

    // Light dismiss fallback for browsers without <dialog closedby="any">
    let pressedOutside = false
    const isOutside = (e: PointerEvent) => {
      const rect = dialog.getBoundingClientRect()
      return (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      )
    }

    const onPointerDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e)
    }
    const onPointerUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e)) {
        dialog.close()
      }
      pressedOutside = false
    }

    dialog.addEventListener('close', handleClose)
    dialog.addEventListener('pointerdown', onPointerDown)
    dialog.addEventListener('pointerup', onPointerUp)

    return () => {
      dialog.removeEventListener('close', handleClose)
      dialog.removeEventListener('pointerdown', onPointerDown)
      dialog.removeEventListener('pointerup', onPointerUp)
    }
  }, [onClose])

  const contentMap = {
    privacy: {
      title: 'Privacy Policy',
      icon: Shield,
      subtitle: 'Commitment to Creator Privacy & Data Minimization',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      body: (
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            At <strong className="text-slate-900 dark:text-white">YouTube Free Tools</strong>, privacy is fundamentally respected. This website does not require creator account registration, passwords, or credit cards.
          </p>
          <p>
            Our client-side tools process images, audio, and local crops directly in your browser. For the Video Quality Enhancer when cloud worker processing is configured, uploaded videos use short-lived signed storage URLs and are automatically deleted after processing or retention expiration.
          </p>
          <div className="glass-inset p-4 rounded-xl">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
              Zero Data Selling
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              We never store, sell, or monetize your channel metadata or media assets.
            </p>
          </div>
        </div>
      ),
    },
    terms: {
      title: 'Terms of Service',
      icon: FileText,
      subtitle: 'Acceptable Use & Platform Guidelines',
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      body: (
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            <strong className="text-slate-900 dark:text-white">YouTube Free Tools</strong> provides free web-based creator utilities for lawful, productive channel management and media enhancement.
          </p>
          <p>
            You agree to process only videos, images, and audio that you own or have legal permission to edit, and to comply with applicable laws and YouTube&apos;s Terms of Service.
          </p>
          <div className="glass-inset p-4 rounded-xl">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1">
              Independent Platform
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              YouTube Free Tools is an independent creator project and is not affiliated with YouTube, Google LLC, or Alphabet Inc.
            </p>
          </div>
        </div>
      ),
    },
    contact: {
      title: 'Contact & Feedback',
      icon: Mail,
      subtitle: 'Get in Touch with the Development Team',
      iconColor: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-red-500/10 border-red-500/20',
      body: (
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Have feedback, bug reports, or a creator utility you would like built next? We welcome suggestions from creators of all channel sizes.
          </p>
          <div className="glass-inset p-4 rounded-xl">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1.5">
              Creator Support & Inquiries
            </p>
            <p className="text-base text-red-600 dark:text-red-400 font-mono font-semibold">
              support@youtubefreetools.com
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            We review creator submissions as new tool modules and improvements are planned.
          </p>
        </div>
      ),
    },
  }

  const activeContent = type ? contentMap[type] : null
  const Icon = activeContent?.icon

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-title"
      className="m-auto w-[calc(100%-2rem)] sm:max-w-lg rounded-3xl bg-transparent p-0 text-inherit"
    >
      {activeContent && Icon && (
        <div className="glass-surface-elevated relative w-full rounded-3xl p-6 sm:p-8 overflow-hidden">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close modal"
            className="glass-pill absolute top-5 right-5 p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4 mb-6 pr-8">
            <div className={`p-3 rounded-2xl border ${activeContent.iconBg} ${activeContent.iconColor}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h1 id="modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
                {activeContent.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activeContent.subtitle}</p>
            </div>
          </div>

          <div className="py-4 border-y border-slate-200/70 dark:border-white/[0.08] mb-6">
            {activeContent.body}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              autoFocus
              className="glass-pill glass-interactive px-6 py-2.5 rounded-xl text-slate-800 dark:text-white text-sm font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}
