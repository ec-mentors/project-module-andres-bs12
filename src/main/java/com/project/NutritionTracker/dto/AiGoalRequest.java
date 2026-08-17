package com.project.NutritionTracker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.project.NutritionTracker.enums.DailyActivityLevel;
import com.project.NutritionTracker.enums.DietPreference;
import com.project.NutritionTracker.enums.Gender;
import com.project.NutritionTracker.enums.PrimaryObjective;

public record AiGoalRequest (
        PrimaryObjective primaryObjective,
    Gender gender,
    Integer age,
    Integer heightCm,
    Integer currentWeightKg,
    Integer targetWeightKg,
    DailyActivityLevel dailyActivityLevel,
        DietPreference dietaryPreference
) {}
