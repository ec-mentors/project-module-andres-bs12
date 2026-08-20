import React, { useState, useRef, useEffect } from 'react';
import { Mic, Plus, Camera, Image as ImageIcon, Send, Loader2, X, Check } from 'lucide-react';

interface SmartOmnibarProps {
  onSendText: (text: string) => void;
  onSendVoice: (audioBlob: Blob, durationSec: number) => void;
  onSelectPhoto: (file: File) => void;
  isLoading?: boolean;
  theme?: 'dark' | 'light';
}

export const SmartOmnibar: React.FC<SmartOmnibarProps> = ({
  onSendText,
  onSendVoice,
  onSelectPhoto,
  isLoading = false,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [volumeLevels, setVolumeLevels] = useState<number[]>([4, 8, 12, 6, 16, 8, 14, 20, 10, 6, 12, 4]);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const attachmentMenuRef = useRef<HTMLDivElement | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopRecordingCleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
    setVolumeLevels([4, 8, 12, 6, 16, 8, 14, 20, 10, 6, 12, 4]);
  };

  // Close attachment menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
        setIsAttachmentMenuOpen(false);
      }
    };
    if (isAttachmentMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAttachmentMenuOpen]);

  // Clean up recording on unmount
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading || isRecording) return;
    onSendText(inputText.trim());
    setInputText('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onSelectPhoto(file);
      e.target.value = '';
      setIsAttachmentMenuOpen(false);
    }
  };

  // --- INLINE VOICE RECORDING WITH REAL AUDIO VISUALIZER ---
  const startInlineRecording = async () => {
    if (isLoading || isRecording) return;
    setIsAttachmentMenuOpen(false);
    audioChunksRef.current = [];
    setRecordingSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const AudioCtxConstructor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtxConstructor();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateWaveform = () => {
        analyser.getByteFrequencyData(dataArray);
        const bars: number[] = [];
        const step = Math.floor(bufferLength / 12);
        for (let i = 0; i < 12; i++) {
          const val = dataArray[i * step] || 0;
          bars.push(Math.max(4, Math.min(26, Math.round((val / 255) * 26))));
        }
        setVolumeLevels(bars);
        animFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone access was denied or not supported in this browser.');
    }
  };

  const stopAndSendRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    const duration = Math.max(1, recordingSeconds);

    mediaRecorderRef.current.onstop = () => {
      const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      onSendVoice(audioBlob, duration);
      stopRecordingCleanup();
    };

    mediaRecorderRef.current.stop();
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    stopRecordingCleanup();
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto px-2 sm:px-4">
      
      {/* Hidden Native File & Camera Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* OPENAI STYLE ATTACHMENT POPOVER MENU */}
      {isAttachmentMenuOpen && (
        <div
          ref={attachmentMenuRef}
          className={`absolute bottom-16 left-4 z-40 p-1.5 rounded-2xl border shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 min-w-[200px] ${
            isLight
              ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-900/10'
              : 'bg-[#141416]/98 border-white/[0.12] text-white shadow-black/80'
          }`}
        >
          {/* Option 1: Take Photo */}
          <button
            type="button"
            onClick={() => {
              setIsAttachmentMenuOpen(false);
              cameraInputRef.current?.click();
            }}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#1f1f23] text-zinc-200 hover:text-white'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <span>Take Photo</span>
          </button>

          {/* Option 2: Upload from Library */}
          <button
            type="button"
            onClick={() => {
              setIsAttachmentMenuOpen(false);
              fileInputRef.current?.click();
            }}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
              isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#1f1f23] text-zinc-200 hover:text-white'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <span>Photo Library</span>
          </button>
        </div>
      )}

      {/* OMNIBAR CAPSULE */}
      <div className={`p-[1px] rounded-full transition-all duration-300 ${
        isRecording
          ? isLight
            ? 'bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 shadow-[0_8px_32px_rgba(0,0,0,0.15)]'
            : 'bg-gradient-to-r from-white/20 via-white/40 to-white/20 shadow-[0_8px_32px_rgba(255,255,255,0.15)]'
          : isLight
          ? 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.05)]'
          : 'bg-gradient-to-r from-white/[0.08] via-white/[0.14] to-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.8)]'
      }`}>
        <div
          className={`backdrop-blur-md px-2.5 sm:px-4 py-2 rounded-full flex items-center space-x-2 sm:space-x-3 border transition-colors ${
            isLight
              ? 'bg-white/95 border-slate-300/80 text-slate-900'
              : 'bg-[#121214]/95 border-white/[0.08] text-white'
          }`}
        >

          {/* INLINE VOICE RECORDING MODE */}
          {isRecording ? (
            <div className="flex-1 flex items-center justify-between space-x-3 py-0.5 animate-in fade-in duration-200">
              
              {/* Cancel Button */}
              <button
                type="button"
                onClick={cancelRecording}
                className="p-2 rounded-full hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all active:scale-95"
                title="Cancel Voice Note"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Pulsating Live Soundwave Bars */}
              <div className="flex-1 flex items-center justify-center space-x-1.5 h-7">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping mr-2" />
                {volumeLevels.map((height, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-75 ${isLight ? 'bg-black' : 'bg-white'}`}
                    style={{ height: `${height}px` }}
                  />
                ))}
              </div>

              {/* Recording Duration Timer */}
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-white/10 text-white'}`}>
                {formatTimer(recordingSeconds)}
              </span>

              {/* Stop & Send Recording Button */}
              <button
                type="button"
                onClick={stopAndSendRecording}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 flex items-center space-x-1.5 ${
                  isLight
                    ? 'bg-black hover:bg-zinc-800 text-white shadow-md'
                    : 'bg-white hover:bg-zinc-200 text-black shadow-sm'
                }`}
              >
                <span>Send</span>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          ) : (
            /* STANDARD TEXT INPUT FORM (OpenAI-style layout) */
            <form onSubmit={handleSend} className="flex-1 flex items-center space-x-2 sm:space-x-3">
              
              {/* OpenAI-Style "+" Attachment Button */}
              <button
                type="button"
                onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
                disabled={isLoading}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border transition-all active:scale-95 shrink-0 ${
                  isAttachmentMenuOpen
                    ? isLight
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-white'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 shadow-xs'
                    : 'bg-[#18181b] hover:bg-[#222226] text-zinc-300 hover:text-white border-white/[0.08]'
                }`}
                title="Add photo or camera"
              >
                <Plus className={`w-4 h-4 transition-transform duration-200 ${isAttachmentMenuOpen ? 'rotate-45' : ''}`} />
              </button>

              {/* Input Field with Responsive Concise Placeholder */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                placeholder="Message Nutria..."
                className={`flex-1 bg-transparent px-2 py-1 text-base sm:text-sm font-medium focus:outline-none placeholder:text-zinc-500 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              />

              {/* Right Action Buttons: Mic + Send */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
                
                {/* Audio Voice Note Button */}
                <button
                  type="button"
                  onClick={startInlineRecording}
                  disabled={isLoading}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border transition-all active:scale-95 disabled:opacity-40 shrink-0 ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200 shadow-xs'
                      : 'bg-[#18181b] hover:bg-[#222226] text-zinc-300 hover:text-white border-white/[0.08]'
                  }`}
                  title="Speak Voice Note"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md shrink-0 ${
                    inputText.trim() && !isLoading
                      ? isLight
                        ? 'bg-black hover:bg-zinc-800 text-white shadow-md cursor-pointer'
                        : 'bg-white hover:bg-zinc-200 text-black shadow-sm cursor-pointer'
                      : isLight
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/40'
                      : 'bg-[#18181b] text-zinc-600 cursor-not-allowed border border-white/[0.04]'
                  }`}
                  title="Send Message"
                >
                  {isLoading ? (
                    <Loader2 className={`w-4 h-4 animate-spin ${isLight ? 'text-white' : 'text-black'}`} />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>

              </div>

            </form>
          )}

        </div>
      </div>

    </div>
  );
};
