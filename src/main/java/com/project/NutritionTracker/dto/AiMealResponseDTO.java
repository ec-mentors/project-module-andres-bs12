package com.project.NutritionTracker.dto;

import java.time.LocalDateTime;

public record AiMealResponseDTO (
    String mealName,
    String source,
    Integer kcal,
    Double carbs,
    Double fat,
    Double protein,
    String confidenceNote
)
{}
