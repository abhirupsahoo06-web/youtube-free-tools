import React, { useEffect } from 'react'
import { VideoCropper } from '../components/tools/VideoCropper'
import { Breadcrumb } from '../components/common/Breadcrumb'
import { Video } from 'lucide-react'

export const VideoCropperPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Video Cropper - YouTube Free Tools'
  }, [])

  return (
    <div className="min-h-screen">
      <Breadcrumb
        items={[
          { label: 'Tools', href: '/#tools' },
          { label: 'Video Cropper', icon: Video },
        ]}
      />
      <VideoCropper />
    </div>
  )
}
