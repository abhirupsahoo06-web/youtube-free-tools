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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0c10] text-slate-800 dark:text-slate-100 selection:bg-red-600 selection:text-white transition-colors duration-200">
      <ScrollToTop />

      {/* Header */}
      <Header />

      {/* Main Routes */}
      <main id="main-content" className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tools/video-cropper" element={<VideoCropperPage />} />
          <Route path="/tools/image-cropper" element={<ImageCropperPage />} />
          <Route path="/tools/youtube-analyzer" element={<YouTubeLinkAnalyzerPage />} />
          <Route path="/tools/video-converter" element={<LocalVideoConverterPage />} />
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
