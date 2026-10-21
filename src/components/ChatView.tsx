'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Scissors,
  Trash2,
  Copy,
  Check,
  Bot,
  User as UserIcon,
  HelpCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

const STORAGE_CHAT_KEY = 'goodlooking_ai_chat_history_v1';

const SUGGESTIONS = [
  '💇‍♂️ Yuzimga qaysi soch turmagi eng mos keladi?',
  '🔥 Fade va Taper o‘rtasida qanday farq bor?',
  '✂️ Sartaroshga nima deb tushuntirish kerak?',
  '🧔 Soqol bilan qaysi turmak zo‘r chiqadi?',
  '🧴 Soch to‘kilishini qanday to‘xtatish mumkin?',
];

export function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHAT_KEY);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        // Welcome message in natural Uzbek
        const welcome: ChatMessage = {
          id: 'welcome-1',
          role: 'model',
          content: `Assalomu alaykum! Men **GoodLooking AI Sartarosh & Stilistiman**! 👋

Sizga o'zingizga eng mos soch turmagi, yuz shaklingizga yarashadigan fadelar, soch parvarishi yoki sartaroshga qanday tushuntirish kerakligi haqida bemalol o'zbek tilida maslahat bera olaman.

Qanday savolingiz bor? Quyidagi mavzulardan birini tanlashingiz yoki o'zingiz yozishingiz mumkin! 👇`,
          timestamp: Date.now(),
        };
        setMessages([welcome]);
      }
    } catch {
      // Fallback
    }
  }, []);

  // Save to localStorage
  const saveMessages = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    try {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(newMessages));
    } catch {
      // Ignore
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMessage];
    saveMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const apiMessages = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Javob olishda xatolik yuz berdi');
      }

      const aiMessage: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        content: data.reply,
        timestamp: Date.now(),
      };

      saveMessages([...newHistory, aiMessage]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ulanish xatosi';
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ Kechirasiz, xatolik yuz berdi: ${msg}. Iltimos qaytadan urinib ko'ring.`,
        timestamp: Date.now(),
      };
      saveMessages([...newHistory, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('Barcha yozishmalarni tozalashni xohlaysizmi?')) {
      const resetMsg: ChatMessage = {
        id: 'welcome-reset',
        role: 'model',
        content: `Assalomu alaykum! Yangi suhbatni boshlaymiz. Soch turmaklari va stil bo'yicha qanday savolingiz bor? 😊`,
        timestamp: Date.now(),
      };
      saveMessages([resetMsg]);
    }
  };

  const handleCopy = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full text-white relative">
      {/* Chat Top Header */}
      <div className="px-4 py-3 bg-[#0d0d12]/95 backdrop-blur-md border-b border-white/8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F5C518]/15 border border-[#F5C518]/40 flex items-center justify-center text-[#F5C518] shadow-md">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white tracking-tight">AI Stilist</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
            </div>
            <p className="text-[10px] text-zinc-400">O‘zbekcha jonli maslahat • Online</p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="text-zinc-400 hover:text-rose-400 p-2 rounded-xl hover:bg-white/5 transition-colors"
          title="Yozishmalarni tozalash"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
        {/* Quick Suggestion Chips (visible when few messages) */}
        {messages.length <= 2 && (
          <div className="space-y-1.5 pb-2">
            <p className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-[#F5C518]" />
              Tezkor savollar:
            </p>
            <div className="flex flex-col gap-1.5">
              {SUGGESTIONS.map((sugg, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sugg)}
                  className="text-left text-xs bg-[#16161d] hover:bg-[#20202a] text-zinc-300 hover:text-white p-2.5 rounded-xl border border-white/8 transition-colors flex items-center justify-between"
                >
                  <span>{sugg}</span>
                  <span className="text-[#F5C518] text-xs">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Bubbles */}
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-xl bg-[#F5C518] text-black font-bold flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <Bot className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed relative group ${
                  isUser
                    ? 'bg-[#F5C518] text-black font-medium rounded-tr-none shadow-md'
                    : 'bg-[#15151b] border border-white/10 text-zinc-200 rounded-tl-none shadow-lg'
                }`}
              >
                {/* Message Content with simple Markdown rendering */}
                <div className="whitespace-pre-wrap space-y-1 font-sans">
                  {m.content.split('\n').map((line, idx) => {
                    if (line.startsWith('### ')) {
                      return (
                        <h4 key={idx} className="font-bold text-white text-xs mt-2 mb-1">
                          {line.replace('### ', '')}
                        </h4>
                      );
                    }
                    if (line.startsWith('*   ') || line.startsWith('-   ')) {
                      return (
                        <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
                          <span className="text-[#F5C518] font-bold">•</span>
                          <span>{line.replace(/^(\*|-)\s+/, '')}</span>
                        </div>
                      );
                    }
                    return <p key={idx}>{line}</p>;
                  })}
                </div>

                {/* Footer timestamp & copy */}
                <div
                  className={`flex items-center justify-between gap-2 mt-2 pt-1 border-t text-[9px] ${
                    isUser
                      ? 'border-black/10 text-black/70'
                      : 'border-white/5 text-zinc-500'
                  }`}
                >
                  <span>
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {!isUser && (
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="hover:text-white flex items-center gap-1 transition-colors"
                      title="Nusxa olish"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Ko‘chirildi</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Nusxa</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-xl bg-[#22222c] border border-white/10 text-white flex items-center justify-center shrink-0 mt-1">
                  <UserIcon className="w-4 h-4 text-zinc-300" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-2.5 items-center">
            <div className="w-7 h-7 rounded-xl bg-[#F5C518] text-black font-bold flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="bg-[#15151b] border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F5C518] animate-spin" />
              <span>AI Stilist yozmoqda</span>
              <span className="flex gap-1 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-2"></div>
      </div>

      {/* Input Bar pinned above bottom navigation */}
      <div className="px-3 pb-24 pt-2 bg-[#0a0a0d]/90 backdrop-blur-md border-t border-white/8 sticky bottom-0 z-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-[#14141a] border border-white/12 rounded-2xl p-1.5 focus-within:border-[#F5C518] transition-colors shadow-lg"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="O‘zbekcha savolingizni yozing..."
            disabled={isLoading}
            className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              !inputText.trim() || isLoading
                ? 'bg-[#1f1f28] text-zinc-600 cursor-not-allowed'
                : 'bg-[#F5C518] hover:bg-[#ffcf24] text-black shadow-md active:scale-95'
            }`}
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
}
