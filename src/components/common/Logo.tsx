import React from 'react'
import { Link } from 'react-router-dom'

interface LogoProps {
  className?: string
  iconSize?: 'sm' | 'md' | 'lg'
}

export const Logo: React.FC<LogoProps> = ({ className = '', iconSize = 'md' }) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  }

  return (
    <Link
      to="/"
      aria-label="YouTube Free Tools - Return to home"
      className={`group inline-flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 rounded-xl p-1 -m-1 ${className}`}
    >
      {/* Icon Badge */}
      <div
        className={`relative ${sizeClasses[iconSize]} rounded-xl bg-gradient-to-br from-red-500 via-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-600/30 ring-1 ring-white/20 overflow-hidden transition-all duration-300 group-hover:shadow-red-500/40`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/25 pointer-events-none" />

        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-white fill-white translate-x-0.5 filter drop-shadow-sm transition-transform duration-200 group-hover:scale-110"
        >
          <path d="M7 4.5V19.5L19 12L7 4.5Z" />
        </svg>

        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-none select-none">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-lg sm:text-xl font-['Plus_Jakarta_Sans'] transition-colors">
            YouTube
          </span>
          <span className="font-bold tracking-tight text-red-600 dark:text-red-500 text-lg sm:text-xl font-['Plus_Jakarta_Sans']">
            Free Tools
          </span>
        </div>
        <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
          Creator Suite
        </span>
      </div>
    </Link>
  )
}
