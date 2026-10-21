'use client';

import React from 'react';
import Image from 'next/image';
import { Clock, Trash2, Sparkles, Download, ArrowRight, Eye } from 'lucide-react';
import { GenerationHistoryItem, Hairstyle } from '@/types';

interface HistoryViewProps {
  history: GenerationHistoryItem[];
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
  onViewItem: (item: GenerationHistoryItem) => void;
  onNavigateToStudio: () => void;
}

export function HistoryView({
  history,
  onClearHistory,
  onDeleteItem,
  onViewItem,
  onNavigateToStudio,
}: HistoryViewProps) {
  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = (e: React.MouseEvent, item: GenerationHistoryItem) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = item.generatedImage;
    link.download = `goodlooking-${item.hairstyle.id}-${item.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col px-4 pt-3 pb-24 space-y-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-[#F5C518] tracking-widest uppercase">
            Saved Previews
          </span>
          <h1 className="text-xl font-bold text-white tracking-tight">Try-On History</h1>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-4 space-y-4 bg-[#141419] border border-white/8 rounded-3xl mt-4">
          <div className="w-16 h-16 rounded-3xl bg-[#1b1b22] border border-white/10 flex items-center justify-center text-[#F5C518] shadow-inner">
            <Clock className="w-8 h-8 stroke-[1.75]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Hairstyle Previews Yet</h3>
            <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
              Upload your photo in the AI Studio to preview haircuts and save your favorite looks here.
            </p>
          </div>

          <button
            onClick={onNavigateToStudio}
            className="bg-[#F5C518] hover:bg-[#ffcf24] text-black font-bold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 gold-glow transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Try Your First Hairstyle
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* History Items List */
        <div className="space-y-3">
          <p className="text-[11px] text-zinc-400">
            Stored locally on this device • {history.length} saved {history.length === 1 ? 'look' : 'looks'}
          </p>

          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onViewItem(item)}
              className="bg-[#141419] border border-white/10 rounded-3xl p-3.5 flex gap-3 hover:border-[#F5C518]/50 transition-all cursor-pointer group shadow-md"
            >
              {/* Dual Before / After mini preview */}
              <div className="flex gap-1 shrink-0">
                <div className="relative w-14 h-20 rounded-xl overflow-hidden bg-black border border-white/10">
                  <Image
                    src={item.originalImage}
                    alt="Original"
                    fill
                    className="object-cover"
                    sizes="60px"
                  />
                  <span className="absolute bottom-0.5 inset-x-0 bg-black/70 text-[8px] text-center text-zinc-300 font-semibold">
                    Before
                  </span>
                </div>
                <div className="relative w-14 h-20 rounded-xl overflow-hidden bg-black border border-[#F5C518]/30">
                  <Image
                    src={item.generatedImage}
                    alt="AI Preview"
                    fill
                    className="object-cover"
                    sizes="60px"
                  />
                  <span className="absolute bottom-0.5 inset-x-0 bg-[#F5C518] text-[8px] text-center text-black font-bold">
                    After
                  </span>
                </div>
              </div>

              {/* Info & Actions */}
              <div className="flex-1 flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-bold text-white group-hover:text-[#F5C518] transition-colors">
                      {item.hairstyle.name}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item.id);
                      }}
                      className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {formatDate(item.timestamp)}
                  </p>

                  <span className="inline-block mt-1 bg-white/5 text-[9px] text-zinc-300 px-2 py-0.5 rounded border border-white/5">
                    {item.hairstyle.categoryLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => onViewItem(item)}
                    className="flex-1 bg-[#1e1e28] hover:bg-[#282836] text-white text-[11px] font-semibold py-1.5 rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3 text-[#F5C518]" />
                    Compare
                  </button>
                  <button
                    onClick={(e) => handleDownload(e, item)}
                    className="bg-[#1e1e28] hover:bg-[#282836] text-zinc-300 hover:text-white p-1.5 rounded-xl border border-white/10 transition-colors"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
