package com.project.NutritionTracker.util;

import com.project.NutritionTracker.dto.DailyProgressDTO;

import java.util.Locale;

public class TelegramMessageFormatter {

    public static String formatDailyProgress(DailyProgressDTO dto) {
        return String.format(
                Locale.US,
                """
                📊 Today's Remaining:
                🎯 %d kcal left
                🍗 %.1fg Protein | 🥔 %.1fg Carbs | 🥑 %.1fg Fat""",
                dto.remainingKcal(),
                dto.remainingProtein(),
                dto.remainingCarbs(),
                dto.remainingFat()
        );
    }
}
