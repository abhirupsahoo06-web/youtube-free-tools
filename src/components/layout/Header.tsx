import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '../common/Logo'
import { ThemeToggle } from '../common/ThemeToggle'
import { Menu, X, ChevronDown, Video, Image, Wrench, Search, FileCode, Music, Wand2 } from 'lucide-react'

const navTools = [
  {
    title: 'Video Quality Enhancer',
    subtitle: 'Upscale & enhance up to 4K UHD',
    route: '/tools/video-enhancer',
    icon: Wand2,
    tag: '4K UHD',
    tagColor: 'bg-red-500/12 text-red-700 dark:text-red-400',
  },
  {
    title: 'YouTube Link Analyzer',
    subtitle: 'Inspect thumbnails & embed options',
    route: '/tools/youtube-analyzer',
    icon: Search,
    tag: 'Popular',
    tagColor: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400',
  },
  {
    title: 'Video Cropper',
    subtitle: 'Crop for Shorts, Reels & 16:9',
    route: '/tools/video-cropper',
    icon: Video,
    tag: '8-Handle',
    tagColor: 'bg-slate-500/12 text-slate-700 dark:text-slate-300',
  },
  {
    title: 'Image Cropper',
    subtitle: 'Crop thumbnails & channel art',
    route: '/tools/image-cropper',
    icon: Image,
    tag: '8-Handle',
    tagColor: 'bg-slate-500/12 text-slate-700 dark:text-slate-300',
  },
  {
    title: 'Video to Audio',
    subtitle: 'Extract MP3, WAV, and M4A',
    route: '/tools/video-to-audio',
    icon: Music,
    tag: 'Audio',
    tagColor: 'bg-violet-500/12 text-violet-700 dark:text-violet-400',
  },
  {
    title: 'Local Video Converter',
    subtitle: 'Convert & extract audio in-browser',
    route: '/tools/video-converter',
    icon: FileCode,
    tag: 'Media',
    tagColor: 'bg-amber-500/12 text-amber-700 dark:text-amber-400',
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
    const handleScroll = () => setIsScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown on outside click or Escape key (WCAG 1.4.13 / 2.1.1)
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsDropdownOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setToolsDropdownOpen(false)
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
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
      className={`sticky top-0 z-50 w-full transition-all duration-200 border-b ${
        isScrolled
          ? 'glass-surface-elevated border-slate-200/80 dark:border-white/[0.1]'
          : 'bg-white/70 dark:bg-[#0b0c10]/70 backdrop-blur-xl border-slate-200/50 dark:border-white/[0.06]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <nav
            aria-label="Main Navigation"
            className="glass-surface hidden md:flex items-center gap-1 rounded-full px-2.5 py-1.5"
          >
            <Link
              to="/"
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                location.pathname === '/' && !isOnTool
                  ? 'glass-pill text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/[0.05] dark:hover:bg-white/[0.06]'
              }`}
            >
              Home
            </Link>

            {/* Tools Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setToolsDropdownOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  isOnTool
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/[0.05] dark:hover:bg-white/[0.06]'
                }`}
                aria-expanded={toolsDropdownOpen}
                aria-haspopup="true"
              >
                <Wrench className={`w-3.5 h-3.5 ${isOnTool ? 'text-white/85' : 'text-red-500'}`} />
                <span>Tools</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {toolsDropdownOpen && (
                <div
                  className="glass-surface-elevated absolute left-0 mt-3 w-84 rounded-2xl p-2 z-50"
                  style={{ animation: 'fadeSlideDown 0.16s ease-out' }}
                >
                  <style>{`
                    @keyframes fadeSlideDown {
                      from { opacity: 0; transform: translateY(-6px) scale(0.98); }
                      to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                  `}</style>

                  {navTools.map(({ title, subtitle, route, icon: Icon, tag, tagColor }) => (
                    <Link
                      key={route}
                      to={route}
                      onClick={() => setToolsDropdownOpen(false)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors group ${
                        location.pathname === route
                          ? 'bg-red-500/10'
                          : 'hover:bg-slate-900/[0.05] dark:hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="glass-inset p-2 rounded-lg text-red-600 dark:text-red-400 group-hover:scale-105 transition-transform flex-shrink-0">
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

                  <div className="pt-2 mt-1 border-t border-slate-200/70 dark:border-white/[0.08] px-3 pb-1">
                    <button
                      type="button"
                      onClick={() => handleNavClick('tools')}
                      className="text-xs text-red-600 dark:text-red-400 font-semibold hover:underline w-full text-left cursor-pointer"
                    >
                      View all tools directory →
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/[0.05] dark:hover:bg-white/[0.06] transition-all cursor-pointer"
            >
              About
            </button>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            <ThemeToggle />

            <Link
              to="/tools/video-enhancer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-all duration-150 shadow-sm hover:-translate-y-0.5 active:translate-y-0"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>4K Enhancer</span>
            </Link>

            <Link
              to="/tools/youtube-analyzer"
              className="glass-pill glass-interactive inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold text-slate-800 dark:text-white"
            >
              <Search className="w-3.5 h-3.5 text-red-500" />
              <span>Analyzer</span>
            </Link>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="glass-pill p-2.5 rounded-xl text-slate-700 dark:text-slate-200 cursor-pointer"
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
          className="glass-surface-elevated md:hidden border-b border-slate-200/80 dark:border-white/[0.08] px-4 pt-3 pb-6"
          style={{ animation: 'fadeSlideDown 0.18s ease-out' }}
        >
          <div className="flex flex-col space-y-1 mb-4">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-900/[0.05] dark:hover:bg-white/[0.06] transition-colors"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={() => handleNavClick('tools')}
              className="text-left px-4 py-3 rounded-xl text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-900/[0.05] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              All Tools
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className="text-left px-4 py-3 rounded-xl text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-900/[0.05] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              About
            </button>
          </div>

          <div className="border-t border-slate-200/70 dark:border-white/[0.08] pt-4">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1 mb-3">
              Creator Tools
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {navTools.map(({ title, route, icon: Icon, tagColor, tag }) => (
                <Link
                  key={route}
                  to={route}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`glass-inset flex items-center gap-3 p-3.5 rounded-xl transition-colors ${
                    location.pathname === route ? 'ring-1 ring-red-500/40 bg-red-500/8' : ''
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-red-500/10">
                    <Icon className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white block truncate">{title}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block ${tagColor}`}>
                      {tag}
                    </span>
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
