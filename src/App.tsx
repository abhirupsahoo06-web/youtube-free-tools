import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { HomePage } from './pages/HomePage'
import { VideoCropperPage } from './pages/VideoCropperPage'
import { ImageCropperPage } from './pages/ImageCropperPage'
import { YouTubeLinkAnalyzerPage } from './pages/YouTubeLinkAnalyzerPage'
import { LocalVideoConverterPage } from './pages/LocalVideoConverterPage'
import { VideoToAudioConverterPage } from './pages/VideoToAudioConverterPage'
import { VideoQualityEnhancerPage } from './pages/VideoQualityEnhancerPage'
import { InfoModal, type ModalType } from './components/modals/InfoModal'

// Scroll restoration helper
function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
    } else {
      const id = hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 50)
      }
    }
  }, [pathname, hash])

  return null
}

function AppContent() {
  const [modalType, setModalType] = useState<ModalType>(null)

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f5f6fa] dark:bg-[#0b0c10] text-slate-800 dark:text-slate-100 transition-colors duration-200 overflow-x-clip">
      {/* Subtle layered Liquid Glass backdrop ambiance (restrained, low-saturation) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[920px] h-[440px] rounded-full bg-red-500/[0.06] dark:bg-red-500/[0.08] blur-[140px]" />
        <div className="absolute top-1/2 -left-40 w-[520px] h-[520px] rounded-full bg-slate-400/[0.08] dark:bg-indigo-500/[0.05] blur-[150px]" />
        <div className="absolute bottom-0 -right-32 w-[500px] h-[440px] rounded-full bg-rose-500/[0.04] dark:bg-rose-500/[0.05] blur-[140px]" />
      </div>

      <ScrollToTop />

      {/* Header */}
      <Header />

      {/* Main Routes */}
      <main id="main-content" className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tools/video-enhancer" element={<VideoQualityEnhancerPage />} />
          <Route path="/tools/video-cropper" element={<VideoCropperPage />} />
          <Route path="/tools/image-cropper" element={<ImageCropperPage />} />
          <Route path="/tools/youtube-analyzer" element={<YouTubeLinkAnalyzerPage />} />
          <Route path="/tools/video-converter" element={<LocalVideoConverterPage />} />
          <Route path="/tools/video-to-audio" element={<VideoToAudioConverterPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer onOpenModal={(type) => setModalType(type)} />

      {/* Legal / Policy Modal */}
      <InfoModal type={modalType} onClose={() => setModalType(null)} />
    </div>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
