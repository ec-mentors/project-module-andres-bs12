package com.project.NutritionTracker.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponseDTO (
    String firstName,
    UUID id,
    String lastName,
    String email,
    LocalDateTime createdAt,
    String googleId
) {}

