export interface MealEntry {
    id?: string;
    mealName: string;
    source?: string;
    createdOn?: string;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface NutritionalGoal {
    id?: string;
    startDate?: string;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
}


export interface DailySummary {
  consumedKcal: number;
  consumedProtein: number;
  consumedCarbs: number;
  consumedFat: number;
}