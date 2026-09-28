export interface NavItem {
  label: string
  href: string
  isExternal?: boolean
}

export type ToolStatus = 'coming_soon' | 'active'

export interface ToolPlaceholder {
  id: string
  label: string
  status: ToolStatus
}
