package com.project.NutritionTracker.dto;


import java.time.LocalDate;

public record AIQuotaStatusResponseDTO(
        LocalDate usage_date,
        Integer goalsUsed,
        Integer favoritesUsed,
        int entries_used
) {
}
