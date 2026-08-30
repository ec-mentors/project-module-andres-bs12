package com.project.NutritionTracker.service;

import com.project.NutritionTracker.enums.AiFeatureType;
import com.project.NutritionTracker.exception.AiQuotaExceededException;
import com.project.NutritionTracker.exception.NotFoundException;
import com.project.NutritionTracker.model.DailyAiUsage;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.DailyUsageRepository;
import com.project.NutritionTracker.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;


@Service
public class AiQuotaService {

    private final DailyUsageRepository repository;
    private final UserRepository uRepository;
    private Integer maxGoals = 2;
    private Integer maxFavorites = 3;
    private Integer maxEntries = 5;

    public AiQuotaService(DailyUsageRepository repository, UserRepository uRepository) {
        this.repository = repository;
        this.uRepository = uRepository;
    }

    @PreAuthorize("isAuthenticated() && #userId == principal.id")
    public void saveQuota(UUID userId, AiFeatureType aifeatureType) {

        User user = uRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        DailyAiUsage dailyAiUsage;
        if (repository.findByUserIdAndUsageDate(userId, LocalDate.now()).isPresent()) {
            dailyAiUsage = repository.findByUserIdAndUsageDate(userId, LocalDate.now()).get();
        } else {
            dailyAiUsage = new DailyAiUsage();
            dailyAiUsage.setEntriesUsed(0);
            dailyAiUsage.setFavoritesUsed(0);
            dailyAiUsage.setGoalsUsed(0);
            dailyAiUsage.setUser(user);
            dailyAiUsage.setUsageDate(LocalDate.now());
        }

        switch (aifeatureType) {
            case GOAL_AI -> {
                int actualCounter = dailyAiUsage.getGoalsUsed();

                if (actualCounter < maxGoals) {
                    dailyAiUsage.setGoalsUsed(actualCounter + 1);
                } else {
                    throw new AiQuotaExceededException("AI Goal Quota exceed for today wait until tomorrow");
                }
            }
            case ENTRY_AI -> {
                int actualCounter = dailyAiUsage.getEntriesUsed();

                if (actualCounter < maxEntries) {
                    dailyAiUsage.setEntriesUsed(actualCounter + 1);
                } else {
                    throw new AiQuotaExceededException("AI Entry Quota exceed for today wait until tomorrow");
                }
            }
            case FAVORITE_AI -> {
                int actualCounter = dailyAiUsage.getFavoritesUsed();

                if (actualCounter < maxFavorites) {
                    dailyAiUsage.setFavoritesUsed(actualCounter + 1);
                } else {
                    throw new AiQuotaExceededException("AI Favorites Quota exceed for today wait until tomorrow");
                }
            }
        }
        repository.save(dailyAiUsage);

    }

}
