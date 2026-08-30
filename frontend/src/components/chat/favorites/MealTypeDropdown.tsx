import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { MealType } from '../../../types/favoriteMeal';
import { FavoritesDropdownMenu } from './FavoritesDropdownMenu';
import { MEAL_TYPE_LABELS, MEAL_TYPES, type MealTypeFilter } from './mealTypeUtils';
import { favoritesTypography, TOUCH_TARGET_BAR } from './favoritesTypography';

interface MealTypeDropdownProps {
  selectedFilter: MealTypeFilter;
  onFilterChange: (filter: MealTypeFilter) => void;
  currentMealType: MealType;
  theme?: 'dark' | 'light';
  placement?: 'top' | 'bottom';
}

export const MealTypeDropdown: React.FC<MealTypeDropdownProps> = ({
  selectedFilter,
  onFilterChange,
  currentMealType,
  theme = 'dark',
  placement = 'top',
}) => {
  const isLight = theme === 'light';
  const [isOpen, setIsOpen] = useState(false);

  const currentLabel =
    selectedFilter === 'AUTO'
      ? MEAL_TYPE_LABELS[currentMealType].label
      : selectedFilter === 'ALL'
      ? 'All Meals'
      : MEAL_TYPE_LABELS[selectedFilter].label;

  // Build options: AUTO at top, then individual categories (excluding current to avoid duplicate), then ALL
  const otherMealTypes = MEAL_TYPES.filter((type) => type !== currentMealType);

  const options: { value: MealTypeFilter; label: string; description?: string }[] = [
    {
      value: 'AUTO',
      label: MEAL_TYPE_LABELS[currentMealType].label,
      description: 'Auto (current time)',
    },
    ...otherMealTypes.map((type) => ({
      value: type as MealTypeFilter,
      label: MEAL_TYPE_LABELS[type].label,
    })),
    {
      value: 'ALL',
      label: 'All Meals',
    },
  ];

  return (
    <FavoritesDropdownMenu
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      options={options}
      selectedValue={selectedFilter}
      onSelect={onFilterChange}
      theme={theme}
      placement={placement}
      align="left"
      minWidth="min-w-[190px]"
      trigger={
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-2.5 sm:px-3 py-1.5 sm:py-2.5 rounded-xl ${favoritesTypography.barButtonText} transition-all flex items-center gap-1 sm:gap-1.5 border active:scale-95 cursor-pointer shadow-2xs ${TOUCH_TARGET_BAR} ${
            isOpen
              ? isLight
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-white'
              : isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
              : 'bg-[#1c1c20] hover:bg-[#25252b] text-white border-white/[0.12]'
          }`}
          title="Change Meal Category"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="truncate max-w-[130px] sm:max-w-none">{currentLabel}</span>
          <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      }
    />
  );
};
