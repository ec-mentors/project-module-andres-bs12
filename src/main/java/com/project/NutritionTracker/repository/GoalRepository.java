package com.project.NutritionTracker.repository;

import com.project.NutritionTracker.dto.GoalResponseDTO;
import com.project.NutritionTracker.model.Goal;
import com.project.NutritionTracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GoalRepository extends JpaRepository<Goal, UUID> {

    // To find a goal by user and date
    Optional<Goal> findByUserAndStartDate(User user, LocalDate startDare);

    List<Goal> findAllByUser(User user);

    Optional<Goal> findFirstByUserOrderByStartDateDesc(User user);
}
