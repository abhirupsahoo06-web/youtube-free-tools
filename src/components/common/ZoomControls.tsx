import React from 'react'
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react'

interface ZoomControlsProps {
  zoom: number
  onZoomChange: (newZoom: number) => void
  onFitToScreen: () => void
  onResetZoom: () => void
  className?: string
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomChange,
  onFitToScreen,
  onResetZoom,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] text-xs shadow-sm ${className}`}
    >
      {/* Zoom Slider & Increments */}
      <div className="flex items-center gap-2.5">
        <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Zoom:
        </span>
        <button
          type="button"
          title="Zoom Out"
          onClick={() => onZoomChange(Math.max(0.5, parseFloat((zoom - 0.1).toFixed(2))))}
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <input
          type="range"
          min="0.5"
          max="3.0"
          step="0.05"
          value={zoom}
          onChange={(e) => onZoomChange(parseFloat(e.target.value))}
          className="w-24 sm:w-32 accent-red-600 cursor-pointer"
        />

        <button
          type="button"
          title="Zoom In"
          onClick={() => onZoomChange(Math.min(3.0, parseFloat((zoom + 0.1).toFixed(2))))}
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Fit to Screen & Reset Zoom Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onFitToScreen}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-semibold"
        >
          <Maximize className="w-3.5 h-3.5" />
          <span>Fit to Screen</span>
        </button>

        <button
          type="button"
          onClick={onResetZoom}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Zoom</span>
        </button>
      </div>
    </div>
  )
}
