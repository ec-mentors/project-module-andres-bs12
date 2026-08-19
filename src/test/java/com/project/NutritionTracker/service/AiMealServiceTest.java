package com.project.NutritionTracker.service;

import com.project.NutritionTracker.dto.AiGoalResponseDTO;
import com.project.NutritionTracker.dto.AiMealResponseDTO;
import com.project.NutritionTracker.dto.AiMealTextRequestDTO;
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
public class AiMealServiceTest {

    private AiMealService service;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private ChatClient.Builder chatClientBuilder;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private ChatClient chatClient;

    @BeforeEach
    void setUp() {
        when(chatClientBuilder.build()).thenReturn(chatClient);
        service = new AiMealService(chatClientBuilder);
    }


    // parseMealFromText

    @Test
    void parseMealFromText_WithValidRequest_ReturnsAiMealResponseDTO() {


        AiMealResponseDTO expectedResponse = new AiMealResponseDTO(
                "Chicken",
                "telegram",
                10,
                54.0,
                97.6,
                71.3,
                "100"
        );
        when(chatClient.prompt()
                .system(anyString())
                .user(anyString())
                .call()
                .entity(AiMealResponseDTO.class)).thenReturn(expectedResponse);

        AiMealResponseDTO result = service.parseMealFromText("Chicken");

        assertNotNull(result);
        assertEquals(10, result.kcal());
        assertEquals(54.0, result.carbs());
        assertEquals(97.6, result.fat());
        assertEquals(71.3, result.protein());
        assertEquals("100", result.confidenceNote());
    }

    @Test
    void parseMealFromText_WithNullDescription_ThrowsIAE() {
        assertThrows(IllegalArgumentException.class, () -> service.parseMealFromText(null));
    }

    @Test
    void parseMealFromText_WithBlankDescription_ThrowsIAE() {


        assertThrows(IllegalArgumentException.class, () -> service.parseMealFromText(" "));
    }

}
