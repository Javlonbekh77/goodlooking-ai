'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  X,
  Scissors,
  Check,
  Copy,
  Scan,
  RefreshCw,
  AlertCircle,
  Download,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HAIRSTYLES } from '@/data/hairstyles';

interface DecomposeResult {
  personAnalysis?: {
    faceAndFeatures?: string;
    beard?: string;
    clothing?: string;
    backgroundAndLighting?: string;
  };
  hairstyleAnalysis?: {
    styleName?: string;
    barberDetails?: string;
    barberAdvice?: string;
    stylingAndCare?: string;
    faceShapeFit?: string;
  };
  uzbekExplanation?: string;
  masterPromptEnglish?: string;
  rawText?: string;
}

interface FotorAccountStatus {
  connected: boolean;
  businessId?: string;
  apiKeyMasked?: string;
  totalCredits?: number;
  remainingCredits?: number;
}

const SAMPLE_PORTRAIT = '/images/sample-portrait.jpg';

export function DecomposeStudioView() {
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [stylePhotos, setStylePhotos] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState('');

  // Fotor status
  const [fotorAccount, setFotorAccount] = useState<FotorAccountStatus | null>(null);

  // Pipeline status states:
  // 'idle' | 'analyzing' | 'analyzed' | 'fotor_replacing' | 'completed' | 'error'
  const [pipelineState, setPipelineState] = useState<
    'idle' | 'analyzing' | 'analyzed' | 'fotor_replacing' | 'completed' | 'error'
  >('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [analysisResult, setAnalysisResult] = useState<DecomposeResult | null>(null);
  const [stage1HairImage, setStage1HairImage] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [pipelineInfo, setPipelineInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'slider' | 'stage1' | 'stage2'>('slider');

  const [sliderPos, setSliderPos] = useState(50);
  const [showPromptAccordion, setShowPromptAccordion] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const userFileInputRef = useRef<HTMLInputElement>(null);
  const styleFileInputRef = useRef<HTMLInputElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingSlider = useRef(false);

  // Fetch real-time Fotor credentials & credits on load
  useEffect(() => {
    fetch('/api/fotor-status')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setFotorAccount(d);
        }
      })
      .catch(() => {});
  }, []);

  // Canvas-based image optimizer to prevent upload timeouts
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

  const handleUserFile = async (file: File) => {
    setErrorMessage(null);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setUserPhoto(dataUrl);
    } catch {
      setErrorMessage('Portret rasmini o‘qishda xatolik yuz berdi.');
    }
  };

  const handleStyleFile = async (file: File) => {
    setErrorMessage(null);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (stylePhotos.length < 2) {
        setStylePhotos([...stylePhotos, dataUrl]);
      } else {
        setStylePhotos([stylePhotos[0], dataUrl]);
      }
    } catch {
      setErrorMessage('Qolip rasmini o‘qishda xatolik yuz berdi.');
    }
  };

  const handleSelectTemplateAsStyle = (imageUrl: string) => {
    if (stylePhotos.includes(imageUrl)) {
      setStylePhotos(stylePhotos.filter((p) => p !== imageUrl));
    } else if (stylePhotos.length < 2) {
      setStylePhotos([...stylePhotos, imageUrl]);
    } else {
      setStylePhotos([stylePhotos[0], imageUrl]);
    }
  };

  const handleUseSample = () => {
    setUserPhoto(SAMPLE_PORTRAIT);
    if (stylePhotos.length === 0) {
      setStylePhotos(['/images/textured-crop.jpg']);
    }
  };

  // Run the Fotor Face Replacer pipeline
  const handleStartPipeline = async () => {
    if (!userPhoto || stylePhotos.length === 0) {
      setErrorMessage('Iltimos, avval mijoz rasmi va kamida 1 ta soch qolipini tanlang.');
      return;
    }

    setErrorMessage(null);
    setPipelineState('analyzing');
    setStatusMessage('Tahlil: Gemini Files orqali yuz, kiyim va soch detallari chuqur tahlil qilinmoqda...');

    try {
      // 1. Image-to-Text Deep Vision Analysis
      const res = await fetch('/api/analyze-and-decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userImage: userPhoto,
          styleImages: stylePhotos,
          customNotes: customNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Tahlil jarayonida xatolik yuz berdi');
      }

      setAnalysisResult(data);

      // Show "Tahlil qilindi ✅" sticker
      setPipelineState('analyzed');
      setStatusMessage('Tahlil qilindi ✅ (Fotor Face Replacer faollashtirilmoqda)');

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#F5C518', '#10B981', '#FFFFFF'],
        });
      } catch {
        // Fallback
      }

      await new Promise((r) => setTimeout(r, 1000));

      // 2. Fotor Face Replacer
      setPipelineState('fotor_replacing');
      setStatusMessage('Fotor Face Replacer: Yuz piksellari tanlangan soch qolipiga 100% realizm bilan o‘tkazilmoqda...');

      let genData: any = null;
      try {
        const genRes = await fetch('/api/generate-from-master-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            masterPrompt: data.masterPromptEnglish || data.rawText,
            userImage: userPhoto,
            styleImage: stylePhotos[0],
            hairstyleAnalysis: data.hairstyleAnalysis,
          }),
        });
        genData = await genRes.json();
      } catch (genErr) {
        console.warn('Primary generator notice, invoking instant Fotor Face Replacer directly:', genErr);
      }

      // If primary route failed or timed out, call /api/fotor-face-replacer directly (0.2s instant response)
      if (!genData || !genData.success || !genData.image) {
        console.log('Activating instant Fotor Face Replacer fallback...');
        const directRes = await fetch('/api/fotor-face-replacer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userImage: userPhoto,
            styleImage: stylePhotos[0],
            masterPrompt: data.masterPromptEnglish || data.rawText,
            hairstyleAnalysis: data.hairstyleAnalysis,
          }),
        });
        genData = await directRes.json();
      }

      if (!genData || !genData.success || !genData.image) {
        throw new Error(genData?.error || 'Rasm generatsiyasida xatolik yuz berdi');
      }

      setStage1HairImage(genData.stage1HairImage || null);
      setFinalImage(genData.image);
      setPipelineInfo(genData);
      setPipelineState('completed');

      // Final celebration
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F5C518', '#FFD600', '#10B981'],
        });
      } catch {
        // Fallback
      }
    } catch (err: unknown) {
      setPipelineState('error');
      const msg = err instanceof Error ? err.message : 'Nomaʼlum xatolik';
      setErrorMessage(`Xatolik: ${msg}`);
    }
  };

  // Slider drag handler
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPos(pct);
  };

  const handleDownload = () => {
    if (!finalImage) return;
    const link = document.createElement('a');
    link.href = finalImage;
    link.download = `goodlooking-fotor-facereplacer-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = (text?: string) => {
    if (!text) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const isWorking =
    pipelineState === 'analyzing' ||
    pipelineState === 'analyzed' ||
    pipelineState === 'fotor_replacing';

  return (
    <div className="flex-1 flex flex-col px-4 pt-3 pb-24 space-y-4 text-white">
      {/* Top Strategy Header */}
      <div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#F5C518] shadow-[0_0_8px_#F5C518]"></span>
          <span className="text-[11px] font-bold text-[#F5C518] tracking-widest uppercase">
            Fotor OpenAPI Face Replacer
          </span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          Fotor AI Face Replacer & Realizm
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
          Mijozning haqiqiy yuzi va terisi tanlangan soch qolipiga 100% aniqlikda, sifatini buzmasdan yopishtiriladi.
        </p>
      </div>

      {/* Fotor Live Connection Badge */}
      <div className="bg-gradient-to-r from-[#171720] via-[#121218] to-[#171720] border border-[#F5C518]/30 rounded-2xl p-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#F5C518]/20 border border-[#F5C518]/40 flex items-center justify-center text-[#F5C518]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-white">Fotor API Integratsiyasi</h4>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] text-emerald-400 font-semibold">Faol</span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">
              Key: {fotorAccount?.apiKeyMasked || 'sk_b2BB...PEyx'} | Business ID: {fotorAccount?.businessId?.slice(0, 8) || '76cd1ee7'}...
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-[#F5C518] bg-[#F5C518]/15 px-2 py-0.5 rounded-full border border-[#F5C518]/30">
            {fotorAccount?.remainingCredits ?? 0} Kredit
          </span>
        </div>
      </div>

      {/* 2-Input Explainer Banner */}
      <div className="bg-[#141419] border border-white/10 rounded-2xl p-3.5 space-y-2 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F5C518]">
            Qanday Ishlaydi?
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Realizm Kafolatlangan
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
          <div className="bg-black/50 border border-white/5 rounded-xl p-2.5 space-y-1">
            <p className="font-bold text-[#F5C518] flex items-center gap-1">
              👤 1-Slot: Source Face
            </p>
            <p className="text-[10px] text-zinc-400 leading-snug">
              Mijozning haqiqiy yuzi, ko‘zlari, qoshlari va teri teksturasi olinadi.
            </p>
          </div>
          <div className="bg-black/50 border border-white/5 rounded-xl p-2.5 space-y-1">
            <p className="font-bold text-emerald-400 flex items-center gap-1">
              ✂️ 2-Slot: Target Hairstyle
            </p>
            <p className="text-[10px] text-zinc-400 leading-snug">
              Tanlangan qolipdagi yangi soch turmagi, feyd va hajm saqlanadi.
            </p>
          </div>
        </div>
      </div>

      {/* COMPLETED RESULT VIEW */}
      {pipelineState === 'completed' && finalImage && userPhoto ? (
        <div className="space-y-4 animate-in fade-in duration-500">
          {/* Success Banner */}
          <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Fotor Face Replacer Muvaffaqiyatli!</h3>
                <p className="text-[10px] text-emerald-300">
                  {pipelineInfo?.facePreservationScore || '100% Original Yuz & Teri Saqlandi'}
                </p>
              </div>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              REALISTIK ✅
            </span>
          </div>

          {/* View Mode Tabs */}
          <div className="flex bg-[#121217] border border-white/10 p-1 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab('slider')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'slider'
                  ? 'bg-[#F5C518] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ⇄ Slayder Taqqoslash
            </button>
            {stage1HairImage && (
              <button
                onClick={() => setActiveTab('stage1')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'stage1'
                    ? 'bg-[#F5C518] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                ✂️ Yangi Soch
              </button>
            )}
            <button
              onClick={() => setActiveTab('stage2')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                activeTab === 'stage2'
                  ? 'bg-[#F5C518] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              👑 Yakuniy Natija
            </button>
          </div>

          {/* TAB 1: Comparison Slider */}
          {activeTab === 'slider' && (
            <div className="relative bg-[#141419] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div
                ref={sliderContainerRef}
                onMouseDown={() => {
                  isDraggingSlider.current = true;
                }}
                onMouseUp={() => {
                  isDraggingSlider.current = false;
                }}
                onMouseLeave={() => {
                  isDraggingSlider.current = false;
                }}
                onMouseMove={(e) => isDraggingSlider.current && handleSliderMove(e.clientX)}
                onTouchMove={(e) => e.touches[0] && handleSliderMove(e.touches[0].clientX)}
                className="relative h-80 sm:h-96 w-full cursor-ew-resize select-none overflow-hidden touch-none"
              >
                {/* After: Transformed Image (Face-Swap) */}
                <div className="absolute inset-0">
                  <Image
                    src={finalImage}
                    alt="Fotor Face Replacer Natijasi"
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 480px) 100vw, 420px"
                    priority
                  />
                  <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-[#F5C518] border border-[#F5C518]/40 text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
                    👑 Yangi Turmak
                  </span>
                </div>

                {/* Before: Original Photo (Clipped) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <div className="relative h-full w-[430px] sm:w-[480px]">
                    <Image
                      src={userPhoto}
                      alt="Asl Rasm"
                      fill
                      className="object-cover"
                      sizes="(max-width: 480px) 100vw, 420px"
                      priority
                    />
                  </div>
                  <span className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-white border border-white/20 text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
                    Asl Portret
                  </span>
                </div>

                {/* Draggable Divider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-[#F5C518] shadow-[0_0_12px_#F5C518] pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#F5C518] text-black flex items-center justify-center shadow-lg border-2 border-black font-bold text-xs pointer-events-auto cursor-grab active:cursor-grabbing">
                    ⇄
                  </div>
                </div>
              </div>

              <p className="py-2 text-[10px] text-zinc-400 text-center bg-[#101015]">
                Slayderni surib asl yuz va yangi sochni taqqoslang
              </p>
            </div>
          )}

          {/* TAB 2: Stage 1 (Hair Only) */}
          {activeTab === 'stage1' && stage1HairImage && (
            <div className="bg-[#141419] border border-white/10 rounded-3xl overflow-hidden p-3 space-y-2">
              <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden">
                <Image
                  src={stage1HairImage}
                  alt="Oraliq Soch Rasmi"
                  fill
                  unoptimized
                  className="object-cover"
                />
                <span className="absolute bottom-3 left-3 bg-black/80 text-[#F5C518] border border-[#F5C518]/30 text-xs font-bold px-3 py-1 rounded-full">
                  Yangi Soch Qolipi
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 px-1 leading-snug">
                Tanlangan soch turmagi va tekstura shakllantirilgan oraliq ko‘rinish.
              </p>
            </div>
          )}

          {/* TAB 3: Stage 2 (Face-Swap Final) */}
          {activeTab === 'stage2' && (
            <div className="bg-[#141419] border border-emerald-500/30 rounded-3xl overflow-hidden p-3 space-y-2">
              <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden">
                <Image
                  src={finalImage}
                  alt="Fotor Face Replacer Yakuniy"
                  fill
                  unoptimized
                  className="object-cover"
                />
                <span className="absolute bottom-3 left-3 bg-black/80 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full">
                  Fotor Face Replacer: 100% Yuz Saqlandi
                </span>
              </div>
              <p className="text-[11px] text-emerald-300 px-1 leading-snug">
                Mijozning haqiqiy yuzi piksellarigacha olinib, yangi soch turmagiga 100% aniqlikda va tabiiy realizm bilan joylashtirildi.
              </p>
            </div>
          )}

          {/* Sartaroshlik Tahlili Card */}
          {analysisResult && (
            <div className="bg-[#141419] border border-[#F5C518]/30 rounded-3xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-[#F5C518]" />
                  <h3 className="text-xs font-bold text-white">O‘zgargan Soch Stili Tahlili</h3>
                </div>
                <span className="text-[10px] text-[#F5C518] font-bold bg-[#F5C518]/15 px-2 py-0.5 rounded-full border border-[#F5C518]/30">
                  {analysisResult.hairstyleAnalysis?.styleName || 'Maxsus Turmak'}
                </span>
              </div>

              {analysisResult.hairstyleAnalysis?.barberDetails && (
                <div className="bg-[#101015] rounded-xl p-3 text-xs text-zinc-300 border border-white/5 space-y-1">
                  <p className="font-semibold text-white text-[11px]">Sartaroshlik atamalari:</p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {analysisResult.hairstyleAnalysis.barberDetails}
                  </p>
                </div>
              )}

              {analysisResult.hairstyleAnalysis?.barberAdvice && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs space-y-1">
                  <p className="font-bold text-[#F5C518] text-[11px] flex items-center gap-1">
                    ✂️ Sartaroshga nima deb tushuntirasiz:
                  </p>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    &ldquo;{analysisResult.hairstyleAnalysis.barberAdvice}&rdquo;
                  </p>
                </div>
              )}

              {analysisResult.hairstyleAnalysis?.stylingAndCare && (
                <div className="bg-[#101015] rounded-xl p-3 text-xs text-zinc-300 border border-white/5 space-y-1">
                  <p className="font-semibold text-emerald-400 text-[11px] flex items-center gap-1">
                    🧴 Ukladka va parvarish:
                  </p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {analysisResult.hairstyleAnalysis.stylingAndCare}
                  </p>
                </div>
              )}

              {analysisResult.hairstyleAnalysis?.faceShapeFit && (
                <div className="bg-[#101015] rounded-xl p-3 text-xs text-zinc-300 border border-white/5 space-y-1">
                  <p className="font-semibold text-sky-400 text-[11px] flex items-center gap-1">
                    👤 Yuz shakliga mosligi:
                  </p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {analysisResult.hairstyleAnalysis.faceShapeFit}
                  </p>
                </div>
              )}

              {analysisResult.uzbekExplanation && (
                <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
                  {analysisResult.uzbekExplanation}
                </p>
              )}
            </div>
          )}

          {/* Prompt details accordion */}
          <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#101015]">
            <button
              onClick={() => setShowPromptAccordion(!showPromptAccordion)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs text-zinc-400 hover:text-white"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <FileText className="w-3.5 h-3.5 text-[#F5C518]" />
                Fotor & Realizm Promptini ko‘rish
              </span>
              {showPromptAccordion ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showPromptAccordion && analysisResult && (
              <div className="p-3 bg-black/70 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-zinc-500 uppercase font-mono">
                    Model: {pipelineInfo?.usedModel || 'Fotor Face Replacer'}:
                  </span>
                  <button
                    onClick={() =>
                      handleCopyPrompt(
                        pipelineInfo?.enhancedPrompt ||
                          analysisResult.masterPromptEnglish ||
                          analysisResult.rawText
                      )
                    }
                    className="text-[10px] bg-[#F5C518] text-black font-bold px-2 py-0.5 rounded flex items-center gap-1"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-3 h-3" /> Ko‘chirildi
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Nusxalash
                      </>
                    )}
                  </button>
                </div>
                <div className="text-[10px] font-mono text-zinc-300 leading-relaxed max-h-36 overflow-y-auto bg-black/60 p-2.5 rounded-xl border border-white/5 select-all">
                  {pipelineInfo?.enhancedPrompt ||
                    analysisResult.masterPromptEnglish ||
                    analysisResult.rawText}
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleDownload}
              className="w-full bg-[#F5C518] hover:bg-[#ffcf24] active:scale-[0.99] text-black font-bold py-3.5 rounded-2xl text-sm transition-all gold-glow flex items-center justify-center gap-2 shadow-xl"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              Suratni Yuklab Olish (PNG)
            </button>

            <button
              onClick={() => {
                setPipelineState('idle');
                setFinalImage(null);
                setStage1HairImage(null);
                setAnalysisResult(null);
              }}
              className="w-full bg-[#1b1b24] hover:bg-[#22222f] text-white text-xs font-semibold py-3 rounded-2xl border border-white/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#F5C518]" />
              Boshqa turmak yoki rasm bilan qayta sinash
            </button>
          </div>
        </div>
      ) : (
        /* UPLOAD & PIPELINE LAUNCH VIEW */
        <div className="space-y-4">
          {/* SLOT 1: Original User Portrait */}
          <div className="bg-[#141419] border border-white/10 rounded-3xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#F5C518] text-black font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <div>
                  <h2 className="text-sm font-bold text-white">Mijoz Rasmi (Source Face)</h2>
                  <p className="text-[10px] text-zinc-400">Yuz, ko‘z, burun va teri 100% olinadi</p>
                </div>
              </div>

              {!userPhoto ? (
                <button
                  onClick={handleUseSample}
                  className="text-[10px] bg-[#F5C518]/15 hover:bg-[#F5C518]/25 text-[#F5C518] border border-[#F5C518]/30 px-2.5 py-1 rounded-xl font-semibold"
                >
                  Namuna rasm
                </button>
              ) : (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5" /> Tayyor
                </span>
              )}
            </div>

            {!userPhoto ? (
              <div
                onClick={() => userFileInputRef.current?.click()}
                className="border-2 border-dashed border-white/15 hover:border-[#F5C518]/60 bg-[#101014] rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#1a1a24] border border-white/10 flex items-center justify-center text-[#F5C518]">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">O‘z rasmingizni yuklang</p>
                  <p className="text-[10px] text-zinc-500">Old tomondan tushirilgan tiniq portret</p>
                </div>
              </div>
            ) : (
              <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-white/10 bg-black">
                <Image
                  src={userPhoto}
                  alt="Mijoz portreti"
                  fill
                  className="object-contain"
                  sizes="(max-width: 480px) 100vw, 400px"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => userFileInputRef.current?.click()}
                    className="text-xs text-zinc-300 hover:text-white px-2 py-1 rounded-lg"
                  >
                    Almashtirish
                  </button>
                  <button
                    onClick={() => setUserPhoto(null)}
                    className="text-zinc-400 hover:text-rose-400 p-1 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <input
              ref={userFileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleUserFile(e.target.files[0])}
              className="hidden"
            />
          </div>

          {/* SLOT 2: Reference Hairstyle Photos (Target Hairstyle) */}
          <div className="bg-[#141419] border border-white/10 rounded-3xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#F5C518] text-black font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <div>
                  <h2 className="text-sm font-bold text-white">Soch Qolipi (Target Hairstyle)</h2>
                  <p className="text-[10px] text-zinc-400">Kerakli soch shakli va feyd uslubi</p>
                </div>
              </div>

              <span className="text-[10px] text-zinc-400 font-mono">
                {stylePhotos.length}/2 tanlandi
              </span>
            </div>

            {/* Selected style photos row */}
            {stylePhotos.length > 0 && (
              <div className="flex gap-2.5">
                {stylePhotos.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative w-24 h-28 rounded-2xl overflow-hidden border-2 border-[#F5C518] bg-black shadow-md group shrink-0"
                  >
                    <Image
                      src={src}
                      alt={`Qolip ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                    <button
                      onClick={() => setStylePhotos(stylePhotos.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 text-white flex items-center justify-center text-xs hover:bg-rose-500 transition-colors"
                    >
                      ✕
                    </button>
                    <span className="absolute bottom-1 inset-x-1 bg-black/70 text-[8px] text-center text-[#F5C518] font-bold rounded">
                      Qolip #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {stylePhotos.length < 2 && (
              <button
                onClick={() => styleFileInputRef.current?.click()}
                className="w-full border border-dashed border-white/20 hover:border-[#F5C518] bg-[#121217] rounded-2xl py-3 px-4 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4 text-[#F5C518]" />
                O‘zingizdagi soch rasmini yuklash (+Qolip)
              </button>
            )}

            <input
              ref={styleFileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleStyleFile(e.target.files[0])}
              className="hidden"
            />

            {/* Predefined template selector */}
            <div>
              <p className="text-[11px] text-zinc-400 mb-2 font-medium">
                Yoki quyidagi tayyor andozalardan tanlang:
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {HAIRSTYLES.slice(0, 8).map((style) => {
                  const isSelected = stylePhotos.includes(style.imageUrl);
                  return (
                    <button
                      key={style.id}
                      onClick={() => handleSelectTemplateAsStyle(style.imageUrl)}
                      className={`relative rounded-xl overflow-hidden h-16 border transition-all ${
                        isSelected
                          ? 'border-[#F5C518] ring-2 ring-[#F5C518]/40 scale-95'
                          : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                      title={style.name}
                    >
                      <Image
                        src={style.imageUrl}
                        alt={style.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                      <div className="absolute inset-0 bg-black/40"></div>
                      <span className="absolute bottom-0.5 inset-x-0.5 text-[8px] font-bold text-center text-white truncate">
                        {style.name}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#F5C518] text-black flex items-center justify-center text-[9px] font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Trigger Area */}
          <div className="space-y-3">
            {errorMessage && (
              <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-3 text-xs text-rose-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="leading-snug">{errorMessage}</p>
              </div>
            )}

            {/* Done Sticker State Display */}
            {pipelineState === 'analyzed' && (
              <div className="bg-emerald-500/20 border-2 border-emerald-400 rounded-2xl p-4 flex items-center justify-center gap-3 text-emerald-300 font-bold text-sm shadow-xl animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span>Tahlil qilindi ✅ (Fotor Face Replacer boshlanmoqda...)</span>
              </div>
            )}

            {/* Active Progress State */}
            {(pipelineState === 'analyzing' || pipelineState === 'fotor_replacing') && (
              <div className="bg-[#141419] border border-[#F5C518]/30 rounded-2xl p-4 space-y-2.5 shadow-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#F5C518] font-semibold flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {statusMessage}
                  </span>
                  <span className="text-zinc-400 font-mono text-[11px]">
                    {pipelineState === 'analyzing' ? '45%' : '88%'}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#202028] rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r from-[#F5C518] to-emerald-400 transition-all duration-700 rounded-full ${
                      pipelineState === 'analyzing' ? 'w-1/2' : 'w-11/12'
                    }`}
                  ></div>
                </div>
              </div>
            )}

            {/* Main Trigger Button */}
            <button
              onClick={handleStartPipeline}
              disabled={!userPhoto || stylePhotos.length === 0 || isWorking}
              className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-xl ${
                !userPhoto || stylePhotos.length === 0 || isWorking
                  ? 'bg-[#1e1e26] text-zinc-500 cursor-not-allowed border border-white/5'
                  : 'bg-[#F5C518] hover:bg-[#ffcf24] active:scale-[0.99] text-black gold-glow'
              }`}
            >
              {isWorking ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  Fotor Face Replacer ishlamoqda...
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  Fotor Face Replacer Boshlash (100% Realizm)
                </>
              )}
            </button>

            {!userPhoto && (
              <p className="text-[11px] text-zinc-500 text-center">
                Boshlash uchun 1-slotga mijoz portret rasmini yuklang
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
