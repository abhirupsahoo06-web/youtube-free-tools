import type { CreatorTool } from '../types'

/**
 * YouTube Free Tools Registry
 *
 * Modular registry for all creator utilities.
 */
export const CREATOR_TOOLS: CreatorTool[] = [
  {
    id: 'youtube-analyzer',
    title: 'YouTube Link Analyzer',
    subtitle: 'Analyze links, inspect thumbnails & generate embeds.',
    description: 'Analyze a YouTube video link and get useful video information, thumbnail tools, embed options, and creator-friendly utilities.',
    route: '/tools/youtube-analyzer',
    buttonText: 'Open Analyzer',
    status: 'active',
    iconName: 'Search',
    badgeText: 'Compliant & Free',
    aspectRatioTags: ['Metadata', 'Thumbnails', 'Embed Generator', 'Creator Hub'],
  },
  {
    id: 'video-cropper',
    title: 'Video Cropper',
    subtitle: 'Crop videos quickly for different platforms.',
    description: 'Crop your videos to the perfect frame for YouTube, Shorts, TikTok and other platforms.',
    route: '/tools/video-cropper',
    buttonText: 'Open Video Cropper',
    status: 'active',
    iconName: 'Video',
    badgeText: 'In-Browser 8-Handle',
    aspectRatioTags: ['16:9', '9:16 Shorts', '1:1', '4:5', '4:3', 'Free'],
  },
  {
    id: 'image-cropper',
    title: 'Image Cropper',
    subtitle: 'Crop and resize images for creator content.',
    description: 'Crop and resize images quickly for thumbnails, channel art, posts and other creator content.',
    route: '/tools/image-cropper',
    buttonText: 'Open Image Cropper',
    status: 'active',
    iconName: 'Image',
    badgeText: 'In-Browser 8-Handle',
    aspectRatioTags: ['16:9 Thumbnail', '9:16 Story', '1:1 Avatar', '4:5 Post', '4:3', 'Free'],
  },
  {
    id: 'video-converter',
    title: 'Local Video Converter',
    subtitle: 'Convert and extract media from your local video files.',
    description: 'Convert your directly uploaded videos to WebM, MP4, or extract audio tracks locally in your browser with zero server uploads.',
    route: '/tools/video-converter',
    buttonText: 'Open Converter',
    status: 'active',
    iconName: 'FileCode',
    badgeText: 'Local Media Only',
    aspectRatioTags: ['WebM', 'MP4', 'Audio Extract (WAV)', 'Client-Side'],
  },
  {
    id: 'video-to-audio',
    title: 'Convert Video to Audio',
    subtitle: 'Extract MP3, WAV, and M4A audio from your video files.',
    description: 'Upload your local video file to extract high-quality audio tracks directly in your browser. Supports MP3, WAV, and M4A formats.',
    route: '/tools/video-to-audio',
    buttonText: 'Convert to Audio',
    status: 'active',
    iconName: 'Music',
    badgeText: '100% In-Browser',
    aspectRatioTags: ['MP3', 'WAV', 'M4A', 'Privacy First'],
  },
]
