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
    Integer height,
    Integer weight,
    Integer targetWeight,
    DailyActivityLevel dailyActivityLevel,
        DietPreference dietaryPreference
) {}
