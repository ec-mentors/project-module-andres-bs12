import React, { useEffect, useState } from 'react';
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
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (toast) {
      setIsExiting(false);
      const timer = setTimeout(() => {
        handleStartExit();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleStartExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      setIsExiting(false);
    }, 400); // Wait for slide-out transition
  };

  if (!toast) return null;

  return (
    <div className="fixed top-24 right-6 z-50 max-w-sm w-full pointer-events-none">
      <div
        className={`pointer-events-auto bg-white rounded-[24px] p-5 shadow-[0_20px_50px_rgba(100,23,255,0.25)] border border-[#e8e2f1] relative flex items-start space-x-3 transition-all duration-400 ease-out transform ${
          isExiting
            ? 'translate-x-[120%] opacity-0'
            : 'translate-x-0 opacity-100'
        }`}
      >
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
          onClick={handleStartExit}
          className="absolute top-4 right-4 text-[#94a3b8] hover:text-[#0f172a] p-1 rounded-full hover:bg-slate-100 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
