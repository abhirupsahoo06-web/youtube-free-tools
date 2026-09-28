export interface NavItem {
  label: string
  href: string
  isExternal?: boolean
}

export type ToolStatus = 'active' | 'coming_soon'

export interface CreatorTool {
  id: string
  title: string
  subtitle: string
  description: string
  route: string
  buttonText: string
  status: ToolStatus
  iconName: string
  badgeText?: string
  aspectRatioTags?: string[]
}
