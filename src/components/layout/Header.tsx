import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '../common/Logo'
import { ThemeToggle } from '../common/ThemeToggle'
import { Menu, X, ChevronDown, Video, Image, Wrench, Search, FileCode, Music } from 'lucide-react'

const navTools = [
  {
    title: 'YouTube Link Analyzer',
    subtitle: 'Inspect thumbnails & embed options',
    route: '/tools/youtube-analyzer',
    icon: Search,
    tag: 'Popular',
    tagColor: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400',
  },
  {
    title: 'Video Cropper',
    subtitle: 'Crop for Shorts, Reels & 16:9',
    route: '/tools/video-cropper',
    icon: Video,
    tag: '8-Handle',
    tagColor: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
  },
  {
    title: 'Image Cropper',
    subtitle: 'Crop thumbnails & channel art',
    route: '/tools/image-cropper',
    icon: Image,
    tag: '8-Handle',
    tagColor: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
  },
  {
    title: 'Video to Audio',
    subtitle: 'Extract MP3, WAV, and M4A',
    route: '/tools/video-to-audio',
    icon: Music,
    tag: 'New',
    tagColor: 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400',
  },
  {
    title: 'Local Video Converter',
    subtitle: 'Convert & extract audio in-browser',
    route: '/tools/video-converter',
    icon: FileCode,
    tag: 'New',
    tagColor: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
  },
]

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const [prevPathname, setPrevPathname] = useState(location.pathname)

  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname)
    setMobileMenuOpen(false)
    setToolsDropdownOpen(false)
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNavClick = (hash: string) => {
    setMobileMenuOpen(false)
    setToolsDropdownOpen(false)
    if (location.pathname === '/') {
      const el = document.getElementById(hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/#' + hash)
    }
  }

  const isOnTool = location.pathname.startsWith('/tools')

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 bg-white/95 dark:bg-[#0b0c10]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] ${
        isScrolled
          ? 'shadow-md shadow-black/[0.04] dark:shadow-black/40'
          : 'shadow-sm shadow-black/[0.02] dark:shadow-black/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-[#141522] border border-slate-200/90 dark:border-white/[0.1] rounded-full px-3 py-1.5 shadow-sm"
          >
            {/* Home */}
            <Link
              to="/"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                location.pathname === '/' && !isOnTool
                  ? 'text-slate-900 dark:text-white bg-white dark:bg-white/[0.1] shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/[0.05]'
              }`}
            >
              Home
            </Link>

            {/* Tools Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                onMouseEnter={() => setToolsDropdownOpen(true)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer ${
                  isOnTool
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/[0.05]'
                }`}
                aria-expanded={toolsDropdownOpen}
                aria-haspopup="true"
              >
                <Wrench className={`w-3.5 h-3.5 ${isOnTool ? 'text-white/80' : 'text-red-500'}`} />
                <span>Tools</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsDropdownOpen ? 'rotate-180' : ''} ${isOnTool ? 'text-white/80' : ''}`} />
              </button>

              {/* Flyout */}
              {toolsDropdownOpen && (
                <div
                  onMouseLeave={() => setToolsDropdownOpen(false)}
                  className="absolute left-0 mt-2 w-80 rounded-2xl bg-white dark:bg-[#13141e] border border-slate-200 dark:border-white/[0.1] p-2 shadow-2xl shadow-black/10 dark:shadow-black/60 backdrop-blur-xl z-50"
                  style={{ animation: 'fadeSlideDown 0.15s ease' }}
                >
                  <style>{`
                    @keyframes fadeSlideDown {
                      from { opacity: 0; transform: translateY(-6px); }
                      to { opacity: 1; transform: translateY(0); }
                    }
                  `}</style>

                  {navTools.map(({ title, subtitle, route, icon: Icon, tag, tagColor }) => (
                    <Link
                      key={route}
                      to={route}
                      onClick={() => setToolsDropdownOpen(false)}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-colors group ${
                        location.pathname === route
                          ? 'bg-red-50 dark:bg-red-500/10'
                          : 'hover:bg-slate-50 dark:hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 group-hover:scale-105 transition-transform flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{title}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${tagColor}`}>
                            {tag}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{subtitle}</p>
                      </div>
                    </Link>
                  ))}

                  <div className="pt-2 mt-1 border-t border-slate-100 dark:border-white/[0.06] px-3 pb-1">
                    <button
                      type="button"
                      onClick={() => handleNavClick('tools')}
                      className="text-xs text-red-600 dark:text-red-400 font-semibold hover:underline w-full text-left"
                    >
                      View all tools directory →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* About */}
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/[0.05] transition-all cursor-pointer"
            >
              About
            </button>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            <ThemeToggle />

            <Link
              to="/tools/youtube-analyzer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all duration-200 shadow-md shadow-red-600/25 hover:shadow-red-600/40 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Link Analyzer</span>
            </Link>

            <Link
              to="/tools/video-cropper"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-sm font-semibold text-slate-700 dark:text-white bg-slate-100 dark:bg-[#181926] hover:bg-slate-200 dark:hover:bg-[#222338] border border-slate-200 dark:border-white/[0.1] transition-all hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <Video className="w-3.5 h-3.5 text-red-500" />
              <span>Video Cropper</span>
            </Link>
          </div>

          {/* Mobile: theme + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-b border-slate-200 dark:border-white/[0.08] bg-white/97 dark:bg-[#0d0e14]/97 backdrop-blur-2xl px-4 pt-3 pb-6 shadow-xl"
          style={{ animation: 'fadeSlideDown 0.2s ease' }}
        >
          <style>{`
            @keyframes fadeSlideDown {
              from { opacity: 0; transform: translateY(-8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Top links */}
          <div className="flex flex-col space-y-1 mb-4">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={() => handleNavClick('tools')}
              className="text-left px-4 py-3 rounded-xl text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              All Tools
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className="text-left px-4 py-3 rounded-xl text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              About
            </button>
          </div>

          {/* Tool pills */}
          <div className="border-t border-slate-100 dark:border-white/[0.07] pt-4">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-3">Tools</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {navTools.map(({ title, route, icon: Icon, tagColor, tag }) => (
                <Link
                  key={route}
                  to={route}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors ${
                    location.pathname === route
                      ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
                      : 'bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.07] hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10">
                    <Icon className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white block truncate">{title}</span>
                    <span className={`text-[10px] font-bold ${tagColor} mt-0.5 inline-block`}>{tag}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
