# 🎬 YouTube Free Tools

> **Free Creator Media Suite with Liquid Glass UI & Up to 4K Video Enhancement**  
> Fast, modern, privacy-first tools to help YouTube creators enhance, crop, analyze, and extract audio from their content.

[![React](https://img.shields.io/badge/React-19.2-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.3-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg?logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ Features & Tools

### 1. ✨ Video Quality Enhancer (`/tools/video-enhancer`)
- **Output Resolutions up to 4K UHD**: Original, 720p HD (`1280×720`), 1080p Full HD (`1920×1080`), 1440p QHD (`2560×1440`), and 4K UHD (`3840×2160`).
- **Aspect Ratio Preservation**: Automatically calculates even-aligned pixel dimensions matching your footage orientation (including 9:16 vertical Shorts) without stretching.
- **Mode 1 — Standard Upscaling (FFmpeg)**: Lanczos scaling (`flags=lanczos`), H.264 (`libx264`) and H.265 (`libx265`) encoding, configurable quality tiers and encoding presets, plus synchronized AAC audio.
- **Mode 2 — AI Video Enhancement (Real-ESRGAN)**: Genuine frame-by-frame super-resolution via a configured GPU worker (`AI_ENHANCER_API_URL` or `realesrgan-ncnn-vulkan`) with configurable strength, denoise, and temporal consistency.
- **Cloud-Native Security**: Direct browser-to-S3 signed uploads, HMAC-SHA256 `HttpOnly` session cookies, job ownership isolation, rate limiting, and automatic temporary file cleanup.

### 2. 🔍 YouTube Link Analyzer (`/tools/youtube-analyzer`)
- **Metadata Inspection**: Video ID, title, channel author, and canonical/short URLs via YouTube oEmbed.
- **HD Thumbnails**: Preview and download MaxRes (1280×720), HQ (480×360), and MQ (320×180) thumbnails.
- **Custom Embed Generator**: Start/end times, autoplay, controls toggle, and loop parameters.
- **Direct Media Inspector**: Inspect authorized direct MP4/WebM/MOV links or local video files.

### 3. 🎥 Video Cropper (`/tools/video-cropper`)
- **8-Handle Visual Crop**: Interactive canvas overlay with rule-of-thirds grid and pixel snapping.
- **Presets**: 16:9 Landscape, 9:16 Shorts/Reels, 1:1 Square, 4:5 Portrait, 4:3 Standard, Original, and Freeform.
- **100% In-Browser**: Encodes strictly the cropped region locally via HTML5 Canvas and MediaRecorder.

### 4. 🖼️ Image Cropper (`/tools/image-cropper`)
- **Thumbnail & Avatar Presets**: 16:9, 9:16, 1:1, 4:5, 4:3, and Freeform.
- **Transform Tools**: ±90° rotation, horizontal/vertical flip, zoom (50%–300%), and PNG/JPG/WebP export with quality slider.

### 5. 🎵 Video to Audio Converter (`/tools/video-to-audio`)
- **Browser Audio Extraction**: Extracts MP3 (128/192/320 kbps via LAME), lossless WAV (16-bit PCM), and M4A (WebCodecs AAC + `mp4-muxer`) locally in memory.

### 6. 🔄 Local Video Converter (`/tools/video-converter`)
- **Format & Resolution Conversion**: Convert local videos to WebM, MP4, or extract WAV audio locally in-browser.

---

## 🏗️ Video Enhancer Architecture (Vercel + External Worker)

Heavy FFmpeg / GPU AI video processing **never** executes inside Vercel serverless functions:

```text
Browser (Vercel SPA + Liquid Glass UI)
  ├── 1. POST /api/auth/session         ──▶ Vercel Serverless (HMAC-SHA256 HttpOnly cookie)
  ├── 2. POST /api/enhancer/upload-url  ──▶ Vercel Serverless (Presigned S3 PUT URL)
  ├── 3. PUT  <signed-s3-url>           ──▶ S3-Compatible Storage (R2 / S3 / B2 / MinIO)
  ├── 4. POST /api/enhancer/jobs        ──▶ Vercel Serverless ──▶ External Worker (/worker)
  └── 5. GET  /api/enhancer/jobs/:id    ──▶ Polls real FFmpeg / Real-ESRGAN progress & signed download URL
```

---

## 🚀 Local Setup & Deployment

### 1. Frontend & Vercel Serverless API

```bash
# Install dependencies using the lockfile
npm ci

# Start local development server
npm run dev

# Run linter, TypeScript check, and production build
npm run lint
npm run build
```

Copy `.env.example` to `.env.local` (or configure in **Vercel Project Settings → Environment Variables**):
- `SESSION_SECRET` — 32+ byte hex secret for signing `ytt_session` cookies
- `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE`
- `ENHANCER_WORKER_URL`, `ENHANCER_WORKER_SECRET`
- Optional: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` for distributed rate limiting

> **S3 Bucket CORS Note:** Configure your S3/R2 bucket CORS policy to allow `PUT` and `GET` from your Vercel domain with `Content-Type` allowed so direct browser uploads succeed.

### 2. Standalone Processing Worker (`/worker`)

Deploy `/worker` on Railway, Render, Fly.io, AWS ECS, or a GPU VPS (Dockerized with FFmpeg):

```bash
cd worker
cp .env.example .env
npm install
npm run build
npm start
```

Or build via Docker:

```bash
cd worker
docker build -t yt-enhancer-worker .
docker run -p 8787:8787 --env-file .env yt-enhancer-worker
```

To enable **Mode 2 (AI Video Enhancement)**, configure either:
- `AI_ENHANCER_API_URL` (+ optional `AI_ENHANCER_API_KEY`) pointing to your GPU Real-ESRGAN endpoint, or
- `REALESRGAN_BIN_PATH` pointing to `realesrgan-ncnn-vulkan` inside a GPU-enabled container.

---

## 📁 Project Structure

```text
├── api/                    # Vercel Serverless Functions (auth, capabilities, presigned S3, jobs)
├── worker/                 # Standalone FFmpeg + optional GPU Real-ESRGAN worker service + Dockerfile
├── src/
│   ├── components/
│   │   ├── common/         # Breadcrumb, CropBoxOverlay, Logo, PrecisionControls, ThemeToggle, ZoomControls
│   │   ├── layout/         # Liquid Glass Header & Footer
│   │   ├── modals/         # Native <dialog> InfoModal
│   │   ├── sections/       # HeroSection, ToolsSection, AboutSection
│   │   └── tools/          # VideoQualityEnhancer, VideoCropper, ImageCropper, YouTubeLinkAnalyzer, etc.
│   ├── pages/              # Route pages
│   ├── types/              # TypeScript interfaces (enhancer, crop, navigation)
│   └── utils/              # audioEncoder.ts, enhancerMath.ts
├── vercel.json             # Vercel SPA + /api routing, security headers & immutable asset caching
└── .env.example            # Server environment variable template
```

---

## 📄 Disclaimer

YouTube Free Tools is an independent creator project and is not affiliated with, sponsored by, or endorsed by YouTube, Google LLC, or Alphabet Inc. Upscaling increases output resolution and encoding clarity, but cannot guarantee recovery of fine detail absent from the original footage.
