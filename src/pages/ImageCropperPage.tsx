import React, { useEffect } from 'react'
import { ImageCropper } from '../components/tools/ImageCropper'
import { Breadcrumb } from '../components/common/Breadcrumb'
import { Image } from 'lucide-react'

export const ImageCropperPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Image Cropper - YouTube Free Tools'
  }, [])

  return (
    <div className="min-h-screen">
      <Breadcrumb
        items={[
          { label: 'Tools', href: '/#tools' },
          { label: 'Image Cropper', icon: Image },
        ]}
      />
      <ImageCropper />
    </div>
  )
}
