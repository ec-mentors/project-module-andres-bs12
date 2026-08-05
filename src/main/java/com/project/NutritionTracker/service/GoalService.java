package com.project.NutritionTracker.service;

import com.project.NutritionTracker.dto.GoalRequestDTO;
import com.project.NutritionTracker.dto.GoalResponseDTO;
import com.project.NutritionTracker.exception.NotFoundException;
import com.project.NutritionTracker.mapper.GoalMapper;
import com.project.NutritionTracker.model.Goal;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.GoalRepository;
import com.project.NutritionTracker.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
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
    private final UserRepository uRepository;

    public GoalService(GoalMapper mapper, GoalRepository repository, UserRepository uRepository) {
        this.mapper = mapper;
        this.repository = repository;
        this.uRepository = uRepository;
    }


    @PreAuthorize("isAuthenticated() && #userId == principal.id")
    public GoalResponseDTO createGoal(GoalRequestDTO dto, UUID userId) {
        if (dto == null) {
            return null;
        }

        User user = uRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found with id: " + userId));
        Goal goal = mapper.toEntity(dto);

        goal.setUser(user);
        goal.setStartDate(LocalDate.now());

        return mapper.toResponseDTO(repository.save(goal));
    }

    @PreAuthorize("isAuthenticated() && @goalSecurity.isOwner(#id, principal)")
    public GoalResponseDTO updateGoal(UUID id, GoalRequestDTO dto) {
        Goal goal = repository.findById(id).orElseThrow(() -> new NotFoundException("Goal not found"));
        // Doesn't update the user
        goal.setCarbs(dto.carbs());
        goal.setFat(dto.fat());
        goal.setKcal(dto.kcal());
        goal.setStartDate(LocalDate.now());
        goal.setProtein(dto.protein());

        return mapper.toResponseDTO(repository.save(goal));
    }

    @PreAuthorize("#userId == principal.id")
    public GoalResponseDTO getGoalByUserAndDate(UUID userId, LocalDate date) {
        if (userId == null) {
            return null;
        }


        User user = uRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found with id: " + userId));

        Goal goal = repository.findByUserAndStartDate(user, date).orElseThrow(() -> new NotFoundException("Goal not found"));

        return mapper.toResponseDTO(goal);
    }

    @PreAuthorize("#userId == principal.id")
    public List<GoalResponseDTO> findAllGoalsByUser(UUID userId) {

        if (userId == null) {
            return null;
        }

        User user = uRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found with id: " + userId));

        return repository.findAllByUser(user)
                .stream()
                .map(mapper::toResponseDTO)
                .toList();
    }

}
