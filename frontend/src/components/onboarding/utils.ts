import type { AiOnboardingState } from './types';
import type { NutritionGoal } from '../../types/nutrition';

/**
 * Calculates scientifically grounded daily calorie & macro goals
 * using the Mifflin-St Jeor BMR equation + TDEE activity factor + goal adjustments.
 */
export function calculateAiNutritionGoal(profile: AiOnboardingState): NutritionGoal {
  const gender = profile.gender || 'male';
  const age = Number(profile.age) || 28;
  const currentWeightKg = Number(profile.currentWeightKg) || 75;
  const heightCm = Number(profile.heightCm) || 175;
  const activityLevel = profile.activityLevel || 'moderate';
  const objective = profile.objective || 'fat_loss';
  const dietPreference = profile.dietPreference || 'balanced';

  // 1. Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor
  let bmr = 10 * currentWeightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr -= 78; // average offset
  }

  // 2. Physical Activity Factor (TDEE multiplier)
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
  };
  const multiplier = activityMultipliers[activityLevel] || 1.375;
  const maintenanceTdee = bmr * multiplier;

  // 3. Goal Adjustment for Calories
  let targetCalories = maintenanceTdee;
  if (objective === 'fat_loss') {
    targetCalories = maintenanceTdee * 0.8; // 20% caloric deficit
  } else if (objective === 'muscle_gain') {
    targetCalories = maintenanceTdee * 1.12; // 12% surplus
  } else if (objective === 'athletic_performance') {
    targetCalories = maintenanceTdee * 1.05; // 5% surplus for recovery
  }

  // Round calories to nearest 25 kcal
  const finalKcal = Math.max(1200, Math.round(targetCalories / 25) * 25);

  // 4. Macro Splits based on Objective & Diet Preference
  let proteinPerKg = 1.8;
  if (objective === 'fat_loss') proteinPerKg = 2.2;
  if (objective === 'muscle_gain') proteinPerKg = 2.0;
  if (objective === 'athletic_performance') proteinPerKg = 2.0;

  if (dietPreference === 'high_protein') {
    proteinPerKg += 0.3;
  }

  let targetProtein = Math.round(currentWeightKg * proteinPerKg);
  // Cap protein kcal to max 40% of total calories
  if (targetProtein * 4 > finalKcal * 0.4) {
    targetProtein = Math.round((finalKcal * 0.35) / 4);
  }

  let targetFat: number;
  let targetCarbs: number;

  if (dietPreference === 'low_carb') {
    targetFat = Math.round((finalKcal * 0.45) / 9);
    targetCarbs = Math.round((finalKcal - (targetProtein * 4 + targetFat * 9)) / 4);
  } else if (dietPreference === 'plant_based') {
    targetFat = Math.round((finalKcal * 0.25) / 9);
    targetCarbs = Math.round((finalKcal - (targetProtein * 4 + targetFat * 9)) / 4);
  } else {
    targetFat = Math.round((finalKcal * 0.28) / 9);
    targetCarbs = Math.round((finalKcal - (targetProtein * 4 + targetFat * 9)) / 4);
  }

  return {
    kcal: Math.max(1000, finalKcal),
    protein: Math.max(40, targetProtein),
    carbs: Math.max(20, targetCarbs),
    fat: Math.max(20, targetFat),
  };
}
