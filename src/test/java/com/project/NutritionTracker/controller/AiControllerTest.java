package com.project.NutritionTracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.NutritionTracker.dto.AiGoalRequestDTO;
import com.project.NutritionTracker.dto.AiGoalResponseDTO;
import com.project.NutritionTracker.dto.AiMealResponseDTO;
import com.project.NutritionTracker.dto.AiMealTextRequestDTO;
import com.project.NutritionTracker.enums.*;
import com.project.NutritionTracker.exception.AiQuotaExceededException;
import com.project.NutritionTracker.repository.UserRepository;
import com.project.NutritionTracker.service.AiAudioService;
import com.project.NutritionTracker.service.AiGoalService;
import com.project.NutritionTracker.service.AiMealService;
import com.project.NutritionTracker.service.AiQuotaService;
import com.project.NutritionTracker.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AiController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AiGoalService aiGoalService;

    @MockitoBean
    private AiAudioService audioService;

    @MockitoBean
    private AiQuotaService quotaService;

    // Needed to start up the test
    @MockitoBean
    private UserService userService;

    // Needed to start up the test
    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private AiMealService aiMealService;

    private final UUID sampleUserId = UUID.randomUUID();

    @Test
    @DisplayName("POST /calculate-goal/{userId} - Success")
    void calculateGoal_WithValidText_ShouldReturn200_AndAiGoalResponseDTO() throws Exception {

        AiGoalRequestDTO aiGoalRequestDTO = new AiGoalRequestDTO(
                PrimaryObjective.ATHLETIC_PERFORMANCE,
                Gender.MALE,
                28, 180, 80, 75,
                ActivityLevel.MODERATELY_ACTIVE,
                DietPreference.LOW_CARB
        );
        AiGoalResponseDTO mockAiGoalResponse = new AiGoalResponseDTO(
                2200,
                190.0,
                65.0,
                210.0,
                "Kcal consume"
        );

        when(aiGoalService.calculateGoal(eq(sampleUserId), any(AiGoalRequestDTO.class))).thenReturn(mockAiGoalResponse);

        mockMvc.perform(post("/api/ai/calculate-goal/{userId}", sampleUserId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(aiGoalRequestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.kcal").value(2200))
                .andExpect(jsonPath("$.carbs").value(190.0))
                .andExpect(jsonPath("$.fat").value(65.0))
                .andExpect(jsonPath("$.protein").value(210.0))
                .andExpect(jsonPath("$.rationale").value("Kcal consume"));

        verify(quotaService).saveQuota(sampleUserId, AiFeatureType.GOAL_AI);
    }

    @Test
    @DisplayName("POST /calculate-goal/{userId} - Quota Exceeded (429)")
    void calculateGoal_WhenQuotaExceeded_ShouldReturn429() throws Exception {
        AiGoalRequestDTO aiGoalRequestDTO = new AiGoalRequestDTO(
                PrimaryObjective.ATHLETIC_PERFORMANCE,
                Gender.MALE,
                28, 180, 80, 75,
                ActivityLevel.MODERATELY_ACTIVE,
                DietPreference.LOW_CARB
        );

        doThrow(new AiQuotaExceededException("AI Goal Quota exceed for today wait until tomorrow"))
                .when(quotaService).saveQuota(sampleUserId, AiFeatureType.GOAL_AI);

        mockMvc.perform(post("/api/ai/calculate-goal/{userId}", sampleUserId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(aiGoalRequestDTO)))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    @DisplayName("POST /calculate-goal/{userId} - Bad Request(400)")
    void calculateGoal_WithMalformedJson_ShouldReturn400() throws Exception {
        String invalidJson = "{\"age\": \"not-a-number\"}";

        mockMvc.perform(post("/api/ai/calculate-goal/{userId}", sampleUserId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }


    // parseMealFromText

    @Test
    @DisplayName("POST /parse-meal-text/{userId} - Success")
    void parseMeal_WithValidText_ShouldReturn200_AndAiMealResponseDTO() throws Exception {

        AiMealTextRequestDTO aiMealTextRequestDTO = new AiMealTextRequestDTO("I ate some chicken");
        AiMealResponseDTO mockAiMealResponse = new AiMealResponseDTO(
                "Chicken",
                2200,
                190.0,
                65.0,
                210.0,
                "100",
                MealType.BREAKFAST
        );

        when(aiMealService.parseMealFromText(sampleUserId, "I ate some chicken")).thenReturn(mockAiMealResponse);

        mockMvc.perform(post("/api/ai/parse-meal-text/{userId}", sampleUserId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(aiMealTextRequestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mealName").value("Chicken"))
                .andExpect(jsonPath("$.kcal").value(2200))
                .andExpect(jsonPath("$.carbs").value(190.0))
                .andExpect(jsonPath("$.protein").value(210.0))
                .andExpect(jsonPath("$.confidenceNote").value(100))
                .andExpect(jsonPath("$.mealType").value("breakfast"));

        verify(quotaService).saveQuota(sampleUserId, AiFeatureType.ENTRY_AI);
    }

    @Test
    @DisplayName("POST /parse-meal-text/{userId} - Bad Request(400)")
    void parseMeal_WithNullDescription_ShouldReturn400_AndAiMealResponseDTO() throws Exception {
        mockMvc.perform(post("/api/ai/parse-meal-text/{userId}", sampleUserId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(null)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /parse-meal-text/{userId} - Bad Request(400)")
    void parseMeal_WithEmptyDescription_ShouldReturn400_AndAiMealResponseDTO() throws Exception {
        mockMvc.perform(post("/api/ai/parse-meal-text/{userId}", sampleUserId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AiMealTextRequestDTO(" "))))
                .andExpect(status().isBadRequest());
    }

    // Parse meal audio

    @Test
    @DisplayName("POST /parse-meal-audio/{userId} - Success")
    void parseMealFromAudio_WithValidAudio_ShouldReturn200_AndAiMealResponseDTO() throws Exception {
        MockMultipartFile audioFile = new MockMultipartFile(
                "audio",
                "nota_voz.mp3",
                "audio/mpeg",
                "fake_bytes".getBytes());

        AiMealResponseDTO mockAiMealResponse = new AiMealResponseDTO(
                "Chicken",
                2200,
                190.0,
                65.0,
                210.0,
                "100",
                MealType.BREAKFAST
        );
        when(audioService.transcribe(eq(sampleUserId), any())).thenReturn("I ate half chicken");
        when(aiMealService.parseMealFromText(sampleUserId, "I ate half chicken")).thenReturn(mockAiMealResponse);

        mockMvc.perform(multipart("/api/ai/parse-meal-audio/{userId}", sampleUserId).file(audioFile))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mealName").value("Chicken"))
                .andExpect(jsonPath("$.kcal").value(2200))
                .andExpect(jsonPath("$.carbs").value(190.0))
                .andExpect(jsonPath("$.fat").value(65.0))
                .andExpect(jsonPath("$.protein").value(210.0))
                .andExpect(jsonPath("$.confidenceNote").value("100"))
                .andExpect(jsonPath("$.mealType").value("breakfast"));

        verify(quotaService).saveQuota(sampleUserId, AiFeatureType.ENTRY_AI);
    }


    // parse meal image

    @Test
    @DisplayName("POST /parse-meal-image/{userId} - Success")
    void parseMealFromImage_WithValidText_ShouldReturn200_AndAiMealResponseDTO() throws Exception {

        MockMultipartFile imageFile = new MockMultipartFile(
                "image",
                "Dish.jpg",
                "image/jpeg",
                "fake_bytes".getBytes()
        );
        AiMealResponseDTO mockAiMealResponse = new AiMealResponseDTO(
                "Chicken",
                2200,
                190.0,
                65.0,
                210.0,
                "100",
                MealType.BREAKFAST
        );

        when(aiMealService.parseMealFromImage(eq(sampleUserId), any())).thenReturn(mockAiMealResponse);

        mockMvc.perform(multipart("/api/ai/parse-meal-image/{userId}", sampleUserId).file(imageFile))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mealName").value("Chicken"))
                .andExpect(jsonPath("$.kcal").value(2200))
                .andExpect(jsonPath("$.carbs").value(190.0))
                .andExpect(jsonPath("$.protein").value(210.0))
                .andExpect(jsonPath("$.confidenceNote").value(100))
                .andExpect(jsonPath("$.mealType").value("breakfast"));

        verify(quotaService).saveQuota(sampleUserId, AiFeatureType.ENTRY_AI);
    }

    @Test
    @DisplayName("POST /parse-meal-image/{userId} - Bad Request (400)")
    void parseMealFromImage_WithEmptyFile_ShouldReturn400() throws Exception {

        MockMultipartFile imageFile = new MockMultipartFile(
                " ",
                "Dish.jpg",
                "/mp4",
                "fake_bytes".getBytes()
        );

        mockMvc.perform(multipart("/api/ai/parse-meal-image/{userId}", sampleUserId).file(imageFile))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/ai/parse-meal-image/{userId} - Unsupported Media Type (415)")
    void parseMealFromImage_WithWrongContentType_ShouldReturn415() throws Exception {
        mockMvc.perform(multipart("/api/ai/parse-meal-image/{userId}", sampleUserId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnsupportedMediaType());
    }
}
