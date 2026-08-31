package com.project.NutritionTracker.dto;

public record DailyProgressDTO(
        Integer remainingKcal,
        Double remainingCarbs,
        Double remainingFat,
        Double remainingProtein
) {
}

