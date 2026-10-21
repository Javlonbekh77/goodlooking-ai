'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Upload,
  Camera,
  X,
  Check,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  ExternalLink,
  Zap,
  Plus,
  Layers,
  Wand2,
  Lock,
  Scissors,
  Star,
  ThumbsUp,
  Flame,
} from 'lucide-react';
import { HAIRSTYLES, CATEGORIES } from '@/data/hairstyles';
import { Hairstyle, GenerationStatus } from '@/types';

interface StudioViewProps {
  initialStyle?: Hairstyle | null;
  onGenerationComplete: (
    originalImage: string,
    generatedImage: string,
    hairstyle: Hairstyle,
    notes?: string
  ) => void;
  isAiConfigured: boolean;
}

// Curated sample portrait for 1-click testing
const SAMPLE_PORTRAIT = '/images/sample-portrait.jpg';

export function StudioView({
  initialStyle,
  onGenerationComplete,
  isAiConfigured,
}: StudioViewProps) {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  // 3 Style Selection Modes:
  // 'templates' = Default 3D hair templates from templates folder
  // 'custom_upload' = User uploads their favourite person's style or previous photo
  // 'ai_recommendation' = AI smart style recommendations tailored to face
  const [styleMode, setStyleMode] = useState<'templates' | 'custom_upload' | 'ai_recommendation'>('templates');

  const [selectedStyle, setSelectedStyle] = useState<Hairstyle>(
    initialStyle || HAIRSTYLES[0]
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // User uploaded custom hairstyle reference image
  const [customStyleImage, setCustomStyleImage] = useState<string | null>(null);

  // AI Style analysis states
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisComplete, setAiAnalysisComplete] = useState(true);

  const [customNotes, setCustomNotes] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  // Generation status
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isQuotaExhausted, setIsQuotaExhausted] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Tayyor');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const customStyleInputRef = useRef<HTMLInputElement>(null);
  const customCameraInputRef = useRef<HTMLInputElement>(null);

  // Keep selectedStyle in sync if initialStyle changes from props
  useEffect(() => {
    if (initialStyle) {
      setSelectedStyle(initialStyle);
    }
  }, [initialStyle]);

  // Client-side canvas image optimizer (resizes to max 1280px JPEG 85%)
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawUrl = e.target?.result as string;
        if (!rawUrl) return reject(new Error('Fayl bo‘sh'));

        const img = new window.Image();
        img.onload = () => {
          const maxDim = 1280;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            resolve(rawUrl);
          }
        };
        img.onerror = () => resolve(rawUrl);
        img.src = rawUrl;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle client portrait photo selection
  const handleUserFile = async (file: File) => {
    setErrorMessage(null);
    setIsQuotaExhausted(false);

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('Rasm hajmi 20MB dan oshmasligi kerak.');
      return;
    }

    try {
      const optimized = await readFileAsDataUrl(file);
      setPhotoDataUrl(optimized);
    } catch {
      setErrorMessage('Rasmni yuklashda xatolik yuz berdi.');
    }
  };

  // Handle user uploaded custom hairstyle template / favorite person style
  const handleCustomStyleFile = async (file: File) => {
    setErrorMessage(null);
    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('Stil rasmi hajmi 20MB dan oshmasligi kerak.');
      return;
    }

    try {
      const optimized = await readFileAsDataUrl(file);
      setCustomStyleImage(optimized);
      setStyleMode('custom_upload');
    } catch {
      setErrorMessage('Stil rasmini yuklashda xatolik yuz berdi.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUserFile(e.dataTransfer.files[0]);
    }
  };

  const handleUseSample = async () => {
    setErrorMessage(null);
    setIsQuotaExhausted(false);
    try {
      const res = await fetch(SAMPLE_PORTRAIT);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoDataUrl(reader.result);
        }
      };
      reader.readAsDataURL(blob);
    } catch {
      setPhotoDataUrl(SAMPLE_PORTRAIT);
    }
  };

  // Simulated AI recommendation refresh
  const handleRefreshAiAnalysis = () => {
    setIsAiAnalyzing(true);
    setTimeout(() => {
      setIsAiAnalyzing(false);
      setAiAnalysisComplete(true);
    }, 1000);
  };

  // Generation via OpenAI gpt-image-2.5-sunburst
  const handleGenerate = async () => {
    if (!photoDataUrl) return;

    if (styleMode === 'custom_upload' && !customStyleImage) {
      setErrorMessage('Iltimos, avval o‘zingiz yoqtirgan soch uslubi rasmini yuklang.');
      return;
    }

    setErrorMessage(null);
    setIsQuotaExhausted(false);
    setStatus('preparing');
    setProgressPercent(15);
    setStatusMessage('Mijoz portreti va soch qolipi tayyorlanmoqda...');

    const timer1 = setTimeout(() => {
      setStatus('analyzing');
      setProgressPercent(40);
      setStatusMessage('AI modeliga uzatilmoqda...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setStatus('generating');
      setProgressPercent(70);
      setStatusMessage('Mijoz yuzi saqlanib, yangi soch qolipi ko‘chirilmoqda...');
    }, 3800);

    const timer3 = setTimeout(() => {
      setStatus('polishing');
      setProgressPercent(90);
      setStatusMessage('Fotorealistik soch tolalari va chakka chiziqlari tekshirilmoqda...');
    }, 9000);

    try {
      const effectiveStyle: Hairstyle =
        styleMode === 'custom_upload' && customStyleImage
          ? {
              id: 'custom-user-style',
              name: 'O‘zingiz Yuklagan Stil',
              category: 'modern',
              categoryLabel: 'Maxsus Stil',
              description: 'Siz yuklagan yoqtirgan odam yoki avvalgi soch suratingiz',
              imageUrl: customStyleImage,
              tags: ['Custom Style', 'User-Uploaded', 'Reference'],
              maintenance: 'Medium',
              faceShape: ['All'],
              promptDescription: 'User provided reference haircut photo',
            }
          : selectedStyle;

      const payload: any = {
        image: photoDataUrl,
        customNotes: customNotes.trim() || undefined,
        customPrompt: customPrompt.trim() || undefined,
      };

      if (styleMode === 'custom_upload' && customStyleImage) {
        payload.referenceImage = customStyleImage;
      } else {
        payload.hairstyleId = selectedStyle.id;
        payload.referenceImage = selectedStyle.imageUrl;
      }

      const response = await fetch('/api/generate-hairstyle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (!response.ok || !data.success || !data.image) {
        setStatus('error');

        if (data.code === 'OPENAI_QUOTA_ERROR' || (data.error && data.error.includes('quota'))) {
          setIsQuotaExhausted(true);
          setErrorMessage(
            data.error ||
              'OpenAI hisobida balans tugagan (Insufficient quota). Iltimos, platform.openai.com da hisobni to‘ldiring.'
          );
        } else if (data.code === 'OPENAI_AUTH_ERROR') {
          setErrorMessage(
            'OpenAI API kaliti yaroqsiz yoki ruxsat etilmagan. Iltimos, .env.local dagi OPENAI_API_KEY ni tekshiring.'
          );
        } else {
          setErrorMessage(
            data.error ||
              'OpenAI orqali generatsiya qilishda xatolik yuz berdi. Iltimos qaytadan urinib ko‘ring.'
          );
        }
        return;
      }

      // Safeguard: Ensure the generated result is not the exact same image
      if (data.image === photoDataUrl) {
        setStatus('error');
        setErrorMessage(
          'Model xatosi: Natija asl rasm bilan bir xil chiqdi. Iltimos qaytadan urinib ko‘ring.'
        );
        return;
      }

      setProgressPercent(100);
      setStatusMessage('Bajarildi!');
      setStatus('done');

      // Navigate to results
      onGenerationComplete(
        photoDataUrl,
        data.image,
        effectiveStyle,
        customNotes.trim() || undefined
      );
    } catch (err: unknown) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setStatus('error');
      const msg = err instanceof Error ? err.message : 'Tarmoq xatosi';
      setErrorMessage(`So‘rovda xatolik: ${msg}. Iltimos qaytadan urinib ko‘ring.`);
    }
  };

  const isGenerating =
    status === 'preparing' ||
    status === 'analyzing' ||
    status === 'generating' ||
    status === 'polishing';

  // Filter templates by category
  const filteredTemplates = HAIRSTYLES.filter(
    (h) => selectedCategory === 'all' || h.category === selectedCategory
  );

  // AI Recommended styles curation
  const aiRecommendedStyles = [
    {
      style: HAIRSTYLES[0], // Textured Fade Pompadour
      matchPercent: 99,
      badge: 'Eng Yuqori Moslik',
      reason: 'Yuz simmetriyasi va balandlik balansini ideal ochib beradi',
    },
    {
      style: HAIRSTYLES[1], // Modern Taper Fade
      matchPercent: 96,
      badge: 'Trenddagi Tanlov',
      reason: 'Har qanday kiyim uslubiga mos keluvchi universal toza fade',
    },
    {
      style: HAIRSTYLES[4], // Textured Crop Top
      matchPercent: 94,
      badge: 'Erkaklar Sezon Stili',
      reason: 'Qatlamli cho‘qqi peshona va chakkalarga qatʼiy qirralilik bag‘ishlaydi',
    },
    {
      style: HAIRSTYLES[9], // Low Taper Fringe
      matchPercent: 92,
      badge: 'Yoshlarbop & Zamonaviy',
      reason: 'Tabiiy to‘lqinli fringe yuzni yoshartiradi va dinamik hajm beradi',
    },
  ];

  return (
    <div className="flex-1 flex flex-col px-4 pt-[max(1.25rem,env(safe-area-inset-top,0px))] sm:pt-4 pb-24 space-y-5 text-white">
      {/* Studio Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F5C518]/15 border border-[#F5C518]/30 text-[10px] font-bold text-[#F5C518] uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 fill-[#F5C518]" />
            AI Hairstyle Studio
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Soch Turmagini Sinab Ko‘rish</h1>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#16161c] border border-white/10 flex items-center justify-center text-[#F5C518] shadow-md">
          <Scissors className="w-4 h-4" />
        </div>
      </div>

      {/* Step 1: Upload Client Portrait Photo */}
      <div className="bg-[#141419] border border-white/10 rounded-3xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#F5C518] text-black font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h2 className="text-sm font-bold text-white">O‘z Rasmingizni Yuklang (Mijoz Portreti)</h2>
          </div>
          {photoDataUrl && (
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <Check className="w-3.5 h-3.5" /> Rasm Tayyor
            </span>
          )}
        </div>

        {/* Upload Container or Photo Preview */}
        {!photoDataUrl ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-[#F5C518]/40 hover:border-[#F5C518] bg-[#101014] rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-3"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#1a1a22] border border-[#F5C518]/30 flex items-center justify-center text-[#F5C518] shadow-inner">
              <Upload className="w-7 h-7 stroke-[2]" />
            </div>

            <div>
              <p className="text-sm font-bold text-white">
                O‘z portret rasmingizni yuklang
              </p>
              <p className="text-[11px] text-zinc-400 mt-1 max-w-xs">
                Yuzingiz va sochingiz aniq ko‘ringan selfi yoki portret eng fotorealistik natija beradi
              </p>
            </div>

            {/* Action buttons: Pick File / Camera / Sample */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 w-full">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#1f1f2a] hover:bg-[#282836] text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/10 transition-colors flex items-center gap-1.5 shadow"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#F5C518]" />
                Rasm Tanlash
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="bg-[#1f1f2a] hover:bg-[#282836] text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/10 transition-colors flex items-center gap-1.5 shadow"
              >
                <Camera className="w-3.5 h-3.5 text-[#F5C518]" />
                Kamera
              </button>

              <button
                type="button"
                onClick={handleUseSample}
                className="bg-[#F5C518]/15 hover:bg-[#F5C518]/25 text-[#F5C518] border border-[#F5C518]/30 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-colors"
              >
                Namuna Bilan Sinash
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={(e) => e.target.files?.[0] && handleUserFile(e.target.files[0])}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={(e) => e.target.files?.[0] && handleUserFile(e.target.files[0])}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d12]">
            <div className="relative h-64 w-full">
              <Image
                src={photoDataUrl}
                alt="Yuklangan mijoz portreti"
                fill
                className="object-contain"
                sizes="(max-width: 480px) 100vw, 400px"
              />
            </div>

            {/* Change or remove buttons */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/10">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-zinc-300 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Rasmni almashtirish"
              >
                Almashtirish
              </button>
              <button
                onClick={() => setPhotoDataUrl(null)}
                className="text-zinc-400 hover:text-rose-400 p-1 rounded-lg hover:bg-white/10 transition-colors"
                title="O‘chirish"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={(e) => e.target.files?.[0] && handleUserFile(e.target.files[0])}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Progressive Disclosure: Step 2 only unlocks when photoDataUrl is provided */}
      {!photoDataUrl ? (
        <div className="bg-[#141419]/50 border border-white/5 rounded-3xl p-5 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto text-zinc-500">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            2-bosqich: Soch Qoliplari va Stillar
          </h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Avval 1-bosqichda o‘z rasmingizni yuklang — shunda 10 xil soch qoliplari, o‘zingiz yoqtirgan rasm yoki AI mos uslub takliflari ochiladi!
          </p>
        </div>
      ) : (
        /* Step 2: Choose Hairstyle Mode (Templates / Custom Upload / AI Recommendation) */
        <div className="bg-[#141419] border border-white/10 rounded-3xl p-4 shadow-lg space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#F5C518] text-black font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="text-sm font-bold text-white">Soch Uslubini Tanlang</h2>
            </div>
            <span className="text-xs text-[#F5C518] font-bold truncate max-w-[170px] text-right">
              {styleMode === 'custom_upload' && customStyleImage
                ? 'O‘z stilingiz'
                : selectedStyle.name}
            </span>
          </div>

          {/* 3 Interactive Mode Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#0f0f14] rounded-2xl border border-white/5 text-xs font-semibold">
            {/* Tab 1: Default Catalog Templates */}
            <button
              type="button"
              onClick={() => setStyleMode('templates')}
              className={`py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-center ${
                styleMode === 'templates'
                  ? 'bg-[#F5C518] text-black shadow-md font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="text-[11px] leading-tight">Qoliplar (10)</span>
            </button>

            {/* Tab 2: Upload Favorite Person / Past Photo */}
            <button
              type="button"
              onClick={() => setStyleMode('custom_upload')}
              className={`py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-center relative ${
                styleMode === 'custom_upload'
                  ? 'bg-[#F5C518] text-black shadow-md font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {customStyleImage && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black"></span>
              )}
              <Upload className="w-4 h-4" />
              <span className="text-[11px] leading-tight">Yoqtirgan Stil</span>
            </button>

            {/* Tab 3: AI Smart Recommendation */}
            <button
              type="button"
              onClick={() => setStyleMode('ai_recommendation')}
              className={`py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-center ${
                styleMode === 'ai_recommendation'
                  ? 'bg-[#F5C518] text-black shadow-md font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              <span className="text-[11px] leading-tight">AI Taklifi</span>
            </button>
          </div>

          {/* Mode 1: Default 3D Catalog Templates */}
          {styleMode === 'templates' && (
            <div className="space-y-3">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors border ${
                      selectedCategory === cat.id
                        ? 'bg-[#F5C518]/20 border-[#F5C518] text-[#F5C518] font-bold'
                        : 'bg-[#121217] border-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Grid of 10 Mannequin Hairstyle Templates */}
              <div className="grid grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                {filteredTemplates.map((style) => {
                  const isSelected = selectedStyle.id === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedStyle(style)}
                      className={`text-left rounded-2xl p-2 flex flex-col justify-between transition-all relative overflow-hidden border ${
                        isSelected
                          ? 'border-[#F5C518] bg-[#1a1a24] shadow-[0_0_15px_rgba(245,197,24,0.25)] ring-1 ring-[#F5C518]'
                          : 'border-white/8 bg-[#101015] hover:border-white/20'
                      }`}
                    >
                      {/* Checkmark badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#F5C518] text-black flex items-center justify-center z-10 shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}

                      <div className="relative h-32 w-full rounded-xl overflow-hidden bg-zinc-900 mb-2 border border-white/5">
                        <Image
                          src={style.imageUrl}
                          alt={style.name}
                          fill
                          className="object-cover"
                          sizes="180px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                        <span className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-md text-[9px] font-bold text-white px-1.5 py-0.5 rounded">
                          {style.categoryLabel}
                        </span>
                      </div>

                      <div>
                        <h4
                          className={`text-xs font-bold leading-tight ${
                            isSelected ? 'text-[#F5C518]' : 'text-white'
                          }`}
                        >
                          {style.name}
                        </h4>
                        <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1 leading-snug">
                          {style.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode 2: Upload Favorite Person / Past Photo Style */}
          {styleMode === 'custom_upload' && (
            <div className="space-y-3">
              <div className="bg-[#101015] border border-white/10 rounded-2xl p-4 text-center space-y-3">
                <div className="text-left">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-[#F5C518]" />
                    O‘zingiz Yoqtirgan Odam Stili yoki Avvalgi Rasmingiz
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                    Mashhur shaxs, qahramon, do‘stingiz yoki o‘zingizning avvalgi eng yoqqan suratingizni yuklang. OpenAI Sunburst aynan shu soch turmagini ko‘chirib beradi!
                  </p>
                </div>

                {!customStyleImage ? (
                  <div
                    onClick={() => customStyleInputRef.current?.click()}
                    className="border-2 border-dashed border-[#F5C518]/50 hover:border-[#F5C518] bg-[#15151e] rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#F5C518]/15 border border-[#F5C518]/30 flex items-center justify-center text-[#F5C518] group-hover:scale-105 transition-transform">
                      <Plus className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-[#F5C518] transition-colors">
                        Yoqtirgan soch suratingizni yuklang
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        JPEG, PNG yoki WebP formatida
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-[11px] font-semibold text-[#F5C518] bg-[#F5C518]/15 px-3 py-1 rounded-lg border border-[#F5C518]/30">
                        Galereyadan Tanlash
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          customCameraInputRef.current?.click();
                        }}
                        className="text-[11px] font-semibold text-white bg-white/10 hover:bg-white/15 px-3 py-1 rounded-lg border border-white/10"
                      >
                        Kamera
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border-2 border-[#F5C518] bg-[#0c0c10] p-3 text-left flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black shrink-0 border border-white/20">
                        <Image
                          src={customStyleImage}
                          alt="Siz yuklagan maxsus stil"
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="bg-[#F5C518] text-black text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Faol Stil
                          </span>
                          <h4 className="text-xs font-bold text-white">Siz Yuklagan Stil Qolipi</h4>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          OpenAI ushbu rasmdagi sochni yuzingizga moslashtiradi
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => customStyleInputRef.current?.click()}
                        className="text-xs text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
                      >
                        Almashtirish
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomStyleImage(null)}
                        className="text-zinc-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        title="O‘chirish"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <input
                  ref={customStyleInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={(e) => e.target.files?.[0] && handleCustomStyleFile(e.target.files[0])}
                  className="hidden"
                />
                <input
                  ref={customCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => e.target.files?.[0] && handleCustomStyleFile(e.target.files[0])}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Mode 3: AI Smart Recommendation */}
          {styleMode === 'ai_recommendation' && (
            <div className="space-y-3">
              {/* AI Smart Advisor Banner */}
              <div className="bg-gradient-to-r from-[#171725] via-[#1a1a2e] to-[#171725] border border-[#F5C518]/30 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#F5C518]/20 border border-[#F5C518]/40 flex items-center justify-center text-[#F5C518]">
                      <Wand2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">AI Yuz Tahlili & Tavsiyalar</h3>
                      <p className="text-[10px] text-zinc-400">Oval & Qirrali yuz tuzilishi aniqlandi</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRefreshAiAnalysis}
                    className="text-[10px] font-semibold text-[#F5C518] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isAiAnalyzing ? 'animate-spin' : ''}`} />
                    Qayta Tahlil
                  </button>
                </div>

                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Sunʼiy intellekt yuklangan portretingizni skanerlab, boshingiz geometriyasi va yuz qirralariga eng mos keladigan top 4 ta stilni saraladi:
                </p>
              </div>

              {/* Recommended Cards Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {aiRecommendedStyles.map(({ style, matchPercent, badge, reason }) => {
                  const isSelected = selectedStyle.id === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedStyle(style)}
                      className={`text-left rounded-2xl p-2.5 flex flex-col justify-between transition-all relative overflow-hidden border ${
                        isSelected
                          ? 'border-[#F5C518] bg-[#1a1a24] shadow-[0_0_15px_rgba(245,197,24,0.3)] ring-1 ring-[#F5C518]'
                          : 'border-white/10 bg-[#101015] hover:border-white/20'
                      }`}
                    >
                      {/* Match percentage pill */}
                      <div className="absolute top-2 left-2 z-10 bg-emerald-500/90 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                        {matchPercent}% Moslik
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#F5C518] text-black flex items-center justify-center z-10 shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}

                      <div className="relative h-28 w-full rounded-xl overflow-hidden bg-zinc-900 mb-2 border border-white/5">
                        <Image
                          src={style.imageUrl}
                          alt={style.name}
                          fill
                          className="object-cover"
                          sizes="180px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                      </div>

                      <div>
                        <span className="text-[9px] font-bold text-[#F5C518] uppercase tracking-wider block">
                          {badge}
                        </span>
                        <h4
                          className={`text-xs font-bold leading-tight mt-0.5 ${
                            isSelected ? 'text-[#F5C518]' : 'text-white'
                          }`}
                        >
                          {style.name}
                        </h4>
                        <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-tight">
                          {reason}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Optional Custom Wish / Custom Prompt Accordion */}
          <div className="border border-white/8 rounded-2xl overflow-hidden bg-[#101015]">
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="w-full px-3 py-2.5 flex items-center justify-between text-xs text-zinc-300 hover:text-white"
            >
              <span className="font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F5C518]" />
                Qo‘shimcha istak yoki barber talabi (Ixtiyoriy)
              </span>
              {showNotes ? (
                <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              )}
            </button>

            {showNotes && (
              <div className="px-3 pb-3 pt-1 space-y-2">
                <div>
                  <label className="text-[10px] text-zinc-400 mb-1 block">
                    Soch rangi, uzunligi yoki chakka chiziqlari:
                  </label>
                  <input
                    type="text"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="Masalan: qora tabiiy soch, chakkalari pastki skin fade, soqoli o‘zgarishsiz qolsin..."
                    className="w-full bg-[#181820] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5C518]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 mb-1 block">
                    To‘g‘ridan-to‘g‘ri model prompti (Advanced):
                  </label>
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Masalan: sharp high skin fade with messy textured crop on top"
                    className="w-full bg-[#181820] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5C518]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Generation & Action Button */}
      <div className="space-y-3">
        {/* Selected Pair Preview: Client Photo + Chosen Hairstyle Template */}
        {photoDataUrl && (
          <div className="bg-[#121217] border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0">
                <Image src={photoDataUrl} alt="Mijoz surati" fill className="object-cover" />
              </div>
              <div className="text-[11px] leading-tight">
                <p className="text-zinc-400">1. Mijoz surati</p>
                <p className="text-white font-semibold">Yuklangan</p>
              </div>
            </div>

            <div className="text-[#F5C518] font-bold text-sm shrink-0 px-1">➔</div>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black border border-[#F5C518]/40 shrink-0">
                <Image
                  src={
                    styleMode === 'custom_upload' && customStyleImage
                      ? customStyleImage
                      : selectedStyle.imageUrl
                  }
                  alt="Tanlangan Andoza"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-[11px] leading-tight min-w-0">
                <p className="text-zinc-400">2. Tanlangan qolip</p>
                <p className="text-[#F5C518] font-semibold truncate max-w-[110px]">
                  {styleMode === 'custom_upload' && customStyleImage
                    ? 'O‘z stilingiz'
                    : selectedStyle.name}
                </p>
              </div>
            </div>
          </div>
        )}
        {/* OpenAI Balance Exhausted / Quota Error Alert */}
        {isQuotaExhausted && (
          <div className="bg-amber-950/40 border border-amber-500/50 rounded-2xl p-4 text-xs text-amber-200 space-y-2.5 shadow-xl">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300 text-sm">
                  OpenAI Hisobida Balans Tugagan
                </p>
                <p className="text-[11px] text-amber-200/90 mt-1 leading-relaxed">
                  Ulangan OpenAI <code>gpt-image-2.5-sunburst</code> modeli uchun hisob balansi tugagan (Insufficient quota).
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="https://platform.openai.com/billing"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#F5C518] hover:bg-[#ffcf24] text-black font-bold px-3 py-1.5 rounded-xl text-xs transition-colors shadow-md"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                platform.openai.com/billing da hisobni to‘ldirish
              </a>
            </div>
          </div>
        )}

        {/* General Error Alert */}
        {errorMessage && !isQuotaExhausted && (
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-3.5 text-xs text-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-rose-300">Generatsiya Xabarnomasi</p>
              <p className="mt-0.5 leading-relaxed text-[11px]">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Active Generation Progress Bar */}
        {isGenerating && (
          <div className="bg-[#141419] border border-[#F5C518]/30 rounded-2xl p-4 space-y-2.5 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#F5C518] font-semibold flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {statusMessage}
              </span>
              <span className="text-zinc-400 font-mono text-[11px]">
                {progressPercent}%
              </span>
            </div>

            <div className="w-full h-2 bg-[#202028] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#F5C518] to-amber-300 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <p className="text-[10px] text-zinc-400 text-center">
              Mijoz yuzi 100% saqlanib, tanlangan soch qolipi ko‘chirilmoqda...
            </p>
          </div>
        )}

        {/* Primary Action Button: Yellow Gold Glow */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!photoDataUrl || isGenerating}
          className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-xl ${
            !photoDataUrl || isGenerating
              ? 'bg-[#1e1e26] text-zinc-500 cursor-not-allowed border border-white/5'
              : 'bg-[#F5C518] hover:bg-[#ffcf24] active:scale-[0.99] text-black gold-glow'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              Soch Turmagi Yaratilmoqda...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Sochni O‘zgartirish
            </>
          )}
        </button>

        {!photoDataUrl && (
          <p className="text-[11px] text-zinc-500 text-center">
            Generatsiyani boshlash uchun 1-bosqichda mijoz portretini yuklang
          </p>
        )}
      </div>
    </div>
  );
}
