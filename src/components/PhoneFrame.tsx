'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone, Monitor } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  const [currentTime, setCurrentTime] = useState('9:30');
  const [isFullWindow, setIsFullWindow] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 text-white selection:bg-[#F5C518] selection:text-black">
      {/* Desktop view switcher toggle */}
      <div className="hidden sm:flex items-center gap-2 mb-3 bg-[#131318] border border-white/10 rounded-full px-3 py-1 text-xs text-zinc-400">
        <span className="text-zinc-500 font-medium">GoodLooking AI View:</span>
        <button
          onClick={() => setIsFullWindow(false)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all ${
            !isFullWindow
              ? 'bg-[#F5C518] text-black font-semibold shadow-sm'
              : 'hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          Mobile Frame
        </button>
        <button
          onClick={() => setIsFullWindow(true)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all ${
            isFullWindow
              ? 'bg-[#F5C518] text-black font-semibold shadow-sm'
              : 'hover:text-white'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          Full Window
        </button>
      </div>

      {/* Main phone container */}
      <div
        className={`relative w-full bg-[#0a0a0d] overflow-hidden transition-all duration-300 flex flex-col ${
          isFullWindow
            ? 'max-w-2xl h-[95vh] rounded-3xl border border-white/10 shadow-2xl'
            : 'w-full min-h-[100dvh] h-[100dvh] sm:h-[890px] sm:max-w-[430px] sm:rounded-[48px] sm:border-[8px] sm:border-[#1c1c22] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(245,197,24,0.1)]'
        }`}
      >
        {/* Phone Speaker & Dynamic Island (ONLY visible on desktop framed view) */}
        {!isFullWindow && (
          <div className="hidden sm:block absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#000000] rounded-full z-50 pointer-events-none">
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#0d0d12] border border-white/10"></div>
          </div>
        )}

        {/* Mobile Status Bar (ONLY visible on desktop frame, completely hidden on real phones) */}
        <header className="hidden sm:flex shrink-0 h-11 px-6 items-center justify-between text-xs font-semibold text-zinc-200 select-none z-40 bg-[#0a0a0d]/90 backdrop-blur-md">
          <span className="tracking-tight">{currentTime}</span>
          <div className="flex items-center gap-2">
            <Signal className="w-3.5 h-3.5 text-zinc-300" />
            <Wifi className="w-3.5 h-3.5 text-zinc-300" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-zinc-400">100%</span>
              <BatteryMedium className="w-4 h-4 text-[#F5C518]" />
            </div>
          </div>
        </header>

        {/* Scrollable Screen Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col no-scrollbar">
          {children}
        </main>

        {/* iOS Home Indicator Bar (ONLY visible on desktop frame) */}
        <footer className="hidden sm:flex shrink-0 h-5 w-full items-center justify-center bg-[#0a0a0d] z-30 pointer-events-none">
          <div className="w-32 h-1 bg-white/20 rounded-full"></div>
        </footer>
      </div>
    </div>
  );
}
