import type { ToolItem } from '../types'

/**
 * YouTube Free Tools Registry
 * 
 * Version 1: Platform shell and placeholders.
 * As future tools are implemented, register their routes and components here.
 * Notice: All tools in this version are non-functional placeholders labeled 'Coming Soon'.
 */
export const UPCOMING_TOOLS_PLACEHOLDERS: ToolItem[] = [
  {
    id: 'tool-meta-optimizer',
    title: 'Creator Metadata & SEO',
    category: 'Optimization',
    description: 'Smart formatting and optimization helpers for titles, descriptions, and tags to maximize search visibility.',
    status: 'coming_soon',
    iconName: 'Sparkles',
    tags: ['SEO', 'Metadata', 'Discoverability'],
  },
  {
    id: 'tool-thumbnail-previewer',
    title: 'Thumbnail & Title Previewer',
    category: 'Media & Graphics',
    description: 'Visual preview testing across YouTube desktop, mobile feed, and dark mode before publishing your video.',
    status: 'coming_soon',
    iconName: 'Image',
    tags: ['Thumbnails', 'CTR', 'Design'],
  },
  {
    id: 'tool-tags-extractor',
    title: 'Tag & Keyword Explorer',
    category: 'Optimization',
    description: 'In-depth keyword extraction and competitor tag insights to spark ideas for your next video topic.',
    status: 'coming_soon',
    iconName: 'Tag',
    tags: ['Keywords', 'Tags', 'Research'],
  },
  {
    id: 'tool-timecode-generator',
    title: 'Video Chapter & Timestamp Generator',
    category: 'Utility',
    description: 'Effortlessly format and validate YouTube chapter timestamps with one-click copy for video descriptions.',
    status: 'coming_soon',
    iconName: 'Clock',
    tags: ['Chapters', 'Timestamps', 'Workflow'],
  },
  {
    id: 'tool-channel-analytics-calc',
    title: 'Creator Metrics & CPM Estimator',
    category: 'Channel Growth',
    description: 'Simple visual calculators for engagement rate, estimated CPM ranges, and video milestone projections.',
    status: 'coming_soon',
    iconName: 'BarChart3',
    tags: ['Analytics', 'Growth', 'Calculators'],
  },
  {
    id: 'tool-banner-safezone',
    title: 'Channel Banner Safe-Area Checker',
    category: 'Media & Graphics',
    description: 'Instant safe-zone visualizer for TV, desktop, tablet, and mobile YouTube channel banner artwork.',
    status: 'coming_soon',
    iconName: 'Layout',
    tags: ['Branding', 'Safe Area', 'Design'],
  },
]
