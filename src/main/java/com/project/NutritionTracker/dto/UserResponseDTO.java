package com.project.NutritionTracker.dto;

import java.time.LocalDateTime;
import java.util.UUID;

// Record is a container of immutable data
// create constructor with all parameters
// create getters .kcal...
// generate methods
public record UserResponseDTO (
    String firstName,
    UUID id,
    String lastName,
    String email,
    LocalDateTime createdAt,
    String googleId,
    Long telegramChatId
) {}

