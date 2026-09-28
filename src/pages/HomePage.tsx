import React from 'react'
import { HeroSection } from '../components/sections/HeroSection'
import { ToolsSection } from '../components/sections/ToolsSection'
import { AboutSection } from '../components/sections/AboutSection'

export const HomePage: React.FC = () => {
  return (
    <div className="w-full">
      <HeroSection />
      <ToolsSection />
      <AboutSection />
    </div>
  )
}
