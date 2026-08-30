package com.project.NutritionTracker.service;

import com.project.NutritionTracker.enums.AiFeatureType;
import com.project.NutritionTracker.exception.AiQuotaExceededException;
import com.project.NutritionTracker.exception.NotFoundException;
import com.project.NutritionTracker.model.DailyAiUsage;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.DailyUsageRepository;
import com.project.NutritionTracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AiQuotaServiceTest {

    @Mock
    private DailyUsageRepository dailyUsageRepository;

    @Mock
    private UserRepository userRepository;

    private AiQuotaService quotaService;

    private final UUID sampleUserId = UUID.randomUUID();
    private User sampleUser;

    @BeforeEach
    void setUp() {
        quotaService = new AiQuotaService(dailyUsageRepository, userRepository);
        sampleUser = new User();
        sampleUser.setId(sampleUserId);
        sampleUser.setEmail("test@example.com");
    }

    @Test
    @DisplayName("saveQuota - First time today creates new usage record and increments")
    void saveQuota_FirstTimeToday_CreatesRecordAndIncrements() {
        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(dailyUsageRepository.findByUserIdAndUsageDate(sampleUserId, LocalDate.now())).thenReturn(Optional.empty());

        quotaService.saveQuota(sampleUserId, AiFeatureType.ENTRY_AI);

        ArgumentCaptor<DailyAiUsage> captor = ArgumentCaptor.forClass(DailyAiUsage.class);
        verify(dailyUsageRepository).save(captor.capture());

        DailyAiUsage saved = captor.getValue();
        assertEquals(1, saved.getEntriesUsed());
        assertEquals(0, saved.getGoalsUsed());
        assertEquals(0, saved.getFavoritesUsed());
        assertEquals(sampleUser, saved.getUser());
    }

    @Test
    @DisplayName("saveQuota - Under limit increments existing record")
    void saveQuota_UnderLimit_IncrementsExistingRecord() {
        DailyAiUsage existing = new DailyAiUsage();
        existing.setUser(sampleUser);
        existing.setUsageDate(LocalDate.now());
        existing.setEntriesUsed(2);
        existing.setGoalsUsed(0);
        existing.setFavoritesUsed(1);

        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(dailyUsageRepository.findByUserIdAndUsageDate(sampleUserId, LocalDate.now())).thenReturn(Optional.of(existing));

        quotaService.saveQuota(sampleUserId, AiFeatureType.ENTRY_AI);

        verify(dailyUsageRepository).save(existing);
        assertEquals(3, existing.getEntriesUsed());
    }

    @Test
    @DisplayName("saveQuota - Goal limit exceeded throws AiQuotaExceededException")
    void saveQuota_GoalLimitExceeded_ThrowsException() {
        DailyAiUsage existing = new DailyAiUsage();
        existing.setUser(sampleUser);
        existing.setUsageDate(LocalDate.now());
        existing.setGoalsUsed(2);

        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(dailyUsageRepository.findByUserIdAndUsageDate(sampleUserId, LocalDate.now())).thenReturn(Optional.of(existing));

        assertThrows(AiQuotaExceededException.class, () -> quotaService.saveQuota(sampleUserId, AiFeatureType.GOAL_AI));
        verify(dailyUsageRepository, never()).save(any());
    }

    @Test
    @DisplayName("saveQuota - Entry limit exceeded throws AiQuotaExceededException")
    void saveQuota_EntryLimitExceeded_ThrowsException() {
        DailyAiUsage existing = new DailyAiUsage();
        existing.setUser(sampleUser);
        existing.setUsageDate(LocalDate.now());
        existing.setEntriesUsed(5);

        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(dailyUsageRepository.findByUserIdAndUsageDate(sampleUserId, LocalDate.now())).thenReturn(Optional.of(existing));

        assertThrows(AiQuotaExceededException.class, () -> quotaService.saveQuota(sampleUserId, AiFeatureType.ENTRY_AI));
        verify(dailyUsageRepository, never()).save(any());
    }

    @Test
    @DisplayName("saveQuota - Favorite limit exceeded throws AiQuotaExceededException")
    void saveQuota_FavoriteLimitExceeded_ThrowsException() {
        DailyAiUsage existing = new DailyAiUsage();
        existing.setUser(sampleUser);
        existing.setUsageDate(LocalDate.now());
        existing.setFavoritesUsed(3);

        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(dailyUsageRepository.findByUserIdAndUsageDate(sampleUserId, LocalDate.now())).thenReturn(Optional.of(existing));

        assertThrows(AiQuotaExceededException.class, () -> quotaService.saveQuota(sampleUserId, AiFeatureType.FAVORITE_AI));
        verify(dailyUsageRepository, never()).save(any());
    }

    @Test
    @DisplayName("saveQuota - User not found throws NotFoundException")
    void saveQuota_UserNotFound_ThrowsException() {
        when(userRepository.findById(sampleUserId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> quotaService.saveQuota(sampleUserId, AiFeatureType.ENTRY_AI));
        verify(dailyUsageRepository, never()).save(any());
    }
}
