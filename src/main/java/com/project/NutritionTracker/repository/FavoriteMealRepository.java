package com.project.NutritionTracker.repository;

import com.project.NutritionTracker.model.FavoriteMeal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FavoriteMealRepository extends JpaRepository<FavoriteMeal, UUID> {
    void removeById(UUID userid);
}
