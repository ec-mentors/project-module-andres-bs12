package com.project.NutritionTracker.dto;

// This is just a POJO

import lombok.*;

public record UserRequestDTO (
    String firstName,
    String lastName,
    String email,
    String googleId
    ) {}


