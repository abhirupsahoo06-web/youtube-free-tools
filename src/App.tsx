import { useState } from 'react'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { HeroSection } from './components/sections/HeroSection'
import { ToolsSection } from './components/sections/ToolsSection'
import { AboutSection } from './components/sections/AboutSection'
import { InfoModal, type ModalType } from './components/modals/InfoModal'

export function App() {
  const [modalType, setModalType] = useState<ModalType>(null)

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c10] text-slate-100 selection:bg-red-600 selection:text-white relative">
      {/* Top Header Navigation */}
      <Header />

      {/* Main Content Layout */}
      <main id="main-content" className="flex-1">
        <HeroSection />
        <ToolsSection />
        <AboutSection />
      </main>

      {/* Footer */}
      <Footer onOpenModal={(type) => setModalType(type)} />

      {/* Info / Legal Modal */}
      <InfoModal type={modalType} onClose={() => setModalType(null)} />
    </div>
  )
}

export default App
