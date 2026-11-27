import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Upload,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Download,
  RotateCcw as ResetIcon,
  Trash2,
  Sparkles,
  Eye,
  AlertCircle,
  Maximize2
} from 'lucide-react'
import { CropBoxOverlay } from '../common/CropBoxOverlay'
import { PrecisionControls } from '../common/PrecisionControls'
import { ZoomControls } from '../common/ZoomControls'
import type { AspectRatioOption, CropRect } from '../../types/crop'

type ExportFormat = 'png' | 'jpeg' | 'webp'

export const ImageCropper: React.FC = () => {
  // Image state
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imageName, setImageName] = useState<string>('image')
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const [fileSize, setFileSize] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Transforms
  const [zoom, setZoom] = useState<number>(1)
  const [rotation, setRotation] = useState<number>(0)
  const [flipH, setFlipH] = useState<boolean>(false)
  const [flipV, setFlipV] = useState<boolean>(false)

  // Crop Box in natural image pixels
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('16:9')
  const [cropRect, setCropRect] = useState<CropRect>({ x: 0, y: 0, width: 1280, height: 720 })

  // Export settings
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png')
  const [quality, setQuality] = useState<number>(0.92)
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false)

  // DOM Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const imageElementRef = useRef<HTMLImageElement>(null)

  // Calculate default crop box based on aspect ratio
  const calculateDefaultCrop = useCallback((preset: AspectRatioOption, imgW: number, imgH: number): CropRect => {
    let ratio = 16 / 9
    if (preset === '16:9') ratio = 16 / 9
    else if (preset === '9:16') ratio = 9 / 16
    else if (preset === '1:1') ratio = 1
    else if (preset === '4:5') ratio = 4 / 5
    else if (preset === '4:3') ratio = 4 / 3
    else if (preset === 'original') ratio = imgW / imgH
    else ratio = imgW / imgH

    let w = imgW * 0.85
    let h = w / ratio

    if (h > imgH * 0.85) {
      h = imgH * 0.85
      w = h * ratio
    }

    w = Math.round(Math.min(w, imgW))
    h = Math.round(Math.min(h, imgH))
    const x = Math.round((imgW - w) / 2)
    const y = Math.round((imgH - h) / 2)

    return { x: Math.max(0, x), y: Math.max(0, y), width: w, height: h }
  }, [])

  // Handle image file selection
  const handleFile = (file: File) => {
    setErrorMsg(null)
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP, GIF, SVG).')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('File is too large. Please select an image under 50MB.')
      return
    }

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`
    setFileSize(sizeStr)
    setImageName(file.name.replace(/\.[^/.]+$/, ''))

    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target?.result as string
      const img = new Image()
      img.onload = () => {
        setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight })
        setImageSrc(src)
        const initialBox = calculateDefaultCrop('16:9', img.naturalWidth, img.naturalHeight)
        setCropRect(initialBox)
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  // Handle aspect ratio selection
  const handleAspectRatioChange = (newRatio: AspectRatioOption) => {
    setAspectRatio(newRatio)
    if (originalDimensions.width > 0 && originalDimensions.height > 0) {
      const newBox = calculateDefaultCrop(newRatio, originalDimensions.width, originalDimensions.height)
      setCropRect(newBox)
    }
  }

  // Reset transforms and crop box
  const handleReset = () => {
    setZoom(1)
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    if (originalDimensions.width > 0 && originalDimensions.height > 0) {
      const initialBox = calculateDefaultCrop(aspectRatio, originalDimensions.width, originalDimensions.height)
      setCropRect(initialBox)
    }
  }

  // Clear loaded image
  const handleClear = () => {
    setImageSrc(null)
    setCroppedPreviewUrl(null)
    setErrorMsg(null)
    setOriginalDimensions({ width: 0, height: 0 })
    setFileSize('')
    setZoom(1)
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
  }

  // Render cropped image to canvas and return Blob
  const generateCroppedBlob = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!imageSrc || !originalDimensions.width) {
        resolve(null)
        return
      }

      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const isRotated90or270 = rotation === 90 || rotation === 270

        const finalWidth = isRotated90or270 ? cropRect.height : cropRect.width
        const finalHeight = isRotated90or270 ? cropRect.width : cropRect.height

        canvas.width = Math.round(finalWidth)
        canvas.height = Math.round(finalHeight)

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(null)
          return
        }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)

        ctx.drawImage(
          img,
          cropRect.x,
          cropRect.y,
          cropRect.width,
          cropRect.height,
          -cropRect.width / 2,
          -cropRect.height / 2,
          cropRect.width,
          cropRect.height
        )
        ctx.restore()

        const mime = `image/${exportFormat}`
        canvas.toBlob(
          (blob) => resolve(blob),
          mime,
          exportFormat === 'png' ? undefined : quality
        )
      }
      img.src = imageSrc
    })
  }, [imageSrc, cropRect, rotation, flipH, flipV, exportFormat, quality, originalDimensions])

  // Update live preview URL
  useEffect(() => {
    let active = true
    if (!imageSrc) return

    const timer = setTimeout(async () => {
      const blob = await generateCroppedBlob()
      if (blob && active) {
        const url = URL.createObjectURL(blob)
        setCroppedPreviewUrl(url)
      }
    }, 150)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [generateCroppedBlob, imageSrc])

  // Download action
  const handleDownload = async () => {
    setIsExporting(true)
    try {
      const blob = await generateCroppedBlob()
      if (!blob) throw new Error('Could not generate cropped image.')

      const ext = exportFormat === 'jpeg' ? 'jpg' : exportFormat
      const filename = `${imageName}-cropped-${cropRect.width}x${cropRect.height}.${ext}`
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Export failed'
      setErrorMsg(message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Tool Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/[0.08]">
        <div>
          <div className="glass-pill inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Crop Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Image Cropper
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
            Crop and resize images quickly for thumbnails, channel art, posts and other creator content.
          </p>
        </div>

        {imageSrc && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isExporting}
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-300 dark:border-white/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ResetIcon className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              disabled={isExporting}
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Image</span>
            </button>
          </div>
        )}
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Empty State / Upload Dropzone */}
      {!imageSrc ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="glass-surface glass-interactive rounded-3xl border-2 border-dashed border-slate-300/90 dark:border-white/[0.15] hover:border-red-500/50 p-8 sm:p-20 text-center flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => document.getElementById('image-upload-input')?.click()}
        >
          <input
            id="image-upload-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-red-500/10">
            <Upload className="w-10 h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Upload Image or Drag & Drop
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
            Supports PNG, JPG, WebP, GIF, SVG. Features professional 8-handle crop resizing, rule-of-thirds grid, and in-browser export.
          </p>
          <span className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 shadow-md shadow-red-600/25">
            Select Image From Device
          </span>
        </div>
      ) : (
        /* Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Visual Editor (Col 8) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Top Transform Buttons Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 glass-surface rounded-2xl shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Transforms
                </span>
                {fileSize && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
                    • {fileSize}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  title="Rotate Counter-Clockwise"
                  disabled={isExporting}
                  onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>-90°</span>
                </button>
                <button
                  type="button"
                  title="Rotate Clockwise"
                  disabled={isExporting}
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>+90°</span>
                </button>
                <button
                  type="button"
                  title="Flip Horizontal"
                  disabled={isExporting}
                  onClick={() => setFlipH(!flipH)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    flipH ? 'bg-red-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Flip H</span>
                </button>
                <button
                  type="button"
                  title="Flip Vertical"
                  disabled={isExporting}
                  onClick={() => setFlipV(!flipV)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    flipV ? 'bg-red-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                  <span>Flip V</span>
                </button>
              </div>
            </div>

            {/* Dark Workspace Stage */}
            <div className="relative w-full rounded-3xl bg-[#090a0f] border border-slate-800 flex items-center justify-center overflow-auto min-h-[280px] sm:min-h-[440px] max-h-[640px] p-3 sm:p-6 shadow-inner select-none">
              {/* Checkered pattern background */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)`,
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                }}
              />

              {/* Centered Media Container that scales with Zoom */}
              <div
                ref={containerRef}
                className="relative inline-block shadow-2xl transition-transform duration-75"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                }}
              >
                {/* Media Image */}
                <img
                  ref={imageElementRef}
                  src={imageSrc}
                  alt="Media source"
                  className="max-w-[85vw] sm:max-w-[70vw] max-h-[45vh] sm:max-h-[52vh] object-contain block pointer-events-none select-none"
                  style={{
                    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                  }}
                />

                {/* Professional 8-Handle Crop Box Overlay with Rule-of-Thirds Grid */}
                {originalDimensions.width > 0 && (
                  <CropBoxOverlay
                    cropRect={cropRect}
                    naturalWidth={originalDimensions.width}
                    naturalHeight={originalDimensions.height}
                    aspectRatio={aspectRatio}
                    onCropChange={setCropRect}
                    containerRef={containerRef}
                  />
                )}
              </div>
            </div>

            {/* Zoom Controls Bar */}
            <ZoomControls
              zoom={zoom}
              onZoomChange={setZoom}
              onFitToScreen={() => setZoom(1.0)}
              onResetZoom={() => setZoom(1.0)}
              disabled={isExporting}
            />

            {/* Precision Controls: Aspect Ratio + Live Dimensions + Numeric Inputs */}
            <PrecisionControls
              cropRect={cropRect}
              naturalWidth={originalDimensions.width}
              naturalHeight={originalDimensions.height}
              aspectRatio={aspectRatio}
              onCropChange={setCropRect}
              onAspectRatioChange={handleAspectRatioChange}
              disabled={isExporting}
            />
          </div>

          {/* Export Sidebar (Col 4) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Export Card */}
            <div className="p-6 glass-surface rounded-3xl shadow-sm space-y-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Export Options</h3>

              {/* Format selection */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                  Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['png', 'jpeg', 'webp'] as ExportFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      disabled={isExporting}
                      onClick={() => setExportFormat(fmt)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        exportFormat === fmt
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      {fmt === 'jpeg' ? 'JPG' : fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality slider */}
              {exportFormat !== 'png' && (
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">
                    <span>Quality</span>
                    <span className="font-mono text-red-600 dark:text-red-400 font-bold">{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1"
                    step="0.05"
                    value={quality}
                    disabled={isExporting}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              )}

              {/* Live Cropped Result Thumbnail */}
              {croppedPreviewUrl && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span>Cropped Preview</span>
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(true)}
                      className="text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Full View</span>
                    </button>
                  </div>
                  <div
                    className="w-full h-36 rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center p-2 cursor-pointer group relative"
                    onClick={() => setShowPreviewModal(true)}
                  >
                    <img
                      src={croppedPreviewUrl}
                      alt="Cropped preview"
                      className="max-w-full max-h-full object-contain rounded-lg group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-semibold gap-1">
                      <Maximize2 className="w-4 h-4" />
                      <span>Preview Result</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Download Action */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={isExporting}
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all duration-200 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Exporting Image...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Download Cropped Image</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                Processed locally in your browser • Zero data uploaded
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Preview Modal */}
      {showPreviewModal && croppedPreviewUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="glass-surface-elevated relative max-w-4xl max-h-[90vh] rounded-3xl p-6 flex flex-col items-center gap-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full border-b border-slate-200/70 dark:border-white/[0.08] pb-3">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Cropped Preview ({Math.round(cropRect.width)} × {Math.round(cropRect.height)} px)
              </h4>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="glass-pill text-slate-700 dark:text-slate-200 px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center">
              <img
                src={croppedPreviewUrl}
                alt="Full cropped preview"
                className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-2xl"
              />
            </div>
            <div className="flex justify-end w-full gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download This Image</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
