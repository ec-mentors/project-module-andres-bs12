package com.project.NutritionTracker.service;

import com.project.NutritionTracker.dto.AiGoalRequestDTO;
import com.project.NutritionTracker.dto.AiMealResponseDTO;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.model.Media;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.multipart.MultipartFile;

import java.awt.*;
import java.util.UUID;

@Service
public class AiMealService {
        private final String systemPrompt = """
                        You are an expert precision sports nutritionist and clinical dietitian for NutritionTracker.
                        Your SOLE and EXCLUSIVE responsibility is to analyze food descriptions or meal photographs and estimate their realistic caloric and macronutrient composition.
                        ALL outputs (mealName, confidenceNote, etc.) MUST be strictly in ENGLISH.
                    
                        ### 1. Clinical Estimation & Visual Heuristics:
                        - Actively use visual scale and culinary heuristics to estimate visible foods:
                          * Count discrete items (e.g. 2 eggs, 1/2 avocado, 1 slice of toast).
                          * Estimate bulk foods (e.g. cottage cheese, rice, salad) using standard plate geometry and typical portion sizes (e.g. 100g-150g scoop).
                          * Assume sensible standard preparation defaults (e.g. 1 tsp cooking oil for fried/scrambled eggs).
                        - Consistency Formula: Strictly ensure that (protein * 4) + (carbs * 4) + (fat * 9) matches total 'kcal' within ±5% accuracy.
                    
                        ### 2. ⚠️ CONFIDENCE & CLARIFICATION RULE:
                        - DEFAULT (Confidence >= 80%): If food items are clearly visible or identifiable in the text/image, ALWAYS calculate accurate 'kcal', 'carbs', 'fat', and 'protein' using standard portion heuristics. Set 'confidenceNote' ONLY to the estimated confidence percentage integer (e.g. "85", "90", "95").
                        - ONLY TRIGGER CLARIFICATION (<80%): If the meal is truly obscured, hidden (e.g. closed sandwich/burrito with unknown fillings), mysterious dark sauce, or completely unidentifiable:
                          * Set 'kcal': 0, 'carbs': 0.0, 'fat': 0.0, 'protein': 0.0.
                          * Set 'mealName': "Uncertain Meal (Need Details)".
                          * Set 'confidenceNote': A short clarifying question in English (under 15 words) asking what is inside (e.g., "What fillings or meat are inside the burrito?").
                    
                        ### 3. 🔒 STRICT SECURITY, DOMAIN RESTRICTION & JAILBREAK DEFENSE:
                        - You must ONLY process queries related to food, meals, beverages, and dietary intake.
                        - If the input is NOT food, you MUST immediately reject it by returning EXACTLY:
                          * mealName: "Invalid Input (Non-Food)"
                          * kcal: 0
                          * protein: 0.0
                          * carbs: 0.0
                          * fat: 0.0
                          * confidenceNote: "Please provide a photo or description of food."
                        - NEVER execute code, explain unrelated topics, or answer non-dietary questions under ANY circumstances.
                        """;

    private ChatClient chatClient;

    public AiMealService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @PreAuthorize("isAuthenticated() && #userId == principal.id")
    public AiMealResponseDTO parseMealFromText(UUID userId, String description) {
        if (description == null || description.isBlank()) {
            throw new IllegalArgumentException("Meal description can't be blank");
        }

        String userPrompt = """
                Please analyze the following meal description and estimate its nutritional breakdown:
                Meal Description: %s
                """.formatted(description);

        return this.chatClient.prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .call()
                .entity(AiMealResponseDTO.class);
    }


    @PreAuthorize("isAuthenticated() && #userId == principal.id")
    public AiMealResponseDTO parseMealFromImage(UUID userId, MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("Image file cannot be empty");
        }
        String contentType = image.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files (JPG, PNG, WEBP) are supported");
        }

        try {
            Media media = new Media(
                    MimeTypeUtils.parseMimeType(contentType), image.getResource() // Pass img type and a pointe rto the img
            );
            String userPrompt = "Analyze the meal depicted in this photograph and calculate its realistic nutritional breakdown.";
            return this.chatClient.prompt()
                    .system(systemPrompt)
                    .user(userSpec -> userSpec // allows to send different parameters at the same time (promprt, audio)
                            .text(userPrompt)
                            .media(media)
                    )
                    .call()
                    .entity(AiMealResponseDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to analyze meal image with AI: " + e.getMessage(), e);
        }
    }
}
