'use client';

import React, { useState, useEffect } from 'react';
import { PhoneFrame } from '@/components/PhoneFrame';
import { Navigation } from '@/components/Navigation';
import { HomeView } from '@/components/HomeView';
import { StudioView } from '@/components/StudioView';
import { ResultView } from '@/components/ResultView';
import { ExploreView } from '@/components/ExploreView';
import { HistoryView } from '@/components/HistoryView';
import { ProfileView } from '@/components/ProfileView';
import { ChatView } from '@/components/ChatView';
import { DecomposeStudioView } from '@/components/DecomposeStudioView';
import { Hairstyle, TabType, GenerationHistoryItem } from '@/types';
import { HAIRSTYLES } from '@/data/hairstyles';

const STORAGE_KEY = 'goodlooking_generation_history_v1';

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [selectedHairstyle, setSelectedHairstyle] = useState<Hairstyle>(
    HAIRSTYLES[0]
  );
  const [currentResult, setCurrentResult] = useState<{
    originalImage: string;
    generatedImage: string;
    hairstyle: Hairstyle;
    customNotes?: string;
  } | null>(null);

  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [isAiConfigured, setIsAiConfigured] = useState(false);
  const [aiModel, setAiModel] = useState('gpt-image-2.5-sunburst');

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load history from localStorage', e);
    }

    // Check Gemini API status
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setIsAiConfigured(Boolean(data.configured));
        if (data.model) setAiModel(data.model);
      })
      .catch((e) => {
        console.warn('Failed to fetch API status', e);
      });
  }, []);

  // Save history
  const saveToHistory = (
    originalImage: string,
    generatedImage: string,
    hairstyle: Hairstyle,
    notes?: string
  ) => {
    const newItem: GenerationHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      originalImage,
      generatedImage,
      hairstyle,
      notes,
    };

    const updated = [newItem, ...history].slice(0, 20); // Keep last 20
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save history', e);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to delete history item', e);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear history', e);
    }
  };

  // Navigations
  const handleNavigateToStudio = (preselectedStyle?: Hairstyle) => {
    if (preselectedStyle) {
      setSelectedHairstyle(preselectedStyle);
    }
    setCurrentResult(null);
    setCurrentTab('studio');
  };

  const handleGenerationComplete = (
    originalImage: string,
    generatedImage: string,
    hairstyle: Hairstyle,
    notes?: string
  ) => {
    setCurrentResult({
      originalImage,
      generatedImage,
      hairstyle,
      customNotes: notes,
    });
    saveToHistory(originalImage, generatedImage, hairstyle, notes);
  };

  const handleViewHistoryItem = (item: GenerationHistoryItem) => {
    setCurrentResult({
      originalImage: item.originalImage,
      generatedImage: item.generatedImage,
      hairstyle: item.hairstyle,
      customNotes: item.notes,
    });
    setCurrentTab('studio');
  };

  const handleTabChange = (tab: TabType) => {
    // If switching into studio, keep current result if exists; else show fresh studio
    setCurrentTab(tab);
  };

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col">
        {/* View Routing */}
        {currentTab === 'home' && (
          <HomeView
            onNavigateToStudio={handleNavigateToStudio}
            onNavigateTab={handleTabChange}
            isAiConfigured={isAiConfigured}
          />
        )}

        {currentTab === 'chat' && <ChatView />}

        {currentTab === 'explore' && (
          <ExploreView
            onSelectStyle={(style) => {
              handleNavigateToStudio(style);
            }}
          />
        )}

        {currentTab === 'studio' && (
          currentResult ? (
            <ResultView
              originalImage={currentResult.originalImage}
              generatedImage={currentResult.generatedImage}
              hairstyle={currentResult.hairstyle}
              customNotes={currentResult.customNotes}
              onTryAnotherStyle={() => setCurrentResult(null)}
              onNewPhoto={() => {
                setCurrentResult(null);
                setSelectedHairstyle(HAIRSTYLES[0]);
              }}
            />
          ) : (
            <StudioView
              initialStyle={selectedHairstyle}
              onGenerationComplete={handleGenerationComplete}
              isAiConfigured={isAiConfigured}
            />
          )
        )}

        {currentTab === 'history' && (
          <HistoryView
            history={history}
            onClearHistory={handleClearHistory}
            onDeleteItem={handleDeleteHistoryItem}
            onViewItem={handleViewHistoryItem}
            onNavigateToStudio={() => handleNavigateToStudio()}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            onNavigateHome={() => setCurrentTab('home')}
            isAiConfigured={isAiConfigured}
            aiModel={aiModel}
          />
        )}
      </div>

      {/* Floating Bottom Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={handleTabChange}
        historyCount={history.length}
      />
    </PhoneFrame>
  );
}
