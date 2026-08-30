export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface FavoriteMeal {
  id: string;
  mealName: string;
  mealType: MealType;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt?: string;
}

// Matches Java FavoriteMealRequestDTO
export interface CreateFavoriteMealPayload {
  mealName: string;
  mealType: MealType;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}
