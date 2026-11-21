# 🎬 YouTube Free Tools

> **Free, Browser-Native Media Suite for YouTube Creators**  
> Simple, fast, and 100% private tools to help creators edit, optimize, and manage their content. Zero server uploads, zero sign-ups, and zero watermarks.

[![React](https://img.shields.io/badge/React-19.2-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.3-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ Features & Tools

### 1. 🔍 YouTube Link Analyzer (`/tools/youtube-analyzer`)
- **Metadata Inspection**: Title, author, duration, view count, and publish dates.
- **HD Thumbnails**: One-click preview and download for MaxRes (1080p), High-Quality (HQ), and Medium (MQ) thumbnails.
- **Custom Embed Generator**: Configure start/end times, autoplay, hide controls, looping, and privacy-enhanced `youtube-nocookie.com` mode.
- **Direct Media Inspection**: Inspect local and remote video files directly.

### 2. 🎥 Video Cropper (`/tools/video-cropper`)
- **8-Handle Visual Crop**: Interactive canvas overlay with rule-of-thirds grid.
- **Popular Presets**: 16:9 Landscape, 9:16 Shorts / Reels / TikTok, 1:1 Square, 4:5 Instagram, 4:3 Standard, and Freeform.
- **Precision Controls**: Coordinate inputs (`x`, `y`, `width`, `height`) with live pixel snapping.
- **Client-Side Export**: High-speed in-browser video rendering with zero data uploaded to external servers.

### 3. 🖼️ Image Cropper (`/tools/image-cropper`)
- **Thumbnail & Avatar Presets**: 16:9 (YouTube Thumbnails), 9:16 (Stories/Shorts), 1:1 (Avatars/Logos).
- **Transform Tools**: 90° rotation, horizontal flip, vertical flip, and zoom slider (1x - 3x).
- **Multi-Format Export**: Save as PNG, high-efficiency WebP, or JPEG with adjustable quality compression.

### 4. 🎵 Video to Audio Converter (`/tools/video-to-audio`)
- **Direct Browser Extraction**: Extracts high-fidelity audio tracks locally from MP4, WebM, MOV, and MKV files.
- **Multiple Formats**:
  - **MP3** with configurable bitrates (128 kbps, 192 kbps, 256 kbps, 320 kbps) via LAME encoder.
  - **WAV** Lossless 16-bit PCM audio.
  - **M4A (AAC)** via browser WebCodecs / MediaRecorder.

### 5. 🔄 Local Video Converter (`/tools/video-converter`)
- **Format Conversion**: Convert local videos between WebM and MP4 container formats.
- **Resolution Scaling**: Downscale or maintain 1080p, 720p, or 480p targets.
- **Audio Extraction**: Integrated WAV track ripping.

---

## 🔒 Privacy & Architecture

All processing is executed **100% client-side** using standard browser APIs:
- **HTML5 Canvas & Video API**: Frame-by-frame visual transformations.
- **Web Audio API**: Audio decoding, channel mixing, and sample processing.
- **WebCodecs & MediaStream Recording**: Native in-memory encoding.
- **Zero Server Latency**: Your media assets never leave your computer.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/youtube-free-tools.git

# Navigate to project folder
cd youtube-free-tools

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Build for Production

```bash
# Typecheck and compile production bundle
npm run build

# Preview production build locally
npm run preview

# Run linter
npm run lint
```

---

## 📁 Project Structure

```text
src/
├── components/
│   ├── common/         # CropBoxOverlay, PrecisionControls, ZoomControls, Breadcrumb, Logo, ThemeToggle
│   ├── layout/         # Header, Footer
│   ├── modals/         # InfoModal (Privacy, Terms, Contact)
│   ├── sections/       # HeroSection, ToolsSection, AboutSection
│   └── tools/          # VideoCropper, ImageCropper, YouTubeLinkAnalyzer, LocalVideoConverter, VideoToAudioConverter
├── context/            # ThemeContext (Dark / Light mode)
├── pages/              # Tool routes & HomePage
├── types/              # TypeScript schemas (crop, media, navigation)
└── utils/              # AudioEncoder (MP3/WAV/M4A), Canvas utils
```

---

## 📄 License & Disclaimer

- **License**: MIT License. Free for creators and developers.
- **Disclaimer**: YouTube Free Tools is an independent creator project and is not affiliated with, sponsored by, or endorsed by YouTube, Google LLC, or Alphabet Inc.
