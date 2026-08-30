package com.project.NutritionTracker.security;

import com.project.NutritionTracker.repository.FavoriteMealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class FavoriteMealSecurity {

    private final FavoriteMealRepository favoriteMealRepository;

    public boolean isOwner(UUID fMealId, UserPrincipal principal) {
        if (fMealId == null || principal == null || principal.getId() == null) return false;

        return favoriteMealRepository.findById(fMealId)
                .map(meal -> meal.getUser() != null &&
                        meal.getUser().getId().equals(principal.getId()))
                .orElse(false);
    }
}

