import React, { useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import { favoritesTypography, TOUCH_TARGET_MIN } from './favoritesTypography';

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface FavoritesDropdownMenuProps<T extends string> {
  isOpen: boolean;
  onClose: () => void;
  options: DropdownOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  theme?: 'dark' | 'light';
  placement?: 'top' | 'bottom';
  align?: 'left' | 'right';
  minWidth?: string;
  trigger: React.ReactNode;
}

export function FavoritesDropdownMenu<T extends string>({
  isOpen,
  onClose,
  options,
  selectedValue,
  onSelect,
  theme = 'dark',
  placement = 'bottom',
  align = 'left',
  minWidth = 'min-w-[180px]',
  trigger,
}: FavoritesDropdownMenuProps<T>) {
  const isLight = theme === 'light';
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const placementClasses = placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
  const alignClasses = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div ref={containerRef} className="relative shrink-0">
      {trigger}

      {isOpen && (
        <div
          className={`absolute ${placementClasses} ${alignClasses} z-50 p-2 rounded-2xl border shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${minWidth} ${
            isLight
              ? 'bg-white/98 border-slate-200 text-slate-900 shadow-slate-900/15'
              : 'bg-[#161619]/98 border-white/[0.14] text-white shadow-black/90'
          }`}
        >
          <div className="flex flex-col gap-1.5">
            {options.map((opt) => {
              const isSelected = selectedValue === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onSelect(opt.value);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl ${favoritesTypography.buttonText} text-left transition-colors cursor-pointer ${TOUCH_TARGET_MIN} ${
                    isSelected
                      ? isLight
                        ? 'bg-slate-100 font-bold'
                        : 'bg-white/15 text-white font-bold'
                      : isLight
                      ? 'hover:bg-slate-100 text-slate-700'
                      : 'hover:bg-white/10 text-zinc-300'
                  }`}
                >
                  <div className="min-w-0">
                    <span>{opt.label}</span>
                    {opt.description && (
                      <span className={`block text-xs font-medium mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                        {opt.description}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-4 h-4 stroke-[3] shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
