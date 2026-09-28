import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/useTheme'

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer ${
        theme === 'dark'
          ? 'bg-white/[0.05] border-white/10 text-amber-400 hover:bg-white/[0.1] hover:text-amber-300'
          : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
      } ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  )
}
