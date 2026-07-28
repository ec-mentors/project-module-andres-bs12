package com.project.NutritionTracker.repository;

import com.project.NutritionTracker.model.Goal;
import com.project.NutritionTracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Locale;
import java.util.UUID;

public interface GoalRepository extends JpaRepository<Goal, UUID> {

    // To find a goal by user and date
    public Goal findUserAndStartDate(User user, Locale startDare);


}
