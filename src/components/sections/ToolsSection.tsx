import React from 'react'
import { Link } from 'react-router-dom'
import { Video, Image, Search, FileCode, ArrowRight, Sparkles, CheckCircle2, Clock, Music } from 'lucide-react'

export const ToolsSection: React.FC = () => {
  return (
    <section id="tools" className="relative py-20 sm:py-28 scroll-mt-20">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-red-600/[0.04] blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Working Tools</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Free YouTube Creator Tools
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            High-speed, browser-native media editing and creator utilities. 100% compliant, private, and free.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Card 1: YouTube Link Analyzer (Featured) */}
          <div className="relative group rounded-3xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] p-8 shadow-xl hover:shadow-2xl hover:border-red-500/40 dark:hover:border-red-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 opacity-90" />

            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 shadow-sm group-hover:scale-105 transition-transform">
                  <Search className="w-7 h-7" />
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Compliant & Active</span>
                </span>
              </div>

              {/* Exact Card Title */}
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                YouTube Link Analyzer
              </h3>

              {/* Exact Card Description */}
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
                Analyze a YouTube video link and get useful video information, thumbnail tools, embed options, and creator-friendly utilities.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {['Metadata Inspection', 'HD Thumbnails', 'Embed Generator', 'Official Download Hub'].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Exact Card Button */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/[0.06]">
              <Link
                to="/tools/youtube-analyzer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-red-600/35 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Open Analyzer</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Video Cropper */}
          <div className="relative group rounded-3xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] p-8 shadow-xl hover:shadow-2xl hover:border-red-500/40 dark:hover:border-red-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-rose-600 opacity-80" />

            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 shadow-sm group-hover:scale-105 transition-transform">
                  <Video className="w-7 h-7" />
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>8-Handle Resizer</span>
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Video Cropper
              </h3>

              <p className="text-sm font-semibold text-red-600 dark:text-red-400 mt-1">
                Crop videos quickly for different platforms.
              </p>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
                Crop your videos to the perfect frame for YouTube, Shorts, TikTok and other platforms.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {['16:9 Landscape', '9:16 Shorts / Reels', '1:1 Square', '4:5 Portrait', '4:3 Standard', 'Free'].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/[0.06]">
              <Link
                to="/tools/video-cropper"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-red-600/35 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Open Video Cropper</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 3: Image Cropper */}
          <div className="relative group rounded-3xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] p-8 shadow-xl hover:shadow-2xl hover:border-red-500/40 dark:hover:border-red-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-600 to-red-600 opacity-80" />

            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 shadow-sm group-hover:scale-105 transition-transform">
                  <Image className="w-7 h-7" />
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>8-Handle Resizer</span>
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Image Cropper
              </h3>

              <p className="text-sm font-semibold text-red-600 dark:text-red-400 mt-1">
                Crop and resize images for creator content.
              </p>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
                Crop and resize images quickly for thumbnails, channel art, posts and other creator content.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {['16:9 Thumbnail', '9:16 Shorts', '1:1 Avatar', '4:3', 'PNG / JPG / WebP', 'Zoom & Rotate'].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/[0.06]">
              <Link
                to="/tools/image-cropper"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.14] border border-slate-300 dark:border-white/10 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Open Image Cropper</span>
                <ArrowRight className="w-4 h-4 text-red-500" />
              </Link>
            </div>
          </div>

          {/* Card 4: Local Video Converter */}
          <div className="relative group rounded-3xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] p-8 shadow-xl hover:shadow-2xl hover:border-red-500/40 dark:hover:border-red-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-red-600 opacity-80" />

            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 shadow-sm group-hover:scale-105 transition-transform">
                  <FileCode className="w-7 h-7" />
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Local Direct Upload</span>
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Local Video Converter
              </h3>

              <p className="text-sm font-semibold text-red-600 dark:text-red-400 mt-1">
                Convert and extract media from your local video files.
              </p>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
                Convert your directly uploaded videos to WebM, MP4, or extract audio tracks locally in your browser with zero server uploads.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {['Direct Upload', 'WebM', 'MP4', 'Audio Extract (WAV)', 'Client-Side'].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/[0.06]">
              <Link
                to="/tools/video-converter"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.14] border border-slate-300 dark:border-white/10 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Open Converter</span>
                <ArrowRight className="w-4 h-4 text-red-500" />
              </Link>
            </div>
          </div>

          {/* Card 5: Convert Video to Audio */}
          <div className="relative group rounded-3xl bg-white dark:bg-[#14151f] border border-slate-200 dark:border-white/[0.08] p-8 shadow-xl hover:shadow-2xl hover:border-red-500/40 dark:hover:border-red-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 shadow-sm group-hover:scale-105 transition-transform">
                  <Music className="w-7 h-7" />
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>100% In-Browser</span>
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Convert Video to Audio
              </h3>

              <p className="text-xs font-bold text-red-600 dark:text-red-400 tracking-wide uppercase mt-1">
                Extract MP3, WAV, & M4A Audio
              </p>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
                Upload your local video file to extract high-quality audio tracks directly in your browser. Supports MP3, WAV, and M4A formats with zero server uploads.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {['Direct Upload', 'MP3 (128-320k)', 'WAV Lossless', 'M4A (AAC)', 'Client-Side'].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/[0.06]">
              <Link
                to="/tools/video-to-audio"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.14] border border-slate-300 dark:border-white/10 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Convert to Audio</span>
                <ArrowRight className="w-4 h-4 text-red-500" />
              </Link>
            </div>
          </div>
        </div>

        {/* Small Coming Soon Notice */}
        <div className="mt-16 max-w-2xl mx-auto text-center rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-300 dark:border-white/[0.08] p-6 sm:p-8">
          <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
            More creator tools coming soon.
          </h4>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            We are actively designing additional lightweight browser utilities for creators.
          </p>
        </div>
      </div>
    </section>
  )
}
