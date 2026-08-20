import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Trash2, Send, AlertCircle } from 'lucide-react';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVoice: (audioBlob: Blob, durationSec: number) => void;
  theme?: 'dark' | 'light';
}

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  isOpen,
  onClose,
  onSendVoice,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const stopRecordingCleanup = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setSeconds(0);
    setAudioBlob(null);
  };

  const startRecording = async () => {
    setErrorMsg(null);
    setSeconds(0);
    setAudioBlob(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      console.error('Microphone error:', err);
      setErrorMsg('Microphone access denied or unavailable. Please enable microphone permissions in your browser.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Initialize and start recording when modal opens
  useEffect(() => {
    if (!isOpen) {
      const cleanupTimer = setTimeout(() => stopRecordingCleanup(), 0);
      return () => clearTimeout(cleanupTimer);
    }

    const startTimer = setTimeout(() => {
      void startRecording();
    }, 0);

    return () => {
      clearTimeout(startTimer);
      stopRecordingCleanup();
    };
  }, [isOpen]);

  const handleSend = () => {
    if (audioBlob) {
      onSendVoice(audioBlob, seconds);
      onClose();
    } else if (isRecording) {
      // Stop and send directly
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.addEventListener('stop', () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          onSendVoice(blob, seconds);
          onClose();
        }, { once: true });
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }
  };

  if (!isOpen) return null;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl transition-all ${
        isLight
          ? 'bg-white/95 border-slate-200 text-slate-900'
          : 'bg-[#121214]/95 border-white/10 text-white'
      }`}>
        
        {/* Title */}
        <div className="text-center mb-6">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse border ${
            isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-white/10 border-white/20 text-white'
          }`}>
            <Mic className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black tracking-tight">Record Voice Note</h3>
          <p className={`text-xs font-medium mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Speak naturally about what you ate and portion sizes.
          </p>
        </div>

        {errorMsg ? (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2.5 text-xs text-rose-400 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        ) : (
          /* Animated Audio Waveform Container */
          <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center space-y-4 mb-6 ${
            isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-[#18181b] border-white/10'
          }`}>
            
            {/* Animated Sound Wave Bars */}
            <div className="flex items-center justify-center space-x-1.5 h-12">
              {[8, 16, 28, 14, 34, 20, 10, 30, 22, 14, 26, 12, 18].map((h, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isRecording ? (isLight ? 'bg-black animate-pulse' : 'bg-white animate-pulse') : (isLight ? 'bg-slate-400 opacity-40' : 'bg-slate-500 opacity-40')
                  }`}
                  style={{
                    height: isRecording ? `${Math.max(6, Math.sin((seconds + i) * 1.5) * h + 14)}px` : '6px',
                  }}
                />
              ))}
            </div>

            {/* Timer Counter */}
            <div className="flex items-center space-x-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-400'}`} />
              <span className="text-sm font-black font-mono tracking-wider">{formatTimer(seconds)}</span>
            </div>

          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-2xl text-xs font-bold border transition-all active:scale-95 flex items-center justify-center space-x-1.5 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-[#18181b] hover:bg-[#222226] text-zinc-200 border-white/15'
            }`}
          >
            <Trash2 className="w-4 h-4 text-slate-400" />
            <span>Cancel</span>
          </button>

          {isRecording ? (
            <button
              onClick={stopRecording}
              className="flex-1 py-3 rounded-2xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all active:scale-95 flex items-center justify-center space-x-1.5"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop</span>
            </button>
          ) : null}

          <button
            onClick={handleSend}
            disabled={seconds === 0 && !audioBlob}
            className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center space-x-1.5 ${
              isLight
                ? 'bg-black hover:bg-zinc-800 text-white shadow-md'
                : 'bg-white hover:bg-zinc-200 text-black shadow-md'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Send Note</span>
          </button>
        </div>

      </div>
    </div>
  );
};
