package com.project.NutritionTracker.dto;

import java.time.LocalDate;
import java.util.UUID;

public record GoalResponseDTO (
    UUID id,
    LocalDate startDate,
    Integer kcal,
    Double carbs,
    Double fat,
    Double protein
) {}
