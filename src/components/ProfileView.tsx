'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  User,
  Shield,
  Key,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sliders,
  ExternalLink,
  ChevronRight,
  Info,
  Sparkles,
} from 'lucide-react';

interface ProfileViewProps {
  onNavigateHome: () => void;
  isAiConfigured: boolean;
  aiModel: string;
}

export function ProfileView({
  onNavigateHome,
  isAiConfigured,
  aiModel,
}: ProfileViewProps) {
  const [hairType, setHairType] = useState('Wavy');
  const [faceShape, setFaceShape] = useState('Oval');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <div className="flex-1 flex flex-col px-4 pt-3 pb-24 space-y-4 text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="w-9 h-9 rounded-full bg-[#16161c] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
          title="Back to Home"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          Profile & Settings
        </span>
        <div className="w-9"></div>
      </div>

      {/* User Card */}
      <div className="bg-[#141419] border border-white/10 rounded-3xl p-4 flex items-center gap-4 shadow-lg">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#F5C518] shadow-md">
          <Image
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
            alt="Kelly Profile"
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Kelly Anderson</h2>
            <span className="bg-[#F5C518]/20 text-[#F5C518] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#F5C518]/30">
              VIP
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">kelly.barbershop@demo.com</p>
          <p className="text-[10px] text-zinc-500 mt-1">Client at Star Quality Cutz</p>
        </div>
      </div>

      {/* OpenAI Backend Configuration Card */}
      <div className="bg-[#141419] border border-white/10 rounded-3xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F5C518]/10 border border-[#F5C518]/20 flex items-center justify-center text-[#F5C518]">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">OpenAI Sunburst Integration</h3>
              <p className="text-[10px] text-zinc-400">Asosiy Model Holati</p>
            </div>
          </div>

          {isAiConfigured ? (
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Faol
            </span>
          ) : (
            <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Kalit kiritilmagan
            </span>
          )}
        </div>

        <div className="bg-[#0e0e13] border border-white/5 rounded-2xl p-3 text-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-300">
            <span>Model:</span>
            <code className="text-[11px] text-[#F5C518] bg-black/40 px-2 py-0.5 rounded border border-white/5">
              gpt-image-2.5-sunburst
            </code>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Mijoz portreti (Image 1) va tanlangan yoki yuklangan soch qolipi (Image 2) OpenAI Images Edit API orqali yuboriladi. Mijoz yuzi va shaxsi 100% saqlanib, faqatgina soch turmagi fotorealistik tarzda almashtiriladi.
          </p>

          <div className="bg-black/60 p-2.5 rounded-xl border border-white/10 font-mono text-[11px] text-zinc-300 overflow-x-auto">
            OPENAI_API_KEY=sk-proj-C2cQ...OKAA (Xavfsiz serverda)
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <a
            href="https://platform.openai.com/billing"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#F5C518] hover:underline flex items-center gap-1 font-medium"
          >
            OpenAI Balansini tekshirish <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
          >
            API Kalitlar <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Hair & Style Preferences */}
      <div className="bg-[#141419] border border-white/10 rounded-3xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Style Preferences</h3>
            <p className="text-[10px] text-zinc-400">Tailors haircut recommendations</p>
          </div>
        </div>

        {/* Hair Texture */}
        <div>
          <label className="text-[11px] text-zinc-400 font-medium block mb-1.5">
            Natural Hair Texture
          </label>
          <div className="grid grid-cols-4 gap-1.5 text-xs">
            {['Straight', 'Wavy', 'Curly', 'Coily'].map((type) => (
              <button
                key={type}
                onClick={() => setHairType(type)}
                className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                  hairType === type
                    ? 'bg-[#F5C518] text-black shadow-sm'
                    : 'bg-[#1a1a22] text-zinc-300 border border-white/5 hover:bg-[#22222d]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Face Shape */}
        <div>
          <label className="text-[11px] text-zinc-400 font-medium block mb-1.5">
            Face Shape
          </label>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {['Oval', 'Square', 'Round', 'Oblong', 'Diamond', 'Heart'].map((shape) => (
              <button
                key={shape}
                onClick={() => setFaceShape(shape)}
                className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                  faceShape === shape
                    ? 'bg-[#F5C518] text-black shadow-sm'
                    : 'bg-[#1a1a22] text-zinc-300 border border-white/5 hover:bg-[#22222d]'
                }`}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Privacy & Legal Notice Button */}
      <button
        onClick={() => setShowPrivacyModal(true)}
        className="w-full bg-[#141419] hover:bg-[#1a1a22] border border-white/10 rounded-2xl p-3.5 flex items-center justify-between text-left text-xs transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-zinc-400" />
          <div>
            <p className="font-semibold text-white">Privacy & Photo Policy</p>
            <p className="text-[10px] text-zinc-400">How your uploaded portrait is handled</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-500" />
      </button>

      {/* Return Home Button */}
      <button
        onClick={onNavigateHome}
        className="w-full bg-[#1b1b24] hover:bg-[#242432] text-white text-xs font-bold py-3.5 rounded-2xl border border-white/10 transition-colors"
      >
        Return to Home Screen
      </button>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141419] border border-white/15 rounded-3xl max-w-sm w-full p-5 space-y-4 text-white shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#F5C518]" /> Privacy & File Handling
              </h3>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-zinc-300 space-y-3 leading-relaxed">
              <p>
                <strong>Customer Privacy Notice:</strong> GoodLooking is an AI haircut preview demonstration.
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-zinc-400 text-[11px]">
                <li>
                  Uploaded customer photos are processed strictly in-memory by our backend API and sent directly to Google Gemini API for image-to-image synthesis.
                </li>
                <li>
                  We do not permanently store uploaded face portraits in public server directories or databases.
                </li>
                <li>
                  Images stay inside your browser session unless you explicitly choose to save or download them.
                </li>
                <li>
                  Google Gemini processes requests according to Google Cloud data policies.
                </li>
              </ul>
            </div>

            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full bg-[#F5C518] text-black font-bold text-xs py-2.5 rounded-xl hover:bg-[#ffcf24] transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
