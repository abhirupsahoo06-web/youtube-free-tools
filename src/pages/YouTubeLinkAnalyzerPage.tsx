import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { YouTubeLinkAnalyzer } from '../components/tools/YouTubeLinkAnalyzer'
import { ChevronRight, Home, Search } from 'lucide-react'

export const YouTubeLinkAnalyzerPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'YouTube Link Analyzer - YouTube Free Tools'
  }, [])

  return (
    <div className="min-h-screen">
      {/* Breadcrumb Navigation Bar */}
      <div className="border-b border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Link to="/" className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 opacity-60" />
            <Link to="/#tools" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Tools
            </Link>
            <ChevronRight className="w-3 h-3 opacity-60" />
            <span className="text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
              <Search className="w-3 h-3" />
              <span>YouTube Link Analyzer</span>
            </span>
          </nav>
        </div>
      </div>

      {/* Main Tool Content */}
      <YouTubeLinkAnalyzer />
    </div>
  )
}
