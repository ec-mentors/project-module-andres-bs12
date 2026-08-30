import React from 'react';
import { X, Star } from 'lucide-react';
import { favoritesTypography } from './favoritesTypography';

export interface FavoritesModalHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  showDragPill?: boolean;
  theme?: 'dark' | 'light';
}

export const FavoritesModalHeader: React.FC<FavoritesModalHeaderProps> = ({
  title,
  subtitle,
  icon,
  onClose,
  showDragPill = true,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  return (
    <div
      className={`shrink-0 border-b ${
        isLight ? 'border-slate-200 bg-slate-50' : 'border-white/[0.08] bg-[#161619]'
      }`}
    >
      <div className="px-4 pt-3 pb-4 sm:px-6 sm:py-5">
        {showDragPill && (
          <div
            className={`w-10 h-1.5 rounded-full mx-auto mb-3 sm:hidden ${
              isLight ? 'bg-black/15' : 'bg-white/20'
            }`}
            aria-hidden
          />
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={`p-2 sm:p-2.5 rounded-2xl shrink-0 ${
                isLight ? 'bg-amber-100 text-amber-600' : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {icon ?? <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`${favoritesTypography.modalTitle} truncate`}>{title}</h3>
              {subtitle && (
                <p
                  className={`text-xs sm:text-sm font-medium ${
                    isLight ? 'text-slate-500' : 'text-zinc-400'
                  }`}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={`p-2 sm:p-2.5 rounded-full transition-all cursor-pointer shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center ${
                isLight
                  ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title="Close"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
