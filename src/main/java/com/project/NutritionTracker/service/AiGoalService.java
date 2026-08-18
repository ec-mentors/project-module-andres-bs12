package com.project.NutritionTracker.service;

import com.project.NutritionTracker.dto.AiGoalRequestDTO;
import com.project.NutritionTracker.dto.AiGoalResponseDTO;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class AiGoalService {
    private ChatClient chatClient;

    public AiGoalService(ChatClient.Builder builder) {
        this.chatClient = builder.build(); // SpringAi injects the key
    }

    public AiGoalResponseDTO calculateGoal(AiGoalRequestDTO dto) {

        String systemPrompt = "You are an expert sports nutritionist and precision dietitian for NutritionTracker.\n" +
                "Your role is to formulate a personalized, science-based daily caloric target (kcal) and macronutrient split (protein, carbs, fat in grams) uniquely tailored to the user's lifestyle, objective, and dietary preferences.\n" +
                "Clinical Guidelines for your Analysis:\n" +
                "1. Holistic Energy & Caloric Assessment:\n" +
                "   - Estimate the user's Total Daily Energy Expenditure (TDEE) based on their biometrics and dailyActivityLevel.\n" +
                "   - Adjust the caloric intake based on primaryObjective and the weight gap between currentWeightKg and targetWeightKg:\n" +
                "     * FAT_LOSS: Create a sustainable, progressive caloric deficit designed to preserve lean muscle tissue.\n" +
                "     * MUSCLE_GAIN: Establish a clean caloric surplus to fuel hypertrophy without excessive fat accumulation.\n" +
                "     * MAINTENANCE: Balance daily energy intake to optimize vitality and metabolic health.\n" +
                "     * ATHLETIC_PERFORMANCE: Fuel peak training demands, endurance, and rapid recovery.\n" +
                "2. Adaptive Macronutrient Distribution:\n" +
                "   - Protein: Scale protein intake relative to current weight, activity, and objective (higher for fat loss preservation, muscle building, and high-protein preferences).\n" +
                "   - Dietary Preference Tailoring:\n" +
                "     * BALANCED: Provide an optimal, versatile macro ratio suitable for everyday athletic lifestyle.\n" +
                "     * HIGH_PROTEIN: Maximize satiety, thermogenesis, and muscular repair.\n" +
                "     * LOW_CARB: Shift primary energy substrate to healthy fats while keeping protein optimal.\n" +
                "     * PLANT_BASED: Optimize plant-derived protein thresholds and complex carbohydrates for sustained energy.\n" +
                "   - Consistency check: Ensure (protein * 4) + (carbs * 4) + (fat * 9) aligns with the calculated total kcal.\n" +
                "3. Rationale:\n" +
                "   - Provide a short, punchy explanation (1 sentence, max 25 words) in the 'rationale' field explaining why this calorie target and macro split fit their goal.";

        String userPrompt = """
                Please analyze and calculate the optimal daily nutrition roadmap for this individual:
                  - Biological Sex: %s
                  - Age: %d years old
                  - Height: %d cm
                  - Current Weight: %d kg
                  - Target Weight: %d kg
                  - Daily Activity Level: %s
                  - Dietary Preference: %s
                  - Primary Objective: %s
                """.formatted(
                dto.gender(),
                dto.age(),
                dto.heightCm(),
                dto.currentWeightKg(),
                dto.targetWeightKg(),
                dto.dailyActivityLevel(),
                dto.dietaryPreference(),
                dto.primaryObjective()
        );

        return this.chatClient.prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .call()
                .entity(AiGoalResponseDTO.class);
    }

}
