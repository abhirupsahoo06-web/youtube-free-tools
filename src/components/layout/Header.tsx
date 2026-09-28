import React, { useState, useEffect } from 'react'
import { Logo } from '../common/Logo'
import { SITE_CONFIG } from '../../config/siteConfig'
import { Menu, X, ArrowUpRight } from 'lucide-react'

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)

      // Simple active section detection
      const sections = ['home', 'tools', 'about']
      const scrollPosition = window.scrollY + 120

      for (const section of sections) {
        const el = document.getElementById(section)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0b0c10]/85 backdrop-blur-md border-b border-white/[0.08] shadow-lg shadow-black/20'
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
            className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] rounded-full px-4 py-1.5 backdrop-blur-md"
          >
            {SITE_CONFIG.navItems.map((item) => {
              const isActive = activeSection === item.href.replace('#', '')
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                    isActive
                      ? 'text-white bg-white/[0.1] shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {item.label}
                </a>
              )
            })}
          </nav>

          {/* Desktop CTA / Badge */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#tools"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-red-600/35 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <span>Explore Tools</span>
              <ArrowUpRight className="w-4 h-4 opacity-80" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-colors"
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
          className="md:hidden border-b border-white/[0.08] bg-[#0d0e14]/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="flex flex-col space-y-1">
            {SITE_CONFIG.navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-base font-medium text-slate-200 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-white/[0.08]">
            <a
              href="#tools"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-full px-5 py-3 rounded-xl text-center font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all shadow-md shadow-red-600/25"
            >
              Explore Tools
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
