import React, { useState, useRef } from 'react';
import { Settings, Plus } from 'lucide-react';
import type { FavoriteMeal, CreateFavoriteMealPayload, MealType } from '../../types/favoriteMeal';
import { ManageFavoritesModal } from './ManageFavoritesModal';
import {
  MealTypeDropdown,
  getCurrentTimeMealType,
  getEffectiveMealFilter,
  favoritesTypography,
  TOUCH_TARGET_BAR,
  type MealTypeFilter,
} from './favorites';

interface FavoriteMealsMockupBarProps {
  userId: string;
  onSelectFavorite: (meal: FavoriteMeal) => void;
  favorites?: FavoriteMeal[];
  onAddFavorite?: (payload: CreateFavoriteMealPayload) => void;
  onUpdateFavorite?: (id: string, payload: CreateFavoriteMealPayload) => void;
  onDeleteFavorite?: (id: string) => void;
  theme?: 'dark' | 'light';
}

export const FavoriteMealsMockupBar: React.FC<FavoriteMealsMockupBarProps> = ({
  userId,
  onSelectFavorite,
  favorites: externalFavorites = [],
  onAddFavorite: externalAddFavorite,
  onUpdateFavorite: externalUpdateFavorite,
  onDeleteFavorite: externalDeleteFavorite,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  const [currentMealType] = useState<MealType>(getCurrentTimeMealType());
  const [selectedMealTypeFilter, setSelectedMealTypeFilter] = useState<MealTypeFilter>('AUTO');
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [hoveredMeal, setHoveredMeal] = useState<{ meal: FavoriteMeal; x: number } | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  const favorites = externalFavorites;
  const effectiveFilter = getEffectiveMealFilter(selectedMealTypeFilter, currentMealType);

  const displayedFavorites = favorites.filter((fav) =>
    effectiveFilter === 'ALL'
      ? true
      : String(fav.mealType || '').toUpperCase() === String(effectiveFilter || '').toUpperCase()
  );

  const handleAddFavorite = (payload: CreateFavoriteMealPayload) => {
    externalAddFavorite?.(payload);
  };

  const handleUpdateFavorite = (id: string, payload: CreateFavoriteMealPayload) => {
    externalUpdateFavorite?.(id, payload);
  };

  const handleDeleteFavorite = (id: string) => {
    externalDeleteFavorite?.(id);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 mb-2 select-none animate-in fade-in duration-300">
      <div
        ref={barRef}
        className={`p-1.5 sm:p-2 rounded-2xl border flex items-center gap-1.5 sm:gap-2 shadow-sm transition-all relative ${
          isLight
            ? 'bg-white/90 border-slate-200/90'
            : 'bg-[#121214]/90 border-white/[0.08]'
        }`}
      >
        {/* Hover macro tooltip */}
        {hoveredMeal && (
          <div
            style={{ left: `${hoveredMeal.x}px` }}
            className={`absolute bottom-full mb-2.5 -translate-x-1/2 pointer-events-none z-50 animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap shadow-2xl backdrop-blur-xl px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-semibold tracking-tight select-none ${
              isLight
                ? 'bg-white/98 border-slate-200 text-slate-900 shadow-slate-900/15'
                : 'bg-[#141417]/98 border-white/[0.14] text-white shadow-black/90'
            }`}
          >
            <span className="font-bold text-orange-500">{hoveredMeal.meal.kcal} kcal</span>
            <span className={isLight ? 'text-slate-300' : 'text-white/20'}>·</span>
            <span className="text-violet-400">PRO {hoveredMeal.meal.protein}g</span>
            <span className="text-amber-400">CAR {hoveredMeal.meal.carbs}g</span>
            <span className="text-cyan-400">FAT {hoveredMeal.meal.fat}g</span>
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent ${
                isLight ? 'border-t-white' : 'border-t-[#141417]'
              }`}
            />
          </div>
        )}

        {/* Meal category dropdown */}
        <MealTypeDropdown
          selectedFilter={selectedMealTypeFilter}
          onFilterChange={setSelectedMealTypeFilter}
          currentMealType={currentMealType}
          theme={theme}
          placement="top"
        />

        {/* Divider */}
        <div className={`h-5 sm:h-6 w-px shrink-0 self-center ${isLight ? 'bg-slate-200' : 'bg-white/[0.1]'}`} />

        {/* Horizontal pills scroll */}
        <div
          onScroll={() => setHoveredMeal(null)}
          className="flex-1 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar min-w-0"
        >
          {displayedFavorites.map((meal) => (
            <button
              key={meal.id}
              type="button"
              onClick={() => {
                setHoveredMeal(null);
                onSelectFavorite(meal);
              }}
              onMouseEnter={(e) => {
                if (barRef.current) {
                  const pillRect = e.currentTarget.getBoundingClientRect();
                  const barRect = barRef.current.getBoundingClientRect();
                  setHoveredMeal({
                    meal,
                    x: pillRect.left - barRect.left + pillRect.width / 2,
                  });
                }
              }}
              onMouseLeave={() => setHoveredMeal(null)}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2.5 rounded-xl ${favoritesTypography.barButtonText} transition-all shrink-0 flex items-center border active:scale-95 cursor-pointer ${TOUCH_TARGET_BAR} ${
                isLight
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 hover:border-slate-300 shadow-2xs'
                  : 'bg-[#18181b] hover:bg-[#202024] text-zinc-200 hover:text-white border-white/[0.08] hover:border-white/[0.16]'
              }`}
              title={`1-Tap Log ${meal.mealName}`}
            >
              <span>{meal.mealName}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => setIsManageModalOpen(true)}
            className={`px-2.5 sm:px-3 py-1.5 sm:py-2.5 rounded-xl ${favoritesTypography.barButtonText} transition-all shrink-0 flex items-center gap-1 border border-dashed active:scale-95 cursor-pointer ${TOUCH_TARGET_BAR} ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-300'
                : 'bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white border-white/[0.15]'
            }`}
            title="Create new favorite"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Add</span>
          </button>
        </div>

        {/* Settings button — vertically centered with bar items */}
        <button
          type="button"
          onClick={() => setIsManageModalOpen(true)}
          className={`p-1.5 sm:px-3.5 sm:py-2.5 rounded-xl ${favoritesTypography.barButtonText} transition-all shrink-0 flex items-center justify-center gap-1.5 border shadow-2xs active:scale-95 cursor-pointer self-center min-w-[36px] sm:min-w-[44px] ${TOUCH_TARGET_BAR} ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              : 'bg-[#1e1e24] hover:bg-[#282830] text-zinc-200 hover:text-white border-white/[0.12]'
          }`}
          title="Settings / Manage Favorite Meals"
        >
          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>

      <ManageFavoritesModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        userId={userId}
        favorites={favorites}
        onAddFavorite={handleAddFavorite}
        onUpdateFavorite={handleUpdateFavorite}
        onDeleteFavorite={handleDeleteFavorite}
        theme={theme}
      />
    </div>
  );
};
