package com.project.NutritionTracker.util;

import com.project.NutritionTracker.dto.DailyProgressDTO;

public class TelegramMessageFormatter {

    public static String formatDailyProgress(DailyProgressDTO dto) {
        return """
                📊 Today's Remaining:
                🎯 %d kcal left
                🍗 %.1fg Protein | 🥔 %.1fg Carbs | 🥑 %.1fg Fat"""
                .formatted(
                        dto.remainingKcal(),
                        dto.remainingProtein(),
                        dto.remainingCarbs(),
                        dto.remainingFat()
                );
    }
}
