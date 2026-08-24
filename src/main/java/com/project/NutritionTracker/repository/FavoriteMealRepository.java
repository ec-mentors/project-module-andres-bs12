package com.project.NutritionTracker.repository;

import com.project.NutritionTracker.dto.FavoriteMealResponseDTO;
import com.project.NutritionTracker.model.FavoriteMeal;
import com.project.NutritionTracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FavoriteMealRepository extends JpaRepository<FavoriteMeal, UUID> {
    void removeById(UUID userid);

    List<FavoriteMeal> findAllByUser(User user);

}
