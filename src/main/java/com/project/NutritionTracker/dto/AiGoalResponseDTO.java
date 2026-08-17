package com.project.NutritionTracker.dto;

public record AiGoalResponseDTO(
        Integer kcal,
        Double carbs,
        Double fat,
        Double protein,
        String rationale
){}

