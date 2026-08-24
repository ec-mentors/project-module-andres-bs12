package com.project.NutritionTracker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.project.NutritionTracker.enums.ActivityLevel;
import com.project.NutritionTracker.enums.DietPreference;
import com.project.NutritionTracker.enums.Gender;
import com.project.NutritionTracker.enums.PrimaryObjective;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AiGoalRequestDTO(
        @NotNull(message = "primary objective is required")
        PrimaryObjective primaryObjective,

        @NotNull(message = "Gender is required")
        Gender gender,

        @NotNull(message = "Age is required")
        @Min(value = 0, message = "Age can't be negative")
        Integer age,

        @NotNull(message = "Height is required")
        @Min(value = 0, message = "Height cannot be negative")
        Integer heightCm,

        @NotNull(message = "Weight is required")
        @Min(value = 0, message = "Weight cannot be negative")
        Integer currentWeightKg,

        @NotNull(message = "Weight is required")
        @Min(value = 0, message = "Weight cannot be negative")
        Integer targetWeightKg,

        @JsonProperty("activityLevel")
        @NotNull(message = "Daily activity level is required")
        ActivityLevel dailyActivityLevel,

        @JsonProperty("dietPreference")
        @NotNull(message = "Dietary preference activity level is required")
        DietPreference dietaryPreference
) {
}
