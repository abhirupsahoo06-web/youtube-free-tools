import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/useTheme'

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`glass-pill glass-interactive relative inline-flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer overflow-hidden ${
        isDark ? 'text-amber-300' : 'text-slate-700'
      } ${className}`}
    >
      <span
        key={theme}
        style={{ animation: 'spinIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        <style>{`
          @keyframes spinIn {
            from { opacity: 0; transform: rotate(-90deg) scale(0.6); }
            to { opacity: 1; transform: rotate(0deg) scale(1); }
          }
        `}</style>
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </span>
    </button>
  )
}
