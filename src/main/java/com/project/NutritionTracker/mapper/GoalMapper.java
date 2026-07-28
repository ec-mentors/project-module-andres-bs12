package com.project.NutritionTracker.mapper;

import com.project.NutritionTracker.dto.GoalRequestDTO;
import com.project.NutritionTracker.dto.GoalResponseDTO;
import com.project.NutritionTracker.model.Goal;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class GoalMapper {

    public Goal toEntity(GoalRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        Goal goal = new Goal();

        goal.setCarbs(dto.getCarbs());
        goal.setFat(dto.getFat());
        goal.setKcal(dto.getKcal());
        goal.setProtein(dto.getProtein());
        goal.setStartDate(LocalDate.now());
        return goal;
    }

    public GoalResponseDTO toResponseDTO(Goal goal) {
        if (goal == null) {
            return null;
        }

        GoalResponseDTO dto = new GoalResponseDTO();

        dto.setId(goal.getId());
        dto.setCarbs(goal.getCarbs());
        dto.setFat(goal.getFat());
        dto.setKcal(goal.getKcal());
        dto.setProtein(goal.getProtein());
        dto.setStartDate(goal.getStartDate());
        return dto;
    }
}
