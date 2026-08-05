package com.project.NutritionTracker.security;

import com.project.NutritionTracker.repository.EntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("entrySecurity")
@RequiredArgsConstructor
public class EntrySecurity {

    private final EntryRepository entryRepository;

    // verifies if the user that makes the request is the owner of the  specific `entry`
    public boolean isOwner(UUID entryId, UserPrincipal principal) {

        if (entryId == null || principal == null || principal.getId() == null) return false;

        return entryRepository.findById(entryId)
                .map(entry -> entry.getUser() != null &&
                        entry.getUser().getId().equals(principal.getId()))
                .orElse(false);
    }
}
