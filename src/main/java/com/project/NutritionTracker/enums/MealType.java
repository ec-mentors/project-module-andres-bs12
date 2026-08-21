package com.project.NutritionTracker.enums;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum MealType {
    @JsonProperty("breakfast")
    BREAKFAST,
    @JsonProperty("lunch")
    LUNCH,
    @JsonProperty("snack")
    SNACK,
    @JsonProperty("dinner")
    DINNER
}
