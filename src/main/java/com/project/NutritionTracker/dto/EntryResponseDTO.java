package com.project.NutritionTracker.dto;


import com.project.NutritionTracker.enums.MealType;

import java.time.LocalDateTime;
import java.util.UUID;

public record EntryResponseDTO (
    UUID id,
    String mealName,
    String source,
    LocalDateTime createdOn,
    Integer kcal,
    Double carbs,
    Double fat,
    Double protein,
    MealType mealType
    )
{}
