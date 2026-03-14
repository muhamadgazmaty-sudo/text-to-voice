'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Trash2, Volume2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AudioPlayerProps {
  audioBase64: string;
  title: string;
  timestamp?: number;
  voiceLabel?: string;
  onDelete?: () => void;
}

const pcmToWav = (pcmData: Uint8Array, sampleRate: number = 24000) => {
  const buffer = new ArrayBuffer(44 + pcmData.length);
  const view = new DataView(buffer);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  // file length
  view.setUint32(4, 36 + pcmData.length, true);
  // RIFF type
  view.setUint32(8, 0x57415645, false); // "WAVE"
  // format chunk identifier
  view.setUint32(12, 0x666d7420, false); // "fmt "
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  view.setUint32(36, 0x64617461, false); // "data"
  // data chunk length
  view.setUint32(40, pcmData.length, true);

  // write the PCM samples
  const pcmView = new Uint8Array(buffer, 44);
  pcmView.set(pcmData);

  return new Blob([buffer], { type: 'audio/wav' });
};

const base64ToUint8Array = (base64: string) => {
  const binStr = atob(base64);
  const len = binStr.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = binStr.charCodeAt(i);
  }
  return arr;
};

export default function AudioPlayer({ audioBase64, title, timestamp, voiceLabel, onDelete }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'completed'>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioBase64) {
      const pcmData = base64ToUint8Array(audioBase64);
      const blob = pcmToWav(pcmData, 24000);
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load(); // Force load the new source
      }
      return () => URL.revokeObjectURL(url);
    }
  }, [audioBase64]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error("Playback failed", err);
          setIsPlaying(false);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      if (total > 0) {
        setProgress((current / total) * 100);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleDownload = () => {
    if (!audioRef.current?.src) return;
    
    setDownloadStatus('downloading');
    
    const link = document.createElement('a');
    link.href = audioRef.current.src;
    link.download = `${title || 'kaju-audio'}.wav`;
    link.click();
    
    // Set to completed after a short delay
    setTimeout(() => {
      setDownloadStatus('completed');
      
      // Reset to idle after 3 seconds
      setTimeout(() => {
        setDownloadStatus('idle');
      }, 3000);
    }, 500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col gap-3 group hover:border-zinc-700 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-all active:scale-95"
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="mr-0.5" />}
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-200 line-clamp-1">{title}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                {voiceLabel || 'Audio Generated'}
              </span>
              {timestamp && (
                <>
                  <span className="text-[10px] text-zinc-700">•</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {new Date(timestamp).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownload}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            title="تحميل"
          >
            <Download size={18} />
          </button>
          {onDelete && (
            <button 
              onClick={onDelete}
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="حذف"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="relative h-1 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-orange-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <AnimatePresence>
        {downloadStatus !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="flex items-center gap-2 text-[10px] font-bold"
          >
            {downloadStatus === 'downloading' ? (
              <>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-orange-500">جاري التنزيل...</span>
              </>
            ) : (
              <>
                <Check size={12} className="text-emerald-500" />
                <span className="text-emerald-500">تم التنزيل</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="hidden"
      />
    </motion.div>
  );
}
