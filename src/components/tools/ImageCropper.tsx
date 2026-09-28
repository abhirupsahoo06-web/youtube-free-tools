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
  ZoomIn,
  ZoomOut,
  Sparkles,
  Eye,
  AlertCircle,
  Maximize2
} from 'lucide-react'

type AspectRatioPreset = 'original' | '16:9' | '9:16' | '1:1' | '4:5' | 'free'
type ExportFormat = 'png' | 'jpeg' | 'webp'

interface CropBox {
  x: number // percentage 0-100
  y: number // percentage 0-100
  width: number // percentage 0-100
  height: number // percentage 0-100
}

export const ImageCropper: React.FC = () => {
  // Image state
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imageName, setImageName] = useState<string>('image')
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 })
  const [fileSize, setFileSize] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Transforms
  const [zoom, setZoom] = useState<number>(1)
  const [rotation, setRotation] = useState<number>(0) // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false)
  const [flipV, setFlipV] = useState<boolean>(false)

  // Crop settings
  const [aspectRatio, setAspectRatio] = useState<AspectRatioPreset>('16:9')
  const [cropBox, setCropBox] = useState<CropBox>({ x: 10, y: 10, width: 80, height: 45 })
  const [customWidth, setCustomWidth] = useState<number>(1280)
  const [customHeight, setCustomHeight] = useState<number>(720)

  // Export settings
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png')
  const [quality, setQuality] = useState<number>(0.92)
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false)

  // Drag and Resize Refs
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const imageElementRef = useRef<HTMLImageElement>(null)
  const isDraggingRef = useRef<boolean>(false)
  const dragHandleRef = useRef<string | null>(null)
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const startCropBoxRef = useRef<CropBox>(cropBox)

  // Handle file selection
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
        resetCrop(img.naturalWidth, img.naturalHeight, '16:9')
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

  // Calculate crop box based on aspect ratio
  const calculateCropFromRatio = useCallback(
    (preset: AspectRatioPreset, imgW: number, imgH: number): CropBox => {
      let ratio = 16 / 9
      if (preset === 'original') ratio = imgW / imgH
      else if (preset === '16:9') ratio = 16 / 9
      else if (preset === '9:16') ratio = 9 / 16
      else if (preset === '1:1') ratio = 1
      else if (preset === '4:5') ratio = 4 / 5
      else return { x: 10, y: 10, width: 80, height: 80 }

      const containerRatio = imgW / imgH
      let boxW = 80
      let boxH = 80

      if (ratio > containerRatio) {
        boxW = 80
        boxH = (boxW * containerRatio) / ratio
      } else {
        boxH = 80
        boxW = (boxH * ratio) / containerRatio
      }

      boxW = Math.min(boxW, 90)
      boxH = Math.min(boxH, 90)

      const boxX = (100 - boxW) / 2
      const boxY = (100 - boxH) / 2

      return { x: Math.max(0, boxX), y: Math.max(0, boxY), width: boxW, height: boxH }
    },
    []
  )

  const resetCrop = (
    w = originalDimensions.width,
    h = originalDimensions.height,
    preset = aspectRatio
  ) => {
    setZoom(1)
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    const newBox = calculateCropFromRatio(preset, w, h)
    setCropBox(newBox)
    updatePixelInputs(newBox, w, h)
  }

  const handleRatioChange = (preset: AspectRatioPreset) => {
    setAspectRatio(preset)
    if (originalDimensions.width > 0 && originalDimensions.height > 0) {
      const newBox = calculateCropFromRatio(preset, originalDimensions.width, originalDimensions.height)
      setCropBox(newBox)
      updatePixelInputs(newBox, originalDimensions.width, originalDimensions.height)
    }
  }

  const updatePixelInputs = (box: CropBox, imgW: number, imgH: number) => {
    const pxW = Math.round((box.width / 100) * imgW)
    const pxH = Math.round((box.height / 100) * imgH)
    setCustomWidth(pxW)
    setCustomHeight(pxH)
  }

  const handleCustomWidthChange = (val: number) => {
    const safeVal = Math.max(10, Math.min(val, originalDimensions.width))
    setCustomWidth(safeVal)
    setAspectRatio('free')
    const newWPercent = (safeVal / originalDimensions.width) * 100
    setCropBox((prev) => ({
      ...prev,
      width: Math.min(newWPercent, 100 - prev.x),
    }))
  }

  const handleCustomHeightChange = (val: number) => {
    const safeVal = Math.max(10, Math.min(val, originalDimensions.height))
    setCustomHeight(safeVal)
    setAspectRatio('free')
    const newHPercent = (safeVal / originalDimensions.height) * 100
    setCropBox((prev) => ({
      ...prev,
      height: Math.min(newHPercent, 100 - prev.y),
    }))
  }

  // Pointer drag and resize handlers
  const handlePointerDown = (e: React.PointerEvent, handle: string) => {
    e.preventDefault()
    e.stopPropagation()
    isDraggingRef.current = true
    dragHandleRef.current = handle
    dragStartPosRef.current = { x: e.clientX, y: e.clientY }
    startCropBoxRef.current = { ...cropBox }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDraggingRef.current || !imageContainerRef.current) return

    const rect = imageContainerRef.current.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    const deltaXPercent = ((e.clientX - dragStartPosRef.current.x) / rect.width) * 100
    const deltaYPercent = ((e.clientY - dragStartPosRef.current.y) / rect.height) * 100

    const start = startCropBoxRef.current
    const handle = dragHandleRef.current

    let newX = start.x
    let newY = start.y
    let newW = start.width
    let newH = start.height

    if (handle === 'move') {
      newX = Math.max(0, Math.min(start.x + deltaXPercent, 100 - start.width))
      newY = Math.max(0, Math.min(start.y + deltaYPercent, 100 - start.height))
    } else {
      // Resize with aspect ratio constraint if applicable
      let targetRatio: number | null = null
      if (aspectRatio === '16:9') targetRatio = 16 / 9
      else if (aspectRatio === '9:16') targetRatio = 9 / 16
      else if (aspectRatio === '1:1') targetRatio = 1
      else if (aspectRatio === '4:5') targetRatio = 4 / 5
      else if (aspectRatio === 'original' && originalDimensions.height > 0) {
        targetRatio = originalDimensions.width / originalDimensions.height
      }

      const containerRatio = originalDimensions.width / originalDimensions.height

      if (handle?.includes('e')) {
        newW = Math.max(5, Math.min(start.width + deltaXPercent, 100 - start.x))
      }
      if (handle?.includes('w')) {
        const potentialW = start.width - deltaXPercent
        if (potentialW >= 5 && start.x + deltaXPercent >= 0) {
          newX = start.x + deltaXPercent
          newW = potentialW
        }
      }
      if (handle?.includes('s')) {
        newH = Math.max(5, Math.min(start.height + deltaYPercent, 100 - start.y))
      }
      if (handle?.includes('n')) {
        const potentialH = start.height - deltaYPercent
        if (potentialH >= 5 && start.y + deltaYPercent >= 0) {
          newY = start.y + deltaYPercent
          newH = potentialH
        }
      }

      // Constrain aspect ratio if locked
      if (targetRatio && containerRatio) {
        if (handle?.includes('e') || handle?.includes('w')) {
          newH = (newW * containerRatio) / targetRatio
          if (newY + newH > 100) {
            newH = 100 - newY
            newW = (newH * targetRatio) / containerRatio
          }
        } else if (handle?.includes('n') || handle?.includes('s')) {
          newW = (newH * targetRatio) / containerRatio
          if (newX + newW > 100) {
            newW = 100 - newX
            newH = (newW * containerRatio) / targetRatio
          }
        }
      }
    }

    const updatedBox: CropBox = {
      x: Math.max(0, Math.min(newX, 95)),
      y: Math.max(0, Math.min(newY, 95)),
      width: Math.max(5, Math.min(newW, 100 - newX)),
      height: Math.max(5, Math.min(newH, 100 - newY)),
    }

    setCropBox(updatedBox)
    updatePixelInputs(updatedBox, originalDimensions.width, originalDimensions.height)
  }

  const handlePointerUp = () => {
    isDraggingRef.current = false
    dragHandleRef.current = null
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
  }

  // Render cropped image onto canvas and return blob
  const generateCroppedCanvas = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!imageSrc || !originalDimensions.width) {
        resolve(null)
        return
      }

      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        // Calculate crop bounds in original image coordinates
        const cropX = (cropBox.x / 100) * img.naturalWidth
        const cropY = (cropBox.y / 100) * img.naturalHeight
        const cropW = (cropBox.width / 100) * img.naturalWidth
        const cropH = (cropBox.height / 100) * img.naturalHeight

        // Create canvas
        const canvas = document.createElement('canvas')
        const isRotated90or270 = rotation === 90 || rotation === 270

        canvas.width = Math.round(isRotated90or270 ? cropH : cropW)
        canvas.height = Math.round(isRotated90or270 ? cropW : cropH)

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(null)
          return
        }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // Apply transformations
        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)

        // Draw cropped portion
        ctx.drawImage(
          img,
          cropX,
          cropY,
          cropW,
          cropH,
          -cropW / 2,
          -cropH / 2,
          cropW,
          cropH
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
  }, [imageSrc, cropBox, rotation, flipH, flipV, exportFormat, quality, originalDimensions])

  // Update preview URL whenever crop changes
  useEffect(() => {
    let active = true
    if (!imageSrc) return

    const timer = setTimeout(async () => {
      const blob = await generateCroppedCanvas()
      if (blob && active) {
        const url = URL.createObjectURL(blob)
        setCroppedPreviewUrl(url)
      }
    }, 150)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [generateCroppedCanvas, imageSrc])

  // Download action
  const handleDownload = async () => {
    setIsExporting(true)
    try {
      const blob = await generateCroppedCanvas()
      if (!blob) throw new Error('Could not generate cropped image.')

      const ext = exportFormat === 'jpeg' ? 'jpg' : exportFormat
      const filename = `${imageName}-cropped-${customWidth}x${customHeight}.${ext}`
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

  const handleClear = () => {
    setImageSrc(null)
    setCroppedPreviewUrl(null)
    setErrorMsg(null)
    setOriginalDimensions({ width: 0, height: 0 })
    setFileSize('')
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Tool Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Browser-Native Image Suite</span>
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
              onClick={() => resetCrop()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-300 dark:border-white/10 transition-colors"
            >
              <ResetIcon className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 transition-colors"
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

      {/* Empty State / Upload Box */}
      {!imageSrc ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/[0.15] bg-slate-50 dark:bg-[#12131c] hover:bg-slate-100 dark:hover:bg-[#161724] hover:border-red-500/50 transition-all p-12 sm:p-20 text-center flex flex-col items-center justify-center cursor-pointer group"
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
            Supports high-resolution PNG, JPG, WebP, GIF, or SVG files. All processing happens 100% locally in your browser.
          </p>
          <span className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 shadow-md shadow-red-600/25">
            Select Image From Device
          </span>
        </div>
      ) : (
        /* Workspace Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Visual Editor (Col 8) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Top Editor Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] shadow-sm">
              {/* Aspect Ratio Selector */}
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-xs font-bold uppercase text-slate-400 mr-1.5">Preset:</span>
                {(
                  [
                    { key: '16:9', label: '16:9' },
                    { key: '9:16', label: '9:16' },
                    { key: '1:1', label: '1:1' },
                    { key: '4:5', label: '4:5' },
                    { key: 'original', label: 'Original' },
                    { key: 'free', label: 'Free' },
                  ] as { key: AspectRatioPreset; label: string }[]
                ).map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => handleRatioChange(preset.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      aspectRatio === preset.key
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Transform Quick Buttons */}
              <div className="flex items-center gap-1 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-white/[0.08] pt-2 sm:pt-0 sm:pl-3">
                <button
                  type="button"
                  title="Rotate Counter-Clockwise"
                  onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Rotate Clockwise"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Flip Horizontal"
                  onClick={() => setFlipH(!flipH)}
                  className={`p-2 rounded-xl transition-colors ${
                    flipH ? 'bg-red-500/20 text-red-500' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Flip Vertical"
                  onClick={() => setFlipV(!flipV)}
                  className={`p-2 rounded-xl transition-colors ${
                    flipV ? 'bg-red-500/20 text-red-500' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  <FlipVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Canvas Stage */}
            <div
              ref={imageContainerRef}
              className="relative w-full rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden min-h-[420px] max-h-[640px] select-none shadow-inner"
              style={{ touchAction: 'none' }}
            >
              {/* Checkered pattern background */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)`,
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                }}
              />

              {/* Source Image */}
              <img
                ref={imageElementRef}
                src={imageSrc}
                alt="Source preview"
                className="max-w-full max-h-[600px] object-contain transition-transform duration-100 pointer-events-none"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                }}
              />

              {/* Darkened Mask Outside Crop Box */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Top mask */}
                <div
                  className="absolute bg-black/65 backdrop-blur-[1px]"
                  style={{ top: 0, left: 0, right: 0, height: `${cropBox.y}%` }}
                />
                {/* Bottom mask */}
                <div
                  className="absolute bg-black/65 backdrop-blur-[1px]"
                  style={{
                    top: `${cropBox.y + cropBox.height}%`,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                />
                {/* Left mask */}
                <div
                  className="absolute bg-black/65 backdrop-blur-[1px]"
                  style={{
                    top: `${cropBox.y}%`,
                    left: 0,
                    width: `${cropBox.x}%`,
                    height: `${cropBox.height}%`,
                  }}
                />
                {/* Right mask */}
                <div
                  className="absolute bg-black/65 backdrop-blur-[1px]"
                  style={{
                    top: `${cropBox.y}%`,
                    left: `${cropBox.x + cropBox.width}%`,
                    right: 0,
                    height: `${cropBox.height}%`,
                  }}
                />
              </div>

              {/* Interactive Crop Box Window */}
              <div
                className="absolute border-2 border-red-500 shadow-2xl cursor-move touch-none"
                style={{
                  top: `${cropBox.y}%`,
                  left: `${cropBox.x}%`,
                  width: `${cropBox.width}%`,
                  height: `${cropBox.height}%`,
                }}
                onPointerDown={(e) => handlePointerDown(e, 'move')}
              >
                {/* Rule of thirds grid lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                  <div className="border-r border-b border-white/50" />
                  <div className="border-r border-b border-white/50" />
                  <div className="border-b border-white/50" />
                  <div className="border-r border-b border-white/50" />
                  <div className="border-r border-b border-white/50" />
                  <div className="border-b border-white/50" />
                  <div className="border-r border-white/50" />
                  <div className="border-r border-white/50" />
                  <div />
                </div>

                {/* Dimension label */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono font-bold text-white pointer-events-none">
                  {customWidth} × {customHeight} px
                </div>

                {/* 8 Resize Handles */}
                <div
                  className="crop-handle -top-2 -left-2 cursor-nwse-resize"
                  onPointerDown={(e) => handlePointerDown(e, 'nw')}
                />
                <div
                  className="crop-handle -top-2 left-1/2 -translate-x-1/2 cursor-ns-resize"
                  onPointerDown={(e) => handlePointerDown(e, 'n')}
                />
                <div
                  className="crop-handle -top-2 -right-2 cursor-nesw-resize"
                  onPointerDown={(e) => handlePointerDown(e, 'ne')}
                />
                <div
                  className="crop-handle top-1/2 -right-2 -translate-y-1/2 cursor-ew-resize"
                  onPointerDown={(e) => handlePointerDown(e, 'e')}
                />
                <div
                  className="crop-handle -bottom-2 -right-2 cursor-nwse-resize"
                  onPointerDown={(e) => handlePointerDown(e, 'se')}
                />
                <div
                  className="crop-handle -bottom-2 left-1/2 -translate-x-1/2 cursor-ns-resize"
                  onPointerDown={(e) => handlePointerDown(e, 's')}
                />
                <div
                  className="crop-handle -bottom-2 -left-2 cursor-nesw-resize"
                  onPointerDown={(e) => handlePointerDown(e, 'sw')}
                />
                <div
                  className="crop-handle top-1/2 -left-2 -translate-y-1/2 cursor-ew-resize"
                  onPointerDown={(e) => handlePointerDown(e, 'w')}
                />
              </div>
            </div>

            {/* Bottom Zoom & Image Stats Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] text-xs">
              {/* Zoom Control */}
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Zoom:</span>
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.1))}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 hover:text-red-500"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-28 accent-red-600 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.min(3, prev + 0.1))}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 hover:text-red-500"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-slate-500 dark:text-slate-400 w-10">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Source Info */}
              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                <span>
                  Original: <strong className="text-slate-800 dark:text-slate-200 font-mono">{originalDimensions.width} × {originalDimensions.height}</strong>
                </span>
                <span>•</span>
                <span>Size: <strong className="text-slate-800 dark:text-slate-200 font-mono">{fileSize}</strong></span>
              </div>
            </div>
          </div>

          {/* Controls & Export Panel (Col 4) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Dimensions & Positioning Settings */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Crop Dimensions</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Pixels</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max={originalDimensions.width}
                    value={customWidth}
                    onChange={(e) => handleCustomWidthChange(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-sm font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max={originalDimensions.height}
                    value={customHeight}
                    onChange={(e) => handleCustomHeightChange(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.1] text-sm font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Creator target hints */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-xs space-y-1 text-slate-600 dark:text-slate-400">
                <div className="font-semibold text-slate-800 dark:text-slate-200">Recommended Presets:</div>
                <div className="flex justify-between">
                  <span>YouTube Thumbnail:</span>
                  <span className="font-mono font-medium">1280 × 720 (16:9)</span>
                </div>
                <div className="flex justify-between">
                  <span>Shorts / Stories:</span>
                  <span className="font-mono font-medium">1080 × 1920 (9:16)</span>
                </div>
                <div className="flex justify-between">
                  <span>Profile Avatar:</span>
                  <span className="font-mono font-medium">800 × 800 (1:1)</span>
                </div>
              </div>
            </div>

            {/* Export Settings Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-5">
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
                      onClick={() => setExportFormat(fmt)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
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

              {/* Quality slider (for JPG and WebP) */}
              {exportFormat !== 'png' && (
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">
                    <span>Quality</span>
                    <span className="font-mono text-red-500">{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                </div>
              )}

              {/* Cropped Result Live Preview Thumbnail */}
              {croppedPreviewUrl && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span>Cropped Preview</span>
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(true)}
                      className="text-red-500 hover:underline flex items-center gap-1"
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
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all duration-200 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Image...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Download Cropped Image</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Preview Modal */}
      {showPreviewModal && croppedPreviewUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl p-6 flex flex-col items-center gap-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white">Cropped Preview ({customWidth} × {customHeight} px)</h4>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded-lg"
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
