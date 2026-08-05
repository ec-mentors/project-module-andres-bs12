package com.project.NutritionTracker.security;


import com.project.NutritionTracker.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component ("goalSecurity")
@RequiredArgsConstructor
public class GoalSecurity {

    private final GoalRepository goalRepository;

    // Verifies if UserPrincipal authenticated, is the owner of the specific goal
    public boolean isOwner(UUID entryId, UserPrincipal principal) {

        if (entryId == null || principal == null || principal.getId() == null) return false;

        return goalRepository.findById(entryId)
                .map(goal -> goal.getUser() != null &&
                        goal.getUser().getId().equals(principal.getId()))
                .orElse(false);
    }
}

