package com.project.NutritionTracker.util;

import com.project.NutritionTracker.dto.DailyProgressDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class TelegramMessageFormatterTest {

    @Test
    @DisplayName("formatDailyProgress should format remaining calories and macros with emojis")
    void formatDailyProgress_ShouldFormatCorrectly() {
        DailyProgressDTO dto = new DailyProgressDTO(1793, 2.5, 139.6, 0.0);

        String result = TelegramMessageFormatter.formatDailyProgress(dto);

        assertNotNull(result);
        assertTrue(result.contains("📊 Today's Remaining:"));
        assertTrue(result.contains("🎯 1793 kcal left"));
        assertTrue(result.contains("0.0g Protein"));
        assertTrue(result.contains("2.5g Carbs"));
        assertTrue(result.contains("139.6g Fat"));
    }
}
