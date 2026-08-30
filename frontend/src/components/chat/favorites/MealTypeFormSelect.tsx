import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { MealType } from '../../../types/favoriteMeal';
import { FavoritesDropdownMenu } from './FavoritesDropdownMenu';
import { MEAL_TYPE_LABELS, MEAL_TYPES } from './mealTypeUtils';
import { favoritesTypography, TOUCH_TARGET_MIN } from './favoritesTypography';

interface MealTypeFormSelectProps {
  value: MealType;
  onChange: (value: MealType) => void;
  theme?: 'dark' | 'light';
  placement?: 'top' | 'bottom';
}

export const MealTypeFormSelect: React.FC<MealTypeFormSelectProps> = ({
  value,
  onChange,
  theme = 'dark',
  placement = 'bottom',
}) => {
  const isLight = theme === 'light';
  const [isOpen, setIsOpen] = useState(false);

  const options = MEAL_TYPES.map((type) => ({
    value: type,
    label: MEAL_TYPE_LABELS[type].label,
  }));

  return (
    <FavoritesDropdownMenu
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      options={options}
      selectedValue={value}
      onSelect={onChange}
      theme={theme}
      placement={placement}
      align="left"
      minWidth="min-w-full"
      trigger={
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3.5 py-2 sm:py-2.5 rounded-xl ${favoritesTypography.buttonText} transition-all flex items-center justify-between gap-1.5 border active:scale-[0.99] cursor-pointer shadow-2xs ${TOUCH_TARGET_MIN} ${
            isOpen
              ? isLight
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-white'
              : isLight
              ? 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300'
              : 'bg-[#121214] hover:bg-[#1a1a1e] text-white border-white/[0.1]'
          }`}
          title="Select meal category"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={`Category: ${MEAL_TYPE_LABELS[value].label}`}
        >
          <span className="truncate font-bold">{MEAL_TYPE_LABELS[value].label}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      }
    />
  );
};
