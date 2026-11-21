import React, { useEffect } from 'react'
import { VideoToAudioConverter } from '../components/tools/VideoToAudioConverter'
import { Breadcrumb } from '../components/common/Breadcrumb'
import { Music } from 'lucide-react'

export const VideoToAudioConverterPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Convert Video to Audio - YouTube Free Tools'
  }, [])

  return (
    <div className="min-h-screen">
      <Breadcrumb
        items={[
          { label: 'Tools', href: '/#tools' },
          { label: 'Convert Video to Audio', icon: Music },
        ]}
      />
      <VideoToAudioConverter />
    </div>
  )
}
