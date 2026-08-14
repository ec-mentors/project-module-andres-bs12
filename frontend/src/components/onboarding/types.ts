import type { NutritionGoal } from '../../types/nutrition';

export type OnboardingPath = 'ai' | 'manual';

export type PrimaryObjective = 
  | 'fat_loss'
  | 'muscle_gain'
  | 'maintenance'
  | 'athletic_performance';

export type ActivityLevel = 
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'very_active';

export type DietPreference = 
  | 'balanced'
  | 'high_protein'
  | 'low_carb'
  | 'plant_based';

export interface AiOnboardingState {
  objective: PrimaryObjective | null;
  gender: 'male' | 'female' | 'other' | null;
  age: number | '';
  currentWeightKg: number | '';
  targetWeightKg: number | '';
  heightCm: number | '';
  activityLevel: ActivityLevel | null;
  dietPreference: DietPreference | null;
}

export interface ManualOnboardingState {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  preset?: string;
}

export type OnboardingStep = 
  | 'choose-path'
  | 'ai-wizard'
  | 'goal-review'
  | 'manual-setup'
  | 'processing';

export interface OnboardingCompletionResult {
  path: OnboardingPath;
  goal: NutritionGoal;
}
