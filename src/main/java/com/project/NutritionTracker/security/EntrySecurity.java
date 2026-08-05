package com.project.NutritionTracker.security;

import com.project.NutritionTracker.model.Entry;
import com.project.NutritionTracker.repository.EntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component("entrySecurity")
@RequiredArgsConstructor
public class EntrySecurity {

    private final EntryRepository entryRepository;

    // verifies if the user that makes the request is the owner of the  specific `entry`
    public boolean isOwner(UUID entryId, UUID requestingUserId) {

        if (entryId == null || requestingUserId == null) return false;

        return entryRepository.findById(entryId)
                .map(entry -> entry.getUser() != null &&
                        requestingUserId.equals(entry.getUser().getId()))
                .orElse(false);
    }
}
