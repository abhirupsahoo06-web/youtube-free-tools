import React, { useEffect } from 'react'
import { VideoQualityEnhancer } from '../components/tools/VideoQualityEnhancer'
import { Breadcrumb } from '../components/common/Breadcrumb'
import { Wand2 } from 'lucide-react'

export const VideoQualityEnhancerPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Video Quality Enhancer (Up to 4K) - YouTube Free Tools'
  }, [])

  return (
    <div className="min-h-screen">
      <Breadcrumb
        items={[
          { label: 'Tools', href: '/#tools' },
          { label: 'Video Quality Enhancer', icon: Wand2 },
        ]}
      />
      <VideoQualityEnhancer />
    </div>
  )
}
