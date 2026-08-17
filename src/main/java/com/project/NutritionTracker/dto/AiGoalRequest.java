package com.project.NutritionTracker.dto;

public record AiGoalRequest (
    String objective,
    String gender,
    Integer age,
    Integer height,
    Integer weight,
    Integer targetWeight,
    String dailyActivity,
    String dietaryPreference
) {}
