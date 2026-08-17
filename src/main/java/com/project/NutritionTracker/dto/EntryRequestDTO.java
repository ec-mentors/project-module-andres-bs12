package com.project.NutritionTracker.dto;

public record EntryRequestDTO (
     String mealName,
     Integer kcal,
     Double carbs,
     Double fat,
     Double protein
)
{}

