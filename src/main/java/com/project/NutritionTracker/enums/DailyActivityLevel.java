package com.project.NutritionTracker.enums;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum DailyActivityLevel {
    @JsonProperty("sedentary")
    SEDENTARY,
    @JsonProperty("light")
    LIGHT,
    @JsonProperty("moderate")
    MODERATELY_ACTIVE,
    @JsonProperty("very_active")
    VERY_ACTIVE
}
