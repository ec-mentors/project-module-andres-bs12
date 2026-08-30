// 1. Matches Spring Boot EntryResponseDTO
export interface MealEntry {
  id?: string;
  mealName: string;
  source?: string;
  mealType?: string;
  createdOn?: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

// 2. Matches Spring Boot EntryRequestDTO (createdOn is server-only)
export interface CreateMealEntryPayload {
  mealName: string;
  source?: string;
  mealType?: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

// 3. Matches Spring Boot GoalResponseDTO
export interface NutritionGoal {
  id?: string;
  startDate?: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  rationale?: string;
}

// 4. Matches Spring Boot GoalRequestDTO
export interface SetGoalPayload {
  startDate?: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

// 5. Matches Daily Summary Math
export interface DailySummary {
  consumedKcal: number;
  consumedProtein: number;
  consumedFat: number;
  consumedCarbs: number;
}