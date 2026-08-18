package com.project.NutritionTracker.enums;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum PrimaryObjective {
    @JsonProperty("fat_loss")
    FAT_LOSS,
    @JsonProperty("muscle_gain")
    MUSCLE_GROWTH,
    @JsonProperty("maintenance")
    MAINTENANCE,
    @JsonProperty("athletic_performance")
    ATHLETIC_PERFORMANCE
}
