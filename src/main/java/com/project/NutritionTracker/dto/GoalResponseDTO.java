package com.project.NutritionTracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoalResponseDTO {
    private UUID id;
    private LocalDate startDate;
    private Integer kcal;
    private Double carbs;
    private Double fat;
    private Double protein;
}
