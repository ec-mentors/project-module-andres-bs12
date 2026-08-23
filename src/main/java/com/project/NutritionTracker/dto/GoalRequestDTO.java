package com.project.NutritionTracker.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record GoalRequestDTO(
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
        Double protein
) {
}
