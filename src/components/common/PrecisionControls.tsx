import React from 'react'
import type { AspectRatioOption, CropRect } from '../../types/crop'

interface PrecisionControlsProps {
  cropRect: CropRect
  naturalWidth: number
  naturalHeight: number
  onCropChange: (newRect: CropRect) => void
  aspectRatio: AspectRatioOption
  onAspectRatioChange: (newRatio: AspectRatioOption) => void
  disabled?: boolean
}

export const PrecisionControls: React.FC<PrecisionControlsProps> = ({
  cropRect,
  naturalWidth,
  naturalHeight,
  onCropChange,
  aspectRatio,
  onAspectRatioChange,
  disabled = false,
}) => {
  const handleXChange = (val: number) => {
    const safeX = Math.max(0, Math.min(val, naturalWidth - cropRect.width))
    onCropChange({ ...cropRect, x: safeX })
  }

  const handleYChange = (val: number) => {
    const safeY = Math.max(0, Math.min(val, naturalHeight - cropRect.height))
    onCropChange({ ...cropRect, y: safeY })
  }

  const handleWidthChange = (val: number) => {
    const minSize = 24
    let safeW = Math.max(minSize, Math.min(val, naturalWidth - cropRect.x))
    let safeH = cropRect.height

    if (aspectRatio !== 'free') {
      let ratio = 16 / 9
      if (aspectRatio === '16:9') ratio = 16 / 9
      else if (aspectRatio === '9:16') ratio = 9 / 16
      else if (aspectRatio === '1:1') ratio = 1
      else if (aspectRatio === '4:5') ratio = 4 / 5
      else if (aspectRatio === '4:3') ratio = 4 / 3
      else if (aspectRatio === 'original') ratio = naturalWidth / naturalHeight

      safeH = Math.round(safeW / ratio)
      if (cropRect.y + safeH > naturalHeight) {
        safeH = naturalHeight - cropRect.y
        safeW = Math.round(safeH * ratio)
      }
    }

    onCropChange({ ...cropRect, width: safeW, height: safeH })
  }

  const handleHeightChange = (val: number) => {
    const minSize = 24
    let safeH = Math.max(minSize, Math.min(val, naturalHeight - cropRect.y))
    let safeW = cropRect.width

    if (aspectRatio !== 'free') {
      let ratio = 16 / 9
      if (aspectRatio === '16:9') ratio = 16 / 9
      else if (aspectRatio === '9:16') ratio = 9 / 16
      else if (aspectRatio === '1:1') ratio = 1
      else if (aspectRatio === '4:5') ratio = 4 / 5
      else if (aspectRatio === '4:3') ratio = 4 / 3
      else if (aspectRatio === 'original') ratio = naturalWidth / naturalHeight

      safeW = Math.round(safeH * ratio)
      if (cropRect.x + safeW > naturalWidth) {
        safeW = naturalWidth - cropRect.x
        safeH = Math.round(safeW / ratio)
      }
    }

    onCropChange({ ...cropRect, width: safeW, height: safeH })
  }

  const aspectOptions: { id: AspectRatioOption; label: string }[] = [
    { id: 'free', label: 'Free' },
    { id: 'original', label: 'Original' },
    { id: '16:9', label: '16:9' },
    { id: '9:16', label: '9:16' },
    { id: '1:1', label: '1:1' },
    { id: '4:5', label: '4:5' },
    { id: '4:3', label: '4:3' },
  ]

  return (
    <div className="w-full space-y-4">
      {/* Aspect Ratio Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-2 flex-shrink-0">
            Aspect Ratio:
          </span>
          {aspectOptions.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onAspectRatioChange(id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                aspectRatio === id
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Live Original vs Crop Dimensions Display */}
        <div className="flex items-center gap-3 text-xs border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-white/[0.08] pt-2 sm:pt-0 sm:pl-3">
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span>Original:</span>
            <strong className="font-mono text-slate-800 dark:text-slate-200">
              {naturalWidth} × {naturalHeight}
            </strong>
          </div>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span>Crop:</span>
            <strong className="font-mono text-red-600 dark:text-red-400">
              {Math.round(cropRect.width)} × {Math.round(cropRect.height)}
            </strong>
          </div>
        </div>
      </div>

      {/* Numeric Precision Coordinates Controls (X, Y, Width, Height) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Precision Coordinates & Dimensions (Pixels)
          </h4>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Values update in real-time</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              X (px)
            </label>
            <input
              type="number"
              disabled={disabled}
              min={0}
              max={naturalWidth - cropRect.width}
              value={Math.round(cropRect.x)}
              onChange={(e) => handleXChange(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-sm font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Y (px)
            </label>
            <input
              type="number"
              disabled={disabled}
              min={0}
              max={naturalHeight - cropRect.height}
              value={Math.round(cropRect.y)}
              onChange={(e) => handleYChange(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-sm font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Width (px)
            </label>
            <input
              type="number"
              disabled={disabled}
              min={24}
              max={naturalWidth - cropRect.x}
              value={Math.round(cropRect.width)}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 24)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-sm font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Height (px)
            </label>
            <input
              type="number"
              disabled={disabled}
              min={24}
              max={naturalHeight - cropRect.y}
              value={Math.round(cropRect.height)}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 24)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-sm font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
