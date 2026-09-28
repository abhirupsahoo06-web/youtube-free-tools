import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  isExternal?: boolean
}

export type ToolStatus = 'coming_soon' | 'beta' | 'active'

export interface ToolItem {
  id: string
  title: string
  category: 'Optimization' | 'Media & Graphics' | 'Channel Growth' | 'Audio & Video' | 'Utility'
  description: string
  status: ToolStatus
  iconName: string
  tags?: string[]
}

export interface ValuePillar {
  icon: LucideIcon
  title: string
  description: string
}
