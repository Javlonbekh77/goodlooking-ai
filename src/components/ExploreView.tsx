'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Sparkles, Scissors, Filter, ArrowRight } from 'lucide-react';
import { HAIRSTYLES, CATEGORIES } from '@/data/hairstyles';
import { Hairstyle } from '@/types';

interface ExploreViewProps {
  onSelectStyle: (style: Hairstyle) => void;
}

export function ExploreView({ onSelectStyle }: ExploreViewProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFaceShape, setSelectedFaceShape] = useState<string>('all');

  const faceShapes = ['all', 'Oval', 'Square', 'Round', 'Oblong', 'Heart'];

  const filtered = HAIRSTYLES.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    const matchFace =
      selectedFaceShape === 'all' ||
      item.faceShape.some((f) => f.toLowerCase() === selectedFaceShape.toLowerCase());

    return matchSearch && matchCategory && matchFace;
  });

  return (
    <div className="flex-1 flex flex-col px-4 pt-3 pb-24 space-y-4 text-white">
      {/* Explore Header */}
      <div>
        <span className="text-[11px] font-bold text-[#F5C518] tracking-widest uppercase">
          Style Lookbook
        </span>
        <h1 className="text-xl font-bold text-white tracking-tight">Explore Cuts</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Find your next signature style and test it instantly on your face.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cuts, hair texture, tags..."
          className="w-full bg-[#15151b] border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5C518] transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white bg-zinc-800 rounded-full w-5 h-5 flex items-center justify-center"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-[#F5C518] text-black font-semibold shadow-sm'
                : 'bg-[#15151b] border border-white/8 text-zinc-300 hover:bg-[#1d1d24]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Face Shape Filter Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
        <span className="text-zinc-500 flex items-center gap-1 shrink-0">
          <Filter className="w-3 h-3 text-[#F5C518]" /> Face:
        </span>
        {faceShapes.map((shape) => (
          <button
            key={shape}
            onClick={() => setSelectedFaceShape(shape)}
            className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition-colors ${
              selectedFaceShape === shape
                ? 'bg-white/20 text-white font-bold'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            {shape}
          </button>
        ))}
      </div>

      {/* Hairstyles List */}
      <div className="space-y-3">
        {filtered.map((style) => (
          <div
            key={style.id}
            className="bg-[#141419] border border-white/10 rounded-3xl p-3.5 flex gap-3 hover:border-white/20 transition-all shadow-md group"
          >
            <div className="relative w-24 h-28 rounded-2xl overflow-hidden bg-zinc-900 shrink-0">
              <Image
                src={style.imageUrl}
                alt={style.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="120px"
              />
              <span className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-md text-[9px] font-bold text-white px-1.5 py-0.5 rounded">
                {style.categoryLabel}
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-between py-0.5">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{style.name}</h3>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {style.maintenance} Maint.
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {style.description}
                </p>

                <div className="flex flex-wrap gap-1 mt-1.5">
                  {style.faceShape.map((shape) => (
                    <span
                      key={shape}
                      className="bg-white/5 text-zinc-300 text-[9px] px-1.5 py-0.5 rounded"
                    >
                      {shape}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSelectStyle(style)}
                className="mt-2 w-full bg-[#F5C518] hover:bg-[#ffcf24] text-black font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Try on my photo
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-zinc-500 text-xs">
            No haircuts matched your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}
