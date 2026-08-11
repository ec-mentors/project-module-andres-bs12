import React, { useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type?: 'success' | 'info' | 'warning';
}

interface SidepopUpProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const SidepopUp: React.FC<SidepopUpProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-5 fade-in duration-300 max-w-sm w-full">
      <div className="bg-white rounded-[24px] p-5 shadow-[0_20px_50px_rgba(100,23,255,0.25)] border border-[#e8e2f1] relative flex items-start space-x-3">
        {/* Success Icon */}
        <div className="p-2 bg-[#eee6ff] text-[#6417ff] rounded-2xl flex-shrink-0 mt-0.5">
          <CheckCircle2 className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 pr-6">
          <h4 className="text-base font-bold text-[#6417ff] leading-tight mb-1">
            {toast.title}
          </h4>
          <p className="text-xs font-medium text-[#5f6573] leading-relaxed">
            {toast.description}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94a3b8] hover:text-[#0f172a] p-1 rounded-full hover:bg-slate-100 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
