package com.project.NutritionTracker.dto;

public record UserRequestDTO (
    String firstName,
    String lastName,
    String email,
    String googleId
    ) {}


