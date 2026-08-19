package com.project.NutritionTracker.dto;

import jakarta.validation.constraints.NotBlank;

public record AiMealTextRequestDTO (
        @NotBlank
        String description)
{}