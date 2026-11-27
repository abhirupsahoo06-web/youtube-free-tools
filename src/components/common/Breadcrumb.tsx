import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ElementType
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <div className="border-b border-slate-200/70 dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400" aria-label="Breadcrumb">
          <Link
            to="/"
            className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>

          {items.map((item, i) => {
            const Icon = item.icon
            const isLast = i === items.length - 1
            return (
              <React.Fragment key={item.label}>
                <ChevronRight className="w-3 h-3 opacity-40 flex-shrink-0" />
                {isLast ? (
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
                    {Icon && <Icon className="w-3 h-3" />}
                    {item.label}
                  </span>
                ) : item.href ? (
                  <Link
                    to={item.href}
                    className="hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span>{item.label}</span>
                )}
              </React.Fragment>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
