package com.project.NutritionTracker.dto;

public record AiMealResponseDTO (
    String mealName,
    Integer kcal,
    Double carbs,
    Double fat,
    Double protein,
    String confidenceNote
)
{}
