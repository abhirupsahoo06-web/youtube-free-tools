import React, { useEffect } from 'react'
import { YouTubeLinkAnalyzer } from '../components/tools/YouTubeLinkAnalyzer'
import { Breadcrumb } from '../components/common/Breadcrumb'
import { Search } from 'lucide-react'

export const YouTubeLinkAnalyzerPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'YouTube Link Analyzer - YouTube Free Tools'
  }, [])

  return (
    <div className="min-h-screen">
      <Breadcrumb
        items={[
          { label: 'Tools', href: '/#tools' },
          { label: 'YouTube Link Analyzer', icon: Search },
        ]}
      />
      <YouTubeLinkAnalyzer />
    </div>
  )
}
