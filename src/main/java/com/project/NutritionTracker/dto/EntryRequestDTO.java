package com.project.NutritionTracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


public record EntryRequestDTO (
     String mealName,
     Integer kcal,
     Double carbs,
     Double fat,
     Double protein
)
{}

