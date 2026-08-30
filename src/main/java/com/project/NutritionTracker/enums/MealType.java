package com.project.NutritionTracker.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public enum MealType {
    @JsonProperty("breakfast")
    BREAKFAST,
    @JsonProperty("lunch")
    LUNCH,
    @JsonProperty("snack")
    SNACK,
    @JsonProperty("dinner")
    DINNER;

    @JsonCreator
    public static MealType fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return MealType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}

