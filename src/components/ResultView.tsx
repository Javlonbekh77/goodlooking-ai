'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Download,
  RotateCcw,
  Sparkles,
  Scissors,
  Check,
  Share2,
  SlidersHorizontal,
  LayoutGrid,
  Info,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Hairstyle } from '@/types';

interface ResultViewProps {
  originalImage: string;
  generatedImage: string;
  hairstyle: Hairstyle;
  customNotes?: string;
  onTryAnotherStyle: () => void;
  onNewPhoto: () => void;
}

export function ResultView({
  originalImage,
  generatedImage,
  hairstyle,
  customNotes,
  onTryAnotherStyle,
  onNewPhoto,
}: ResultViewProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [isCopied, setIsCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F5C518', '#ffffff', '#FFD600'],
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  // Handle drag for split comparison slider
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  };

  // Download generated image
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `goodlooking-${hairstyle.id}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Share / Copy Link
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col px-4 pt-[max(1.25rem,env(safe-area-inset-top,0px))] sm:pt-4 pb-24 space-y-4 text-white">
      {/* Result Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-[#F5C518] tracking-widest uppercase block">
            AI Transformatsiya Natijasi
          </span>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
            Yangi Soch Turmagingiz <Sparkles className="w-4 h-4 text-[#F5C518]" />
          </h1>
        </div>

        {/* View mode toggle: Slider vs Side-by-side */}
        <div className="bg-[#141419] border border-white/10 rounded-full p-1 flex items-center gap-1">
          <button
            onClick={() => setViewMode('slider')}
            className={`p-1.5 rounded-full transition-colors ${
              viewMode === 'slider'
                ? 'bg-[#F5C518] text-black'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Comparison Slider"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`p-1.5 rounded-full transition-colors ${
              viewMode === 'side-by-side'
                ? 'bg-[#F5C518] text-black'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Side by Side"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Comparison Canvas */}
      {viewMode === 'slider' ? (
        <div className="relative bg-[#141419] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div
            ref={containerRef}
            onMouseDown={() => {
              isDragging.current = true;
            }}
            onMouseUp={() => {
              isDragging.current = false;
            }}
            onMouseLeave={() => {
              isDragging.current = false;
            }}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="relative h-80 sm:h-96 w-full cursor-ew-resize select-none overflow-hidden touch-none"
          >
            {/* Generated AI Image (Underneath / Right side) */}
            <div className="absolute inset-0">
              <Image
                src={generatedImage}
                alt="AI Generated Hairstyle Preview"
                fill
                className="object-cover"
                sizes="(max-width: 480px) 100vw, 420px"
                priority
              />
              <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-[#F5C518] border border-[#F5C518]/30 text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                AI Preview
              </span>
            </div>

            {/* Original Image (Clipped Left Side) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <div className="relative h-full w-[430px] sm:w-[480px]">
                <Image
                  src={originalImage}
                  alt="Original portrait"
                  fill
                  className="object-cover"
                  sizes="(max-width: 480px) 100vw, 420px"
                  priority
                />
              </div>
              <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white border border-white/20 text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                Original
              </span>
            </div>

            {/* Draggable Divider Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-[#F5C518] shadow-[0_0_12px_#F5C518] pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#F5C518] text-black flex items-center justify-center shadow-lg border-2 border-black font-bold text-xs pointer-events-auto cursor-grab active:cursor-grabbing">
                ⇄
              </div>
            </div>
          </div>

          <p className="py-2 text-[11px] text-zinc-400 text-center bg-[#101015]">
            Drag slider left or right to compare Before and After
          </p>
        </div>
      ) : (
        /* Side by Side mode */
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-[#141419] border border-white/10 rounded-2xl p-2 relative overflow-hidden">
            <span className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
              Original
            </span>
            <div className="relative h-56 w-full rounded-xl overflow-hidden bg-black">
              <Image
                src={originalImage}
                alt="Original"
                fill
                className="object-cover"
                sizes="200px"
              />
            </div>
          </div>

          <div className="bg-[#141419] border border-[#F5C518]/40 rounded-2xl p-2 relative overflow-hidden shadow-lg">
            <span className="absolute top-3 left-3 z-10 bg-[#F5C518] text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              AI Preview
            </span>
            <div className="relative h-56 w-full rounded-xl overflow-hidden bg-black">
              <Image
                src={generatedImage}
                alt="AI Generated"
                fill
                className="object-cover"
                sizes="200px"
              />
            </div>
          </div>
        </div>
      )}

      {/* Selected Style Detail Card */}
      <div className="bg-[#141419] border border-white/10 rounded-3xl p-4 shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Hairstyle Applied
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              {hairstyle.name}
            </h3>
          </div>
          <span className="bg-[#F5C518]/15 text-[#F5C518] border border-[#F5C518]/30 text-xs font-bold px-3 py-1 rounded-full">
            {hairstyle.categoryLabel}
          </span>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          {hairstyle.description}
        </p>

        {customNotes && (
          <div className="bg-[#191922] rounded-xl p-2 text-xs text-zinc-300 border border-white/5">
            <span className="text-zinc-500 font-medium">Custom note:</span> {customNotes}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {hairstyle.tags.map((tag) => (
            <span
              key={tag}
              className="bg-white/5 text-zinc-300 text-[10px] px-2 py-0.5 rounded-md border border-white/5"
            >
              #{tag}
            </span>
          ))}
          <span className="bg-white/5 text-zinc-300 text-[10px] px-2 py-0.5 rounded-md border border-white/5">
            Maintenance: {hairstyle.maintenance}
          </span>
        </div>
      </div>

      {/* Barber Action Card: Matching Phone 2 appointment concept in reference */}
      <div className="bg-gradient-to-r from-[#171720] to-[#1a1a24] border border-[#F5C518]/30 rounded-3xl p-4 flex items-center justify-between shadow-lg">
        <div>
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-[#F5C518]" />
            Star Quality Cutz
          </h4>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Show this preview to your barber for the exact haircut.
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="bg-[#F5C518] text-black text-xs font-bold px-3 py-2 rounded-xl hover:bg-[#ffcf24] transition-all flex items-center gap-1 shrink-0"
        >
          <Calendar className="w-3.5 h-3.5" />
          Save Cut
        </button>
      </div>

      {/* Primary Actions: Download + Try Another + New Photo */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleDownload}
          className="w-full bg-[#F5C518] hover:bg-[#ffcf24] active:scale-[0.99] text-black font-bold py-3.5 rounded-2xl text-sm transition-all gold-glow flex items-center justify-center gap-2 shadow-xl"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          Download Hairstyle Photo
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onTryAnotherStyle}
            className="bg-[#1a1a24] hover:bg-[#222230] text-white text-xs font-semibold py-3 rounded-2xl border border-white/10 transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#F5C518]" />
            Try Another Style
          </button>

          <button
            onClick={handleShare}
            className="bg-[#1a1a24] hover:bg-[#222230] text-white text-xs font-semibold py-3 rounded-2xl border border-white/10 transition-colors flex items-center justify-center gap-1.5"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#F5C518]" />
                Share Look
              </>
            )}
          </button>
        </div>

        <button
          onClick={onNewPhoto}
          className="w-full text-zinc-400 hover:text-white text-xs py-2 transition-colors"
        >
          Upload a different portrait photo
        </button>
      </div>

      {/* Disclaimer Notice required by Prompt 1 */}
      <div className="flex items-start gap-2 bg-[#0d0d12] border border-white/5 rounded-xl p-3 text-[10px] text-zinc-500 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
        <span>
          <strong>Model:</strong> OpenAI gpt-image-2.5-sunburst orqali 2-rasm uzatish asosida fotorealistik soch almashtirish. Mijoz yuzi va shaxsi to‘liq saqlanadi.
        </span>
      </div>
    </div>
  );
}
