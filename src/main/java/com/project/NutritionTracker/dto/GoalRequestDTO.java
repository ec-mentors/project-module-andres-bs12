package com.project.NutritionTracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoalRequestDTO {
    private Integer kcal;
    private Double carbs;
    private Double fat;
    private Double protein;
}
