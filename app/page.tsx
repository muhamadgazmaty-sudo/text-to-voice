'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wand2, History, Mic2, Languages, Sparkles, ChevronLeft, Volume2, Download, Trash2, User } from 'lucide-react';
import { generateSpeech, VoiceType } from '@/lib/gemini';
import AudioPlayer from '@/components/AudioPlayer';

interface GeneratedAudio {
  id: string;
  text: string;
  voice: VoiceType;
  base64: string;
  timestamp: number;
}

export default function KajuAudioApp() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState<VoiceType>('fusha_pro');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedAudio[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');

  useEffect(() => {
    const saved = localStorage.getItem('kaju_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const saveToHistory = (newAudio: GeneratedAudio) => {
    const updated = [newAudio, ...history].slice(0, 20); // Keep last 20
    setHistory(updated);
    localStorage.setItem('kaju_history', JSON.stringify(updated));
  };

  const deleteFromHistory = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('kaju_history', JSON.stringify(updated));
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    try {
      const base64 = await generateSpeech(text, voice);
      const newAudio: GeneratedAudio = {
        id: Date.now().toString(),
        text,
        voice,
        base64,
        timestamp: Date.now()
      };
      saveToHistory(newAudio);
      setText('');
      setActiveTab('history');
    } catch (error) {
      console.error("Generation failed", error);
      alert("عذراً، حدث خطأ أثناء توليد الصوت. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen max-w-2xl mx-auto p-6 flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col gap-2 pt-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 rotate-3">
            <Mic2 className="text-white" size={24} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">كاجو صوتيات</h1>
        </div>
        <p className="text-zinc-500 text-sm font-medium mr-1">حوّل نصوصك إلى أصوات احترافية بلمسة واحدة</p>
      </header>

      {/* Tabs */}
      <nav className="flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
        <button 
          onClick={() => setActiveTab('generate')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'generate' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Wand2 size={16} />
          توليد جديد
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <History size={16} />
          المكتبة الصوتية
          {history.length > 0 && (
            <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {history.length}
            </span>
          )}
        </button>
      </nav>

      {/* Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'generate' ? (
            <motion.div 
              key="generate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              {/* Voice Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setVoice('fusha_pro')}
                  className={`p-3 rounded-xl border-2 flex flex-col gap-1.5 transition-all text-right ${voice === 'fusha_pro' ? 'border-orange-500 bg-orange-500/5' : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'}`}
                >
                  <div className="flex items-center justify-between">
                    <Languages size={16} className={voice === 'fusha_pro' ? 'text-orange-500' : 'text-zinc-600'} />
                    <span className={`text-[8px] font-bold uppercase tracking-widest ${voice === 'fusha_pro' ? 'text-orange-500' : 'text-zinc-500'}`}>Pro</span>
                  </div>
                  <span className="text-sm font-bold">فصحى (وثائقي)</span>
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setVoice('fusha_storyteller')}
                  className={`p-3 rounded-xl border-2 flex flex-col gap-1.5 transition-all text-right ${voice === 'fusha_storyteller' ? 'border-orange-500 bg-orange-500/5' : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'}`}
                >
                  <div className="flex items-center justify-between">
                    <Volume2 size={16} className={voice === 'fusha_storyteller' ? 'text-orange-500' : 'text-zinc-600'} />
                    <span className={`text-[8px] font-bold uppercase tracking-widest ${voice === 'fusha_storyteller' ? 'text-orange-500' : 'text-zinc-500'}`}>Premium</span>
                  </div>
                  <span className="text-sm font-bold">فصحى (مميز)</span>
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setVoice('syrian_abu_saleh')}
                  className={`p-3 rounded-xl border-2 flex flex-col gap-1.5 transition-all text-right ${voice === 'syrian_abu_saleh' ? 'border-orange-500 bg-orange-500/5' : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'}`}
                >
                  <div className="flex items-center justify-between">
                    <Sparkles size={16} className={voice === 'syrian_abu_saleh' ? 'text-orange-500' : 'text-zinc-600'} />
                    <span className={`text-[8px] font-bold uppercase tracking-widest ${voice === 'syrian_abu_saleh' ? 'text-orange-500' : 'text-zinc-500'}`}>Dialect</span>
                  </div>
                  <span className="text-sm font-bold">سوري (أبو صالح)</span>
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setVoice('homsi_sara')}
                  className={`p-3 rounded-xl border-2 flex flex-col gap-1.5 transition-all text-right ${voice === 'homsi_sara' ? 'border-orange-500 bg-orange-500/5' : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'}`}
                >
                  <div className="flex items-center justify-between">
                    <Mic2 size={16} className={voice === 'homsi_sara' ? 'text-orange-500' : 'text-zinc-600'} />
                    <span className={`text-[8px] font-bold uppercase tracking-widest ${voice === 'homsi_sara' ? 'text-orange-500' : 'text-zinc-500'}`}>Female</span>
                  </div>
                  <span className="text-sm font-bold">حمصي (سارة)</span>
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setVoice('egyptian_ahmed')}
                  className={`p-3 rounded-xl border-2 flex flex-col gap-1.5 transition-all text-right ${voice === 'egyptian_ahmed' ? 'border-orange-500 bg-orange-500/5' : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'}`}
                >
                  <div className="flex items-center justify-between">
                    <User size={16} className={voice === 'egyptian_ahmed' ? 'text-orange-500' : 'text-zinc-600'} />
                    <span className={`text-[8px] font-bold uppercase tracking-widest ${voice === 'egyptian_ahmed' ? 'text-orange-500' : 'text-zinc-500'}`}>Friendly</span>
                  </div>
                  <span className="text-sm font-bold">مصري (أحمد)</span>
                </motion.button>
              </div>

              {/* Text Input */}
              <div className="relative">
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="اكتب النص الذي تريد تحويله هنا..."
                  className="w-full h-48 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-lg focus:outline-none focus:border-orange-500/50 transition-colors resize-none placeholder:text-zinc-700"
                />
                <div className="absolute bottom-4 left-4 text-[10px] font-mono text-zinc-600 uppercase tracking-tighter">
                  {text.length} characters
                </div>
              </div>

              {/* Generate Button */}
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-black transition-all active:scale-[0.98] ${isGenerating || !text.trim() ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-orange-500 text-white shadow-xl shadow-orange-500/20 hover:bg-orange-600'}`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <Wand2 size={20} />
                    توليد الصوت الآن
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-4"
            >
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-600 gap-4">
                  <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center">
                    <Volume2 size={32} />
                  </div>
                  <p className="text-sm font-medium">لا توجد تسجيلات حتى الآن</p>
                </div>
              ) : (
                history.map((item) => (
                  <AudioPlayer 
                    key={item.id}
                    audioBase64={item.base64}
                    title={item.text.slice(0, 30) + (item.text.length > 30 ? '...' : '')}
                    timestamp={item.timestamp}
                    voiceLabel={
                      item.voice === 'fusha_pro' ? 'فصحى وثائقي' : 
                      item.voice === 'fusha_storyteller' ? 'فصحى مميز' :
                      item.voice === 'syrian_abu_saleh' ? 'لهجة سورية' : 
                      item.voice === 'homsi_sara' ? 'لهجة حمصية' :
                      'لهجة مصرية'
                    }
                    onDelete={() => deleteFromHistory(item.id)}
                  />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-900 flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Engine</span>
            <span className="text-xs font-medium text-zinc-400">Gemini 2.5 Flash</span>
          </div>
          <div className="w-px h-8 bg-zinc-900" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Quality</span>
            <span className="text-xs font-medium text-zinc-400">24kHz Audio</span>
          </div>
        </div>
        <p className="text-[10px] text-zinc-700 font-mono uppercase">© 2026 Kaju Audio Labs • Built for Pro Creators</p>
      </footer>
    </main>
  );
}
