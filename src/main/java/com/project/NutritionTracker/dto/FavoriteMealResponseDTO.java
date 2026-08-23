package com.project.NutritionTracker.dto;

import com.project.NutritionTracker.enums.MealType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record FavoriteMealResponseDTO(
        UUID id,
        String mealName,
        Integer kcal,
        Double carbs,
        Double fat,
        Double protein,
        MealType mealType,
        LocalDate createdAt
){

}
