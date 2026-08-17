package com.project.NutritionTracker.enums;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum DietPreference {
    @JsonProperty("balanced")
    STANDARD_BALANCED,
    @JsonProperty("high_protein")
    HIGH_PROTEIN_FOCUSED,
    @JsonProperty("low_carb")
    LOW_CARB,
    @JsonProperty("plant_based")
    PLANT_FORWARD
}
