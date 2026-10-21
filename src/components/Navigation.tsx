'use client';

import React from 'react';
import { Home, Compass, Sparkles, Clock, User, MessageSquare, Scan } from 'lucide-react';
import { TabType } from '@/types';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  historyCount?: number;
}

export function Navigation({
  currentTab,
  onSelectTab,
  historyCount = 0,
}: NavigationProps) {
  const tabs: {
    id: TabType;
    label: string;
    icon: React.ElementType;
    isPrimary?: boolean;
  }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'studio', label: 'Studio', icon: Sparkles, isPrimary: true },
    { id: 'explore', label: 'Turmaklar', icon: Compass },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav aria-label="Bottom Navigation" className="sticky bottom-0 left-0 right-0 z-40 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-1 pointer-events-auto">
      <div className="bg-[#141419]/95 backdrop-blur-xl border border-white/10 rounded-full px-2 py-1.5 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (isActive) {
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className="flex items-center gap-1.5 bg-[#F5C518] text-black font-semibold text-xs px-3.5 py-2 rounded-full transition-all duration-200 gold-glow-sm shadow-md"
              >
                <Icon className="w-4 h-4 stroke-[2.5]" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="relative p-2 text-zinc-400 hover:text-white transition-colors duration-150 rounded-full flex items-center justify-center"
              title={tab.label}
              aria-label={tab.label}
            >
              <Icon className="w-5 h-5 stroke-[1.75]" />
              {tab.id === 'history' && historyCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#F5C518]"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
