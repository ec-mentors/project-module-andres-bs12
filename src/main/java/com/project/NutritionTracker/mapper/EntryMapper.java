package com.project.NutritionTracker.mapper;

import com.project.NutritionTracker.dto.EntryRequestDTO;
import com.project.NutritionTracker.dto.EntryResponseDTO;
import com.project.NutritionTracker.model.Entry;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component // This is a spring component, now SSpring manage it.
public class EntryMapper {

    // Convert DTO input -> entity Entry
    public Entry toEntity(EntryRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        Entry entry = new Entry();

        entry.setCarbs(dto.getCarbs());
        entry.setFat(dto.getFat());
        entry.setKcal(dto.getKcal());
        entry.setProtein(dto.getProtein());
        entry.setMealName(dto.getMealName());
        entry.setCreatedOn(LocalDateTime.now());
        return entry;
    }

    // Convert entry response to safe returnable dto
    public EntryResponseDTO toResponseDTO(Entry entry) {
        if (entry == null) {
            return null;
        }

        EntryResponseDTO dto = new EntryResponseDTO();

        dto.setId(entry.getId());
        dto.setCarbs(entry.getCarbs());
        dto.setKcal(entry.getKcal());
        dto.setFat(entry.getFat());
        dto.setProtein(entry.getProtein());
        dto.setMealName(entry.getMealName());
        dto.setCreatedOn(entry.getCreatedOn());
        dto.setSource(entry.getSource());

        return dto;
    }
}
