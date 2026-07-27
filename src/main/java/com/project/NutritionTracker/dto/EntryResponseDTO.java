package com.project.NutritionTracker.dto;

import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EntryResponseDTO {
    private UUID id;
    private String mealName;
    private String source;
    private LocalDateTime createdOn;
    private Integer kcal;
    private Double carbs;
    private Double fat;
    private Double protein;
}
