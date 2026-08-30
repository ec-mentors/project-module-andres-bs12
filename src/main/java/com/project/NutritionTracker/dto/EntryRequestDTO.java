package com.project.NutritionTracker.dto;

import com.project.NutritionTracker.enums.MealType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EntryRequestDTO(
        @NotBlank(message = "Meal name cannot be blank")
        String mealName,

        @NotNull(message = "Calories are required")
        @Min(value = 0, message = "Calories cannot be negative")
        Integer kcal,

        @NotNull(message = "Carbs are required")
        @Min(value = 0, message = "Carbs cannot be negative")
        Double carbs,

        @NotNull(message = "Fat is required")
        @Min(value = 0, message = "Fat cannot be negative")
        Double fat,

        @NotNull(message = "Protein is required")
        @Min(value = 0, message = "Protein cannot be negative")
        Double protein,

        @NotNull(message = "MealType is required")
        MealType mealType
) {
}
