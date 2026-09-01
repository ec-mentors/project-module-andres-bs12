package com.project.NutritionTracker.dto;

public record AuthResponseDTO (
    UserResponseDTO userResponseDTO,
    String token
){}
