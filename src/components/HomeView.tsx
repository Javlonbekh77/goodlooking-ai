'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Search,
  Bell,
  ArrowRight,
  Star,
  MapPin,
  Scissors,
  Sparkles,
  Zap,
  Crown,
  Flame,
  Layers,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import { HAIRSTYLES } from '@/data/hairstyles';
import { Hairstyle, TabType } from '@/types';

interface HomeViewProps {
  onNavigateToStudio: (preselectedStyle?: Hairstyle) => void;
  onNavigateTab: (tab: TabType) => void;
  isAiConfigured: boolean;
}

export function HomeView({
  onNavigateToStudio,
  onNavigateTab,
  isAiConfigured,
}: HomeViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Cuts', icon: Scissors },
    { id: 'fades', label: 'Fades', icon: Sparkles },
    { id: 'crops', label: 'Crops', icon: Layers },
    { id: 'classic', label: 'Classic', icon: Crown },
    { id: 'buzz', label: 'Buzz Cut', icon: Zap },
    { id: 'modern', label: 'Modern', icon: Flame },
  ];

  const filteredStyles = HAIRSTYLES.filter((style) => {
    const matchesSearch =
      style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      activeCategory === 'all' || style.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col px-4 pt-3 pb-24 space-y-5 text-white">
      {/* Top Header: Avatar + Welcome + Notification Bell */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#F5C518]/60 shadow-md">
            <Image
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
              alt="User Avatar"
              fill
              className="object-cover"
              sizes="44px"
              priority
            />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium tracking-wide">Welcome</p>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              Hay, Kelly <span className="animate-pulse">👋</span>
            </h1>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('profile')}
          className="relative w-10 h-10 rounded-full bg-[#16161c] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 stroke-[1.75]" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#F5C518] ring-2 ring-[#0a0a0d]"></span>
        </button>
      </div>

      {/* AI Status pill indicator */}
      <div className="flex items-center justify-between bg-[#131318] border border-white/8 px-3.5 py-1.5 rounded-full text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isAiConfigured
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
            }`}
          ></span>
          <span className="text-zinc-300 font-medium">
            {isAiConfigured ? 'OpenAI GPT Image 2.5 Sunburst Ready' : 'OpenAI Key Sozlanmagan'}
          </span>
        </div>
        <button
          onClick={() => onNavigateTab('profile')}
          className="text-[#F5C518] hover:underline text-[11px] font-semibold"
        >
          {isAiConfigured ? 'Model Info' : 'Setup Key →'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search haircut styles, fades, cuts..."
          className="w-full bg-[#15151b] border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5C518] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white bg-zinc-800 rounded-full w-5 h-5 flex items-center justify-center"
          >
            ✕
          </button>
        )}
      </div>

      {/* AI Chat Shortcut Card */}
      <div
        onClick={() => onNavigateTab('chat')}
        className="bg-gradient-to-r from-[#171722] via-[#1c1c28] to-[#171722] border border-[#F5C518]/30 hover:border-[#F5C518] rounded-3xl p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-lg group active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F5C518] text-black font-bold flex items-center justify-center shrink-0 shadow-md">
            <MessageSquare className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-white group-hover:text-[#F5C518] transition-colors">
                AI Stilist bilan gaplashish
              </h3>
              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                O‘zbekcha
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
              Yuzingizga mos turmak, fade va soqol bo‘yicha jonli maslahat oling.
            </p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-[#F5C518] group-hover:bg-[#F5C518]/10 transition-colors shrink-0">
          <ArrowRight className="w-4 h-4 stroke-[2]" />
        </div>
      </div>

      {/* Best Category Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white tracking-wide">Best Category</h2>
          <button
            onClick={() => onNavigateTab('explore')}
            className="text-xs text-zinc-400 hover:text-[#F5C518] transition-colors"
          >
            See All
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-center gap-2 min-w-[70px] p-2.5 rounded-2xl transition-all ${
                  isSelected
                    ? 'bg-[#F5C518] text-black font-semibold shadow-md'
                    : 'bg-[#15151b] border border-white/8 text-zinc-300 hover:bg-[#1d1d24]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-black/10' : 'bg-black/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] whitespace-nowrap">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Featured Card: Matches Reference Image Phone 1 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-wide">Special Offers</h2>
            <span className="bg-[#F5C518]/20 text-[#F5C518] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#F5C518]/30">
              AI TRY-ON
            </span>
          </div>
          <button
            onClick={() => onNavigateToStudio()}
            className="text-xs text-zinc-400 hover:text-[#F5C518] transition-colors"
          >
            See All
          </button>
        </div>

        <div className="relative bg-[#141419] border border-white/10 rounded-3xl overflow-hidden shadow-2xl group">
          {/* Card Image Banner */}
          <div className="relative h-48 w-full bg-zinc-900">
            <Image
              src="/images/hero-barber.jpg"
              alt="Star Quality Cutz Barbershop"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 480px) 100vw, 440px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141419] via-transparent to-black/40"></div>

            {/* Rating badge top-left */}
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              <Star className="w-3.5 h-3.5 text-[#F5C518] fill-[#F5C518]" />
              <span className="text-xs font-bold text-white">5.0</span>
            </div>

            {/* Carousel dots indicator */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#F5C518]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
            </div>

            {/* Location pin tag bottom-left */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-xs text-zinc-200">
              <MapPin className="w-3.5 h-3.5 text-[#F5C518]" />
              <span className="font-medium text-[11px]">Star Quality Cutz</span>
            </div>
          </div>

          {/* Card Info & Action Button */}
          <div className="p-4 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Razor Work Fred
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                Quality, Trusted Services & AI Hairstyle Preview.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-bold text-white">$0.00</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  FREE AI PREVIEW
                </span>
              </div>
            </div>

            {/* Yellow Action Button with Arrow (Exact match to reference image!) */}
            <button
              onClick={() => onNavigateToStudio()}
              className="w-12 h-12 shrink-0 bg-[#F5C518] hover:bg-[#ffcf24] active:scale-95 text-black rounded-2xl flex items-center justify-center transition-all gold-glow-sm shadow-lg"
              title="Try AI Hairstyle"
              aria-label="Try AI Hairstyle"
            >
              <ArrowRight className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Popular Hairstyle Templates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white tracking-wide">
            {searchQuery ? `Search Results (${filteredStyles.length})` : 'Popular Cuts'}
          </h2>
          <button
            onClick={() => onNavigateTab('explore')}
            className="text-xs text-zinc-400 hover:text-[#F5C518] transition-colors flex items-center gap-0.5"
          >
            Explore <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredStyles.slice(0, 4).map((style) => (
            <div
              key={style.id}
              className="bg-[#141419] border border-white/10 rounded-2xl p-2.5 flex flex-col justify-between hover:border-white/20 transition-all group"
            >
              <div className="relative h-28 w-full rounded-xl overflow-hidden bg-zinc-900 mb-2">
                <Image
                  src={style.imageUrl}
                  alt={style.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="180px"
                />
                <span className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white px-2 py-0.5 rounded-md border border-white/10">
                  {style.categoryLabel}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{style.name}</h4>
                <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                  {style.description}
                </p>
              </div>

              <button
                onClick={() => onNavigateToStudio(style)}
                className="mt-2.5 w-full bg-[#1c1c24] hover:bg-[#F5C518] hover:text-black text-white text-[11px] font-semibold py-1.5 rounded-xl border border-white/10 hover:border-transparent transition-all flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-[#F5C518] group-hover:text-black" />
                Try on me
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="bg-[#111116] border border-white/8 rounded-2xl p-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#F5C518]/10 border border-[#F5C518]/20 flex items-center justify-center text-[#F5C518] shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">Realistic Barber Previews</p>
          <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
            Preserves facial features, expression, and skin tone for believable styling.
          </p>
        </div>
      </div>
    </div>
  );
}
