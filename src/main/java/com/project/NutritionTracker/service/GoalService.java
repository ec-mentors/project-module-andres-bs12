package com.project.NutritionTracker.service;

import com.project.NutritionTracker.dto.GoalRequestDTO;
import com.project.NutritionTracker.dto.GoalResponseDTO;
import com.project.NutritionTracker.exception.NotFoundException;
import com.project.NutritionTracker.mapper.GoalMapper;
import com.project.NutritionTracker.model.Goal;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.GoalRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;


@Service
public class GoalService {
    private final GoalMapper mapper;
    private final GoalRepository repository;

    public GoalService(GoalMapper mapper, GoalRepository repository) {
        this.mapper = mapper;
        this.repository = repository;
    }


    public GoalResponseDTO createGoal(GoalRequestDTO dto, User user) {
        if (dto == null) {
            return null;
        }

        Goal goal = new Goal();

        goal.setCarbs(dto.getCarbs());
        goal.setProtein(dto.getProtein());
        goal.setStartDate(LocalDate.now());
        goal.setKcal(dto.getKcal());
        goal.setFat(dto.getFat());
        goal.setUser(user);

        return mapper.toResponseDTO(repository.save(goal));
    }


    public GoalResponseDTO updateGoal(UUID id, GoalRequestDTO dto, User user) {
        Goal goal = repository.findById(id).orElseThrow(() -> new NotFoundException("Goal not found"));

        goal.setCarbs(dto.getCarbs());
        goal.setFat(dto.getFat());
        goal.setKcal(dto.getKcal());
        goal.setStartDate(LocalDate.now());
        goal.setProtein(dto.getProtein());

        return mapper.toResponseDTO(repository.save(goal));
    }

    public GoalResponseDTO getGoalByUserAndDate(User user, LocalDate date) {
        if (user == null) {
            return null;
        }

        Goal goal = repository.findByUserAndStartDate(user, date).orElseThrow(() -> new NotFoundException("Goal not found"));

        return mapper.toResponseDTO(goal);
    }

    public List<GoalResponseDTO> findAllGoalsByUser(User user) {

        if (user == null) {
            return null;
        }
        return repository.findAllByUser(user)
                .stream()
                .map(mapper::toResponseDTO)
                .toList();
    }

}
