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
}

export const SidepopUp: React.FC<SidepopUpProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setIsVisible(true);

      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 800);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-6 z-50 pointer-events-none max-w-[calc(100vw-32px)]">
      <div
        className={`pointer-events-auto flex items-center space-x-3 bg-[#161024]/95 backdrop-blur-2xl border-2 border-white/15 text-white p-3 px-4 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-500 ease-out transform ${
          isVisible
            ? 'translate-y-0 opacity-100 scale-100'
            : '-translate-y-6 opacity-0 scale-95'
        }`}
      >
        {/* Purple Accent Success Icon */}
        <div className="p-1.5 bg-[#6417ff]/20 text-[#6417ff] rounded-xl border border-[#6417ff]/40 shrink-0">
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
        </div>

        {/* Message Content */}
        <div className="space-y-0.5 min-w-0">
          <h4 className="text-xs font-extrabold text-white truncate">
            {toast.title}
          </h4>
          <p className="text-[11px] font-medium text-slate-300 truncate">
            {toast.description}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 800);
          }}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors ml-1 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
