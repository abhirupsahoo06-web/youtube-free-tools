import type { CreatorTool } from '../types'

/**
 * YouTube Free Tools Registry
 *
 * Modular registry for all creator utilities. Future tools (e.g. Thumbnail Downloader,
 * Audio Converter, Tag Generator, Subtitle Tools) can be registered here as active or coming_soon.
 */
export const CREATOR_TOOLS: CreatorTool[] = [
  {
    id: 'video-cropper',
    title: 'Video Cropper',
    subtitle: 'Crop videos quickly for different platforms.',
    description: 'Crop your videos to the perfect frame for YouTube, Shorts, TikTok and other platforms.',
    route: '/tools/video-cropper',
    buttonText: 'Open Video Cropper',
    status: 'active',
    iconName: 'Video',
    badgeText: 'Free & In-Browser',
    aspectRatioTags: ['16:9', '9:16 Shorts', '1:1', '4:5', 'Custom'],
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
    badgeText: 'Free & In-Browser',
    aspectRatioTags: ['16:9 Thumbnail', '9:16 Story', '1:1 Avatar', '4:5 Post', 'Custom'],
  },
]
