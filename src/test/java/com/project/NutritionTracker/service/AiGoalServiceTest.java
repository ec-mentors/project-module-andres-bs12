package com.project.NutritionTracker.service;

import com.project.NutritionTracker.dto.AiGoalRequestDTO;
import com.project.NutritionTracker.dto.AiGoalResponseDTO;
import com.project.NutritionTracker.enums.Gender;
import com.project.NutritionTracker.enums.ActivityLevel;
import com.project.NutritionTracker.enums.DietPreference;
import com.project.NutritionTracker.enums.PrimaryObjective;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AiGoalServiceTest {

    private AiGoalService service;

    // ReturnsDeepStubs simulate the string .prompt().system.user()....
    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private ChatClient.Builder chatClientBuilder;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private ChatClient chatClient;

    @BeforeEach
    void setUp() {
        when(chatClientBuilder.build()).thenReturn(chatClient);
        service = new AiGoalService(chatClientBuilder);
    }

    @Test
    void calculateGoal_WithValidRequest_ReturnsAiGoalResponseDTO() {

        AiGoalRequestDTO requestDTO = new AiGoalRequestDTO(
                PrimaryObjective.ATHLETIC_PERFORMANCE,
                Gender.MALE,
                28,
                180,
                80,
                75,
                ActivityLevel.MODERATELY_ACTIVE,
                DietPreference.LOW_CARB
        );

        AiGoalResponseDTO expectedResponse = new AiGoalResponseDTO(
                2100,
                180.0,
                60.0,
                200.0,
                "High protein deficit to maximize fat loss while preserving muscle."
        );

        when(chatClient.prompt()
                .system(anyString())
                .user(anyString())
                .call()
                .entity(AiGoalResponseDTO.class)).thenReturn(expectedResponse);

        AiGoalResponseDTO result = service.calculateGoal(requestDTO);

        assertNotNull(result);
        assertEquals(2100, result.kcal());
        assertEquals(180.0, result.carbs());
        assertEquals(60.0, result.fat());
        assertEquals(200.0, result.protein());
        assertEquals("High protein deficit to maximize fat loss while preserving muscle.", result.rationale());
    }

    @Test
    void calculateGoal_WhenAiFails_ThrowsRTE() {
        AiGoalRequestDTO requestDTO = new AiGoalRequestDTO(
                PrimaryObjective.ATHLETIC_PERFORMANCE,
                Gender.MALE,
                28,
                180,
                80,
                75,
                ActivityLevel.MODERATELY_ACTIVE,
                DietPreference.LOW_CARB
        );

        when(chatClient.prompt()
                .system(anyString())
                .user(anyString())
                .call()
                .entity(AiGoalResponseDTO.class)).thenThrow(new RuntimeException("Open Api ERROR"));

        assertThrows(RuntimeException.class, () -> service.calculateGoal(requestDTO));

    }

}
