package com.project.NutritionTracker.dto;

import com.project.NutritionTracker.enums.MealType;

public record AiMealResponseDTO (
    String mealName,
    Integer kcal,
    Double carbs,
    Double fat,
    Double protein,
    String confidenceNote,
    MealType mealType
)
{}
