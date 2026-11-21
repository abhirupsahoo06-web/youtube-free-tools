import React, { useEffect } from 'react'
import { LocalVideoConverter } from '../components/tools/LocalVideoConverter'
import { Breadcrumb } from '../components/common/Breadcrumb'
import { FileCode } from 'lucide-react'

export const LocalVideoConverterPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Local Video Converter - YouTube Free Tools'
  }, [])

  return (
    <div className="min-h-screen">
      <Breadcrumb
        items={[
          { label: 'Tools', href: '/#tools' },
          { label: 'Local Video Converter', icon: FileCode },
        ]}
      />
      <LocalVideoConverter />
    </div>
  )
}
