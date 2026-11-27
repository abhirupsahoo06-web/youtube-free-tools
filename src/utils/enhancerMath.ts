import type {
  OutputCodec,
  OutputResolution,
  QualityTier,
} from '../types/enhancer'

export interface ResolutionSpec {
  id: OutputResolution
  label: string
  shortLabel: string
  dimensionsLabel: string
  longEdge: number
  shortEdge: number
}

export const RESOLUTION_SPECS: ResolutionSpec[] = [
  {
    id: 'original',
    label: 'Original',
    shortLabel: 'Source',
    dimensionsLabel: 'Source resolution',
    longEdge: 0,
    shortEdge: 0,
  },
  {
    id: '720p',
    label: '720p HD',
    shortLabel: '720p',
    dimensionsLabel: '1280 × 720',
    longEdge: 1280,
    shortEdge: 720,
  },
  {
    id: '1080p',
    label: '1080p Full HD',
    shortLabel: '1080p',
    dimensionsLabel: '1920 × 1080',
    longEdge: 1920,
    shortEdge: 1080,
  },
  {
    id: '1440p',
    label: '1440p QHD',
    shortLabel: '1440p',
    dimensionsLabel: '2560 × 1440',
    longEdge: 2560,
    shortEdge: 1440,
  },
  {
    id: '4k',
    label: '4K UHD',
    shortLabel: '4K',
    dimensionsLabel: '3840 × 2160',
    longEdge: 3840,
    shortEdge: 2160,
  },
]

function toEven(value: number): number {
  return Math.max(2, Math.round(value / 2) * 2)
}

/**
 * Computes exact aspect-ratio-preserving output pixel dimensions (even-aligned for H.264/H.265).
 * Never stretches footage to fit a target box.
 */
export function calculateTargetDimensions(
  srcW: number,
  srcH: number,
  target: OutputResolution
): { width: number; height: number; isPortrait: boolean } {
  const safeW = srcW > 0 ? srcW : 1920
  const safeH = srcH > 0 ? srcH : 1080
  const isPortrait = safeH > safeW

  if (target === 'original') {
    return {
      width: toEven(safeW),
      height: toEven(safeH),
      isPortrait,
    }
  }

  const spec = RESOLUTION_SPECS.find((s) => s.id === target)
  if (!spec || spec.longEdge === 0) {
    return { width: toEven(safeW), height: toEven(safeH), isPortrait }
  }

  const boxW = isPortrait ? spec.shortEdge : spec.longEdge
  const boxH = isPortrait ? spec.longEdge : spec.shortEdge
  const scale = Math.min(boxW / safeW, boxH / safeH)

  return {
    width: toEven(safeW * scale),
    height: toEven(safeH * scale),
    isPortrait,
  }
}

/**
 * Estimates reasonable MP4 output size from target pixel area, duration, codec, and quality tier.
 */
export function estimateOutputSizeBytes(params: {
  targetWidth: number
  targetHeight: number
  durationSeconds: number
  codec: OutputCodec
  quality: QualityTier
  preserveAudio: boolean
}): number {
  const duration = Math.max(1, params.durationSeconds || 1)
  const pixels = params.targetWidth * params.targetHeight
  const ref1080Pixels = 1920 * 1080
  const scaleFactor = Math.max(0.25, pixels / ref1080Pixels)

  const base1080Mbps: Record<QualityTier, number> = {
    balanced: 6.5,
    high: 11.0,
    ultra: 18.0,
  }

  const codecEfficiency = params.codec === 'h265' ? 0.65 : 1.0
  // Nonlinear bitrate curve so 4K is ~2.8x-3.5x 1080p rather than strictly 4x
  const effectiveVideoMbps = base1080Mbps[params.quality] * Math.pow(scaleFactor, 0.85) * codecEfficiency
  const audioMbps = params.preserveAudio ? 0.192 : 0
  const totalBitsPerSecond = (effectiveVideoMbps + audioMbps) * 1_000_000

  return Math.round((totalBitsPerSecond / 8) * duration)
}

export function formatBytes(bytes: number): string {
  if (!bytes || isNaN(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let idx = 0
  while (size >= 1024 && idx < units.length - 1) {
    size /= 1024
    idx++
  }
  return `${size.toFixed(idx === 0 ? 0 : idx >= 2 ? 1 : 0)} ${units[idx]}`
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '00:00'
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
