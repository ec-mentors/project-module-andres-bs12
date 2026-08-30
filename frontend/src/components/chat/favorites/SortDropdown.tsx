import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FavoritesDropdownMenu } from './FavoritesDropdownMenu';
import { favoritesTypography, TOUCH_TARGET_MIN } from './favoritesTypography';

export type SortOption = 'name_asc' | 'name_desc' | 'date_desc' | 'date_asc';

const SORT_LABELS: Record<SortOption, string> = {
  name_asc: 'Name (A → Z)',
  name_desc: 'Name (Z → A)',
  date_desc: 'Newest Saved',
  date_asc: 'Oldest Saved',
};

const SORT_OPTIONS: SortOption[] = ['name_asc', 'name_desc', 'date_desc', 'date_asc'];

interface SortDropdownProps {
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  theme?: 'dark' | 'light';
  placement?: 'top' | 'bottom';
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  selectedSort,
  onSortChange,
  theme = 'dark',
  placement = 'bottom',
}) => {
  const isLight = theme === 'light';
  const [isOpen, setIsOpen] = useState(false);

  const options = SORT_OPTIONS.map((value) => ({
    value,
    label: SORT_LABELS[value],
  }));

  return (
    <FavoritesDropdownMenu
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      options={options}
      selectedValue={selectedSort}
      onSelect={onSortChange}
      theme={theme}
      placement={placement}
      align="right"
      minWidth="min-w-[190px]"
      trigger={
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-3 py-2.5 rounded-xl ${favoritesTypography.buttonText} transition-all flex items-center gap-1.5 border active:scale-95 cursor-pointer shadow-2xs ${TOUCH_TARGET_MIN} ${
            isOpen
              ? isLight
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-white'
              : isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
              : 'bg-[#1c1c20] hover:bg-[#25252b] text-white border-white/[0.12]'
          }`}
          title="Sort favorites"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="truncate max-w-[130px] sm:max-w-none">{SORT_LABELS[selectedSort]}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      }
    />
  );
};
