import React, { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
}

interface SidepopUpProps {
  toast: ToastMessage | null;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export const SidepopUp: React.FC<SidepopUpProps> = ({ toast, onClose, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      const showTimer = setTimeout(() => setIsVisible(true), 0);

      // Auto-hide after 4 seconds
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 800);
      }, 4000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-6 z-50 pointer-events-none max-w-[calc(100vw-32px)]">
      <div
        className={`pointer-events-auto flex items-center space-x-3 backdrop-blur-2xl border p-3 px-4 rounded-2xl transition-all duration-500 ease-out transform ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-900 shadow-[0_16px_40px_rgba(0,0,0,0.08)]'
            : 'bg-[#121214]/95 border-white/15 text-white shadow-[0_16px_40px_rgba(0,0,0,0.6)]'
        } ${
          isVisible
            ? 'translate-y-0 opacity-100 scale-100'
            : '-translate-y-6 opacity-0 scale-95'
        }`}
      >
        {/* Success Icon */}
        <div className={`p-1.5 rounded-xl border shrink-0 ${
          isLight ? 'bg-slate-100 text-slate-900 border-slate-200' : 'bg-white/10 text-white border-white/20'
        }`}>
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
        </div>

        {/* Message Content */}
        <div className="space-y-0.5 min-w-0">
          <h4 className={`text-xs font-extrabold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {toast.title}
          </h4>
          <p className={`text-[11px] font-medium truncate ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            {toast.description}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 800);
          }}
          className={`p-1 rounded-lg transition-colors ml-1 shrink-0 ${
            isLight
              ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
