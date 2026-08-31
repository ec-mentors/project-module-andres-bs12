package com.project.NutritionTracker.service;

import com.project.NutritionTracker.dto.AiMealResponseDTO;
import com.project.NutritionTracker.dto.EntryRequestDTO;
import com.project.NutritionTracker.dto.EntryResponseDTO;
import com.project.NutritionTracker.enums.AiFeatureType;
import com.project.NutritionTracker.enums.MealType;
import com.project.NutritionTracker.exception.AiQuotaExceededException;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TelegramBotServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AiMealService aiMealService;

    @Mock
    private AiAudioService aiAudioService;

    @Mock
    private AiQuotaService quotaService;

    @Mock
    private EntryService entryService;

    private TelegramBotService service;

    @BeforeEach
    void setUp() throws TelegramApiException {
        service = spy(new TelegramBotService(
                userRepository,
                "dummy-token",
                "TestBot",
                aiMealService,
                aiAudioService,
                quotaService,
                entryService
        ));
        lenient().doReturn(null).when(service).execute(any(SendMessage.class));
        lenient().doNothing().when(service).replyWithEntry(any(), any());
        lenient().doNothing().when(service).replyQuotaFinished(any());
    }

    @Test
    void returnsBotUsername() {
        assertEquals("TestBot", service.getBotUsername());
    }

    @Test
    void onUpdateReceived_ignoresWhenNoMessage() {
        Update update = mock(Update.class);
        when(update.hasMessage()).thenReturn(false);

        service.onUpdateReceived(update);

        verifyNoInteractions(userRepository);
        verifyNoInteractions(aiMealService);
        verifyNoInteractions(entryService);
    }

    @Test
    void onUpdateReceived_linksUserWithStartCommand() throws TelegramApiException {
        UUID userId = UUID.randomUUID();
        Long chatId = 123456789L;

        Update update = mock(Update.class);
        Message message = mock(Message.class);

        when(update.hasMessage()).thenReturn(true);
        when(update.getMessage()).thenReturn(message);
        when(message.getChatId()).thenReturn(chatId);
        when(userRepository.findByTelegramChatId(chatId)).thenReturn(Optional.empty());

        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("/start " + userId);

        User user = new User();
        user.setId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        service.onUpdateReceived(update);

        assertEquals(chatId, user.getTelegramChatId());
        verify(userRepository).save(user);
        verify(service).execute(any(SendMessage.class));
    }

    @Test
    void onUpdateReceived_processesTextMessageForLinkedUser() throws TelegramApiException {
        UUID userId = UUID.randomUUID();
        Long chatId = 987654321L;

        Update update = mock(Update.class);
        Message message = mock(Message.class);

        when(update.hasMessage()).thenReturn(true);
        when(update.getMessage()).thenReturn(message);
        when(message.getChatId()).thenReturn(chatId);

        User user = new User();
        user.setId(userId);
        user.setTelegramChatId(chatId);
        when(userRepository.findByTelegramChatId(chatId)).thenReturn(Optional.of(user));

        when(message.hasPhoto()).thenReturn(false);
        when(message.hasVoice()).thenReturn(false);
        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("200g chicken and rice");

        AiMealResponseDTO aiResponse = new AiMealResponseDTO(
                "Chicken and Rice",
                450,
                40.0,
                8.0,
                45.0,
                "Good protein meal",
                MealType.LUNCH
        );
        when(aiMealService.parseMealFromText(userId, "200g chicken and rice")).thenReturn(aiResponse);

        EntryResponseDTO entryResponse = new EntryResponseDTO(
                UUID.randomUUID(),
                "Chicken and Rice",
                "AI_TEXT",
                LocalDateTime.now(),
                450,
                40.0,
                8.0,
                45.0,
                MealType.LUNCH
        );
        when(entryService.createEntry(any(EntryRequestDTO.class), eq(userId))).thenReturn(entryResponse);

        service.onUpdateReceived(update);

        verify(quotaService).saveQuota(userId, AiFeatureType.ENTRY_AI);
        verify(aiMealService).parseMealFromText(userId, "200g chicken and rice");
        verify(entryService).createEntry(any(EntryRequestDTO.class), eq(userId));
        verify(service).replyWithEntry(entryResponse, chatId);
    }

    @Test
    void onUpdateReceived_handlesQuotaExceededGracefully() throws TelegramApiException {
        UUID userId = UUID.randomUUID();
        Long chatId = 987654321L;

        Update update = mock(Update.class);
        Message message = mock(Message.class);

        when(update.hasMessage()).thenReturn(true);
        when(update.getMessage()).thenReturn(message);
        when(message.getChatId()).thenReturn(chatId);

        User user = new User();
        user.setId(userId);
        user.setTelegramChatId(chatId);
        when(userRepository.findByTelegramChatId(chatId)).thenReturn(Optional.of(user));

        when(message.hasPhoto()).thenReturn(false);
        when(message.hasVoice()).thenReturn(false);
        when(message.hasText()).thenReturn(true);
        when(message.getText()).thenReturn("Protein shake");

        doThrow(new AiQuotaExceededException("Daily quota exceeded"))
                .when(quotaService).saveQuota(userId, AiFeatureType.ENTRY_AI);

        service.onUpdateReceived(update);

        verify(quotaService).saveQuota(userId, AiFeatureType.ENTRY_AI);
        verifyNoInteractions(aiMealService);
        verifyNoInteractions(entryService);
        verify(service).replyQuotaFinished(chatId);
    }
}
