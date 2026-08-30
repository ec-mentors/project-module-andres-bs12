import type { MealType } from '../../../types/favoriteMeal';

export const MEAL_TYPE_LABELS: Record<MealType, { label: string }> = {
  BREAKFAST: { label: 'Breakfast' },
  LUNCH: { label: 'Lunch' },
  DINNER: { label: 'Dinner' },
  SNACK: { label: 'Snack' },
};

export const MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

export const getCurrentTimeMealType = (): MealType => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'BREAKFAST';
  if (hour >= 12 && hour < 17) return 'LUNCH';
  if (hour >= 17 && hour < 22) return 'DINNER';
  return 'SNACK';
};

export type MealTypeFilter = 'AUTO' | 'ALL' | MealType;

export const getEffectiveMealFilter = (filter: MealTypeFilter, currentMealType: MealType): MealType | 'ALL' => {
  if (filter === 'AUTO') return currentMealType;
  return filter;
};
