import React, { useRef } from 'react'
import type { AspectRatioOption, CropRect, HandleType } from '../../types/crop'

interface CropBoxOverlayProps {
  cropRect: CropRect
  naturalWidth: number
  naturalHeight: number
  aspectRatio: AspectRatioOption
  onCropChange: (newRect: CropRect) => void
  containerRef: React.RefObject<HTMLDivElement | null>
}

export const CropBoxOverlay: React.FC<CropBoxOverlayProps> = ({
  cropRect,
  naturalWidth,
  naturalHeight,
  aspectRatio,
  onCropChange,
  containerRef,
}) => {
  const isInteractingRef = useRef<boolean>(false)
  const currentActionRef = useRef<HandleType | null>(null)
  const startPointerPosRef = useRef<{ clientX: number; clientY: number }>({ clientX: 0, clientY: 0 })
  const startRectRef = useRef<CropRect>(cropRect)

  // Calculate target ratio if not 'free'
  const getNumericRatio = (): number | null => {
    if (aspectRatio === '16:9') return 16 / 9
    if (aspectRatio === '9:16') return 9 / 16
    if (aspectRatio === '1:1') return 1
    if (aspectRatio === '4:5') return 4 / 5
    if (aspectRatio === '4:3') return 4 / 3
    if (aspectRatio === 'original') return naturalWidth / naturalHeight
    return null
  }

  // Handle pointer down on handles or inside crop box
  const handlePointerDown = (e: React.PointerEvent, action: HandleType) => {
    e.preventDefault()
    e.stopPropagation()

    isInteractingRef.current = true
    currentActionRef.current = action
    startPointerPosRef.current = { clientX: e.clientX, clientY: e.clientY }
    startRectRef.current = { ...cropRect }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
  }

  const handlePointerMove = (e: PointerEvent) => {
    if (!isInteractingRef.current || !containerRef.current) return

    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0 || naturalWidth === 0 || naturalHeight === 0) return

    // Scale factors: screen pixels to natural media pixels
    const scaleX = naturalWidth / rect.width
    const scaleY = naturalHeight / rect.height

    const deltaX = (e.clientX - startPointerPosRef.current.clientX) * scaleX
    const deltaY = (e.clientY - startPointerPosRef.current.clientY) * scaleY

    const start = startRectRef.current
    const action = currentActionRef.current
    const ratio = getNumericRatio()

    let newX = start.x
    let newY = start.y
    let newWidth = start.width
    let newHeight = start.height

    const minSize = 24

    if (action === 'move') {
      newX = Math.max(0, Math.min(start.x + deltaX, naturalWidth - start.width))
      newY = Math.max(0, Math.min(start.y + deltaY, naturalHeight - start.height))
    } else if (action) {
      if (ratio === null) {
        // FREE RESIZE (Unconstrained)
        if (action.includes('e')) {
          newWidth = Math.max(minSize, Math.min(start.width + deltaX, naturalWidth - start.x))
        }
        if (action.includes('w')) {
          const potentialW = start.width - deltaX
          if (potentialW >= minSize && start.x + deltaX >= 0) {
            newX = start.x + deltaX
            newWidth = potentialW
          }
        }
        if (action.includes('s')) {
          newHeight = Math.max(minSize, Math.min(start.height + deltaY, naturalHeight - start.y))
        }
        if (action.includes('n')) {
          const potentialH = start.height - deltaY
          if (potentialH >= minSize && start.y + deltaY >= 0) {
            newY = start.y + deltaY
            newHeight = potentialH
          }
        }
      } else {
        // ASPECT-RATIO CONSTRAINED RESIZE
        if (action === 'se') {
          newWidth = Math.max(minSize, start.width + deltaX)
          newHeight = newWidth / ratio
          if (start.x + newWidth > naturalWidth) {
            newWidth = naturalWidth - start.x
            newHeight = newWidth / ratio
          }
          if (start.y + newHeight > naturalHeight) {
            newHeight = naturalHeight - start.y
            newWidth = newHeight * ratio
          }
        } else if (action === 'sw') {
          newWidth = Math.max(minSize, start.width - deltaX)
          newHeight = newWidth / ratio
          if (start.x + start.width - newWidth < 0) {
            newWidth = start.x + start.width
            newHeight = newWidth / ratio
          }
          if (start.y + newHeight > naturalHeight) {
            newHeight = naturalHeight - start.y
            newWidth = newHeight * ratio
          }
          newX = start.x + start.width - newWidth
        } else if (action === 'ne') {
          newWidth = Math.max(minSize, start.width + deltaX)
          newHeight = newWidth / ratio
          if (start.x + newWidth > naturalWidth) {
            newWidth = naturalWidth - start.x
            newHeight = newWidth / ratio
          }
          if (start.y + start.height - newHeight < 0) {
            newHeight = start.y + start.height
            newWidth = newHeight * ratio
          }
          newY = start.y + start.height - newHeight
        } else if (action === 'nw') {
          newWidth = Math.max(minSize, start.width - deltaX)
          newHeight = newWidth / ratio
          if (start.x + start.width - newWidth < 0) {
            newWidth = start.x + start.width
            newHeight = newWidth / ratio
          }
          if (start.y + start.height - newHeight < 0) {
            newHeight = start.y + start.height
            newWidth = newHeight * ratio
          }
          newX = start.x + start.width - newWidth
          newY = start.y + start.height - newHeight
        } else if (action === 'e' || action === 'w') {
          const delta = action === 'e' ? deltaX : -deltaX
          newWidth = Math.max(minSize, start.width + delta)
          newHeight = newWidth / ratio
          if (action === 'e') {
            if (start.x + newWidth > naturalWidth) {
              newWidth = naturalWidth - start.x
              newHeight = newWidth / ratio
            }
          } else {
            if (start.x + start.width - newWidth < 0) {
              newWidth = start.x + start.width
              newHeight = newWidth / ratio
            }
            newX = start.x + start.width - newWidth
          }
          // Center height vertically from start
          const heightDiff = newHeight - start.height
          newY = Math.max(0, Math.min(start.y - heightDiff / 2, naturalHeight - newHeight))
        } else if (action === 's' || action === 'n') {
          const delta = action === 's' ? deltaY : -deltaY
          newHeight = Math.max(minSize, start.height + delta)
          newWidth = newHeight * ratio
          if (action === 's') {
            if (start.y + newHeight > naturalHeight) {
              newHeight = naturalHeight - start.y
              newWidth = newHeight * ratio
            }
          } else {
            if (start.y + start.height - newHeight < 0) {
              newHeight = start.y + start.height
              newWidth = newHeight * ratio
            }
            newY = start.y + start.height - newHeight
          }
          // Center width horizontally from start
          const widthDiff = newWidth - start.width
          newX = Math.max(0, Math.min(start.x - widthDiff / 2, naturalWidth - newWidth))
        }
      }
    }

    // Final boundary clamp
    newX = Math.max(0, Math.min(newX, naturalWidth - minSize))
    newY = Math.max(0, Math.min(newY, naturalHeight - minSize))
    newWidth = Math.max(minSize, Math.min(newWidth, naturalWidth - newX))
    newHeight = Math.max(minSize, Math.min(newHeight, naturalHeight - newY))

    onCropChange({
      x: Math.round(newX),
      y: Math.round(newY),
      width: Math.round(newWidth),
      height: Math.round(newHeight),
    })
  }

  const handlePointerUp = () => {
    isInteractingRef.current = false
    currentActionRef.current = null
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
    window.removeEventListener('pointercancel', handlePointerUp)
  }

  // Calculate percentages for rendered overlay
  const leftPct = (cropRect.x / naturalWidth) * 100
  const topPct = (cropRect.y / naturalHeight) * 100
  const widthPct = (cropRect.width / naturalWidth) * 100
  const heightPct = (cropRect.height / naturalHeight) * 100

  // Handle configuration list
  const handles: { id: HandleType; style: React.CSSProperties; cursor: string }[] = [
    { id: 'nw', style: { top: '0%', left: '0%' }, cursor: 'nwse-resize' },
    { id: 'n', style: { top: '0%', left: '50%' }, cursor: 'ns-resize' },
    { id: 'ne', style: { top: '0%', left: '100%' }, cursor: 'nesw-resize' },
    { id: 'e', style: { top: '50%', left: '100%' }, cursor: 'ew-resize' },
    { id: 'se', style: { top: '100%', left: '100%' }, cursor: 'nwse-resize' },
    { id: 's', style: { top: '100%', left: '50%' }, cursor: 'ns-resize' },
    { id: 'sw', style: { top: '100%', left: '0%' }, cursor: 'nesw-resize' },
    { id: 'w', style: { top: '50%', left: '0%' }, cursor: 'ew-resize' },
  ]

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* 4 Dark Outside Overlays (Dimmed background) */}
      {/* Top Overlay */}
      <div
        className="absolute bg-black/70 pointer-events-auto"
        style={{ top: 0, left: 0, right: 0, height: `${topPct}%` }}
      />
      {/* Bottom Overlay */}
      <div
        className="absolute bg-black/70 pointer-events-auto"
        style={{ top: `${topPct + heightPct}%`, left: 0, right: 0, bottom: 0 }}
      />
      {/* Left Overlay */}
      <div
        className="absolute bg-black/70 pointer-events-auto"
        style={{ top: `${topPct}%`, left: 0, width: `${leftPct}%`, height: `${heightPct}%` }}
      />
      {/* Right Overlay */}
      <div
        className="absolute bg-black/70 pointer-events-auto"
        style={{
          top: `${topPct}%`,
          left: `${leftPct + widthPct}%`,
          right: 0,
          height: `${heightPct}%`,
        }}
      />

      {/* Interactive Crop Box */}
      <div
        className="absolute border-2 border-white pointer-events-auto cursor-move touch-none"
        style={{
          top: `${topPct}%`,
          left: `${leftPct}%`,
          width: `${widthPct}%`,
          height: `${heightPct}%`,
        }}
        onPointerDown={(e) => handlePointerDown(e, 'move')}
      >
        {/* Rule of Thirds Dashed Grid */}
        <div className="absolute inset-0 pointer-events-none">
          {/* 2 Horizontal dashed lines */}
          <div className="absolute left-0 right-0 top-1/3 border-b border-dashed border-white/60" />
          <div className="absolute left-0 right-0 top-2/3 border-b border-dashed border-white/60" />
          {/* 2 Vertical dashed lines */}
          <div className="absolute top-0 bottom-0 left-1/3 border-r border-dashed border-white/60" />
          <div className="absolute top-0 bottom-0 left-2/3 border-r border-dashed border-white/60" />
        </div>

        {/* Live Pixel Dimension Pill inside Crop Box */}
        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-sm border border-white/20 text-[11px] font-mono font-bold text-white pointer-events-none shadow-md">
          {Math.round(cropRect.width)} × {Math.round(cropRect.height)}
        </div>

        {/* 8 Draggable Circular Resize Handles with High-Contrast White Outer Ring + Colored Inner Circle */}
        {handles.map(({ id, style, cursor }) => (
          <div
            key={id}
            style={style}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center touch-none select-none"
            onPointerDown={(e) => handlePointerDown(e, id)}
          >
            {/* Extended 36px touch hit area for mobile & desktop ease */}
            <div
              className="w-9 h-9 flex items-center justify-center cursor-pointer"
              style={{ cursor }}
            >
              {/* Large circular handle: white outer ring + colored inner circle */}
              <div
                className="w-5 h-5 rounded-full bg-red-600 border-[3px] border-white shadow-[0_2px_8px_rgba(0,0,0,0.85)] hover:scale-125 active:scale-125 transition-transform"
                style={{ cursor }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
