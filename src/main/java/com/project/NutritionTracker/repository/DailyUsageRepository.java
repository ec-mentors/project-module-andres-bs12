package com.project.NutritionTracker.repository;

import com.project.NutritionTracker.model.DailyAiUsage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public  interface DailyUsageRepository extends JpaRepository<DailyAiUsage, UUID> {

    Optional<DailyAiUsage> findByUserIdAndUsageDate(UUID uuid, LocalDate usageDate);
}
