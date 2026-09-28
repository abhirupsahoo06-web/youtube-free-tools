import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '../common/Logo'
import { ThemeToggle } from '../common/ThemeToggle'
import { Menu, X, ChevronDown, Video, Image, Wrench } from 'lucide-react'

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (hash: string) => {
    setMobileMenuOpen(false)
    setToolsDropdownOpen(false)
    if (location.pathname === '/') {
      const el = document.getElementById(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate('/#' + hash)
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/85 dark:bg-[#0b0c10]/85 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.08] shadow-lg shadow-black/5 dark:shadow-black/20'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-1.5 bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] rounded-full px-4 py-1.5 backdrop-blur-md shadow-sm"
          >
            {/* Home */}
            <Link
              to="/"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                location.pathname === '/'
                  ? 'text-red-600 dark:text-white bg-white dark:bg-white/[0.1] shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.05]'
              }`}
            >
              Home
            </Link>

            {/* Prominent Tools Dropdown / Nav Item */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                onMouseEnter={() => setToolsDropdownOpen(true)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer ${
                  location.pathname.startsWith('/tools')
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                    : 'text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.05]'
                }`}
                aria-expanded={toolsDropdownOpen}
              >
                <Wrench className="w-3.5 h-3.5 text-red-500" />
                <span>Tools</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Tools Flyout Menu */}
              {toolsDropdownOpen && (
                <div
                  onMouseLeave={() => setToolsDropdownOpen(false)}
                  className="absolute left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.1] p-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150 z-50"
                >
                  <Link
                    to="/tools/video-cropper"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 group-hover:scale-105 transition-transform">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Video Cropper</span>
                        <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 px-1.5 py-0.2 bg-red-100 dark:bg-red-500/20 rounded">Active</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Crop for Shorts, Reels & 16:9</p>
                    </div>
                  </Link>

                  <Link
                    to="/tools/image-cropper"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 group-hover:scale-105 transition-transform">
                      <Image className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Image Cropper</span>
                        <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 px-1.5 py-0.2 bg-red-100 dark:bg-red-500/20 rounded">Active</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Crop for thumbnails & avatars</p>
                    </div>
                  </Link>

                  <div className="pt-2 mt-1 border-t border-slate-100 dark:border-white/[0.06] px-3 py-1.5">
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
              className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.05] transition-all cursor-pointer"
            >
              About
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            <Link
              to="/tools/video-cropper"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all duration-200 shadow-md shadow-red-600/25 hover:shadow-red-600/40 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video Cropper</span>
            </Link>

            <Link
              to="/tools/image-cropper"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-slate-800 dark:text-white bg-slate-100 dark:bg-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.14] border border-slate-300 dark:border-white/10 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Image className="w-3.5 h-3.5 text-red-500" />
              <span>Image Cropper</span>
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-b border-slate-200 dark:border-white/[0.08] bg-white/95 dark:bg-[#0d0e14]/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-3 duration-200 shadow-xl"
        >
          <div className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-base font-medium text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              Home
            </Link>

            <button
              type="button"
              onClick={() => handleNavClick('tools')}
              className="text-left px-4 py-3 rounded-xl text-base font-medium text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              All Tools Directory
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className="text-left px-4 py-3 rounded-xl text-base font-medium text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              About
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-white/[0.08] space-y-2">
            <Link
              to="/tools/video-cropper"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-center font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all shadow-md shadow-red-600/25"
            >
              <Video className="w-4 h-4" />
              <span>Open Video Cropper</span>
            </Link>

            <Link
              to="/tools/image-cropper"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-center font-semibold text-slate-800 dark:text-white bg-slate-100 dark:bg-white/[0.08] border border-slate-300 dark:border-white/10"
            >
              <Image className="w-4 h-4 text-red-500" />
              <span>Open Image Cropper</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
