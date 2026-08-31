package com.project.NutritionTracker.service;

import com.project.NutritionTracker.dto.AiMealResponseDTO;
import com.project.NutritionTracker.dto.AiMealTextRequestDTO;
import com.project.NutritionTracker.dto.EntryRequestDTO;
import com.project.NutritionTracker.dto.EntryResponseDTO;
import com.project.NutritionTracker.enums.AiFeatureType;
import com.project.NutritionTracker.enums.MealType;
import com.project.NutritionTracker.exception.AiQuotaExceededException;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.UserRepository;
import com.project.NutritionTracker.util.MultipartFileConvertor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.GetFile;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Audio;
import org.telegram.telegrambots.meta.api.objects.File;
import org.telegram.telegrambots.meta.api.objects.PhotoSize;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.util.UUID;

@Service
public class TelegramBotService extends TelegramLongPollingBot {
    private final UserRepository uRepository;
    private final String botUserName;
    private final AiMealService aiMealService;
    private final AiAudioService aiAudioService;
    private final AiQuotaService quotaServicel;
    private final EntryService entryService;

    public TelegramBotService(
            UserRepository uRepository,
            @Value("${telegram.bot.token}") String botToken,
            @Value("${telegram.bot.name}") String botUserName, AiMealService aiMealService, AiAudioService aiAudioService, AiQuotaService quotaServicel,
            EntryService entryService) {
        super(botToken);
        this.uRepository = uRepository;
        this.botUserName = botUserName;
        this.aiMealService = aiMealService;
        this.aiAudioService = aiAudioService;
        this.quotaServicel = quotaServicel;
        this.entryService = entryService;
    }

    // To know the chatBot name
    @Override
    public String getBotUsername() {
        return this.botUserName;
    }

    // Tells what to do with the incoming message
    @Override
    public void onUpdateReceived(Update update) {
        UUID userId = null;

        if (!update.hasMessage()) {
            return;
        }

        var message = update.getMessage();
        var chatId = update.getMessage().getChatId();
        var user = uRepository.findByTelegramChatId(chatId);


        // Check if it's the first time of a registered user, login into wsp
        if (message.hasText() && message.getText().startsWith("/start")) {

            String tokenText = message.getText().replace("/start", "").trim();
            if (!tokenText.isEmpty()) {
                try {
                    UUID webUserId = UUID.fromString(tokenText);
                    var webUser = uRepository.findById(webUserId);
                    if (webUser.isPresent()) {
                        User u = webUser.get();
                        u.setTelegramChatId(chatId);
                        uRepository.save(u);

                        String response = "Welcome you can now send photos, text, and audio, I will calculate your food and save the information. " +
                                "\n You have 5 AI entries per day, sorry is my API key :D, enjoy";
                        SendMessage sendMessage = new SendMessage(String.valueOf(chatId), response);
                        try {
                            execute(sendMessage);
                            return;
                        } catch (TelegramApiException e) {
                            throw new RuntimeException(e);
                        }
                    }
                } catch (IllegalArgumentException e) {
                    return;
                }
            }
        }

        if (user.isEmpty()) {
            SendMessage sendMessage = new SendMessage(String.valueOf(chatId), "Your user is not connected yet");
            try {
                execute(sendMessage);
            } catch (TelegramApiException e) {
                throw new RuntimeException(e);
            }
            return;
        }

        userId = user.get().getId();

        // Photos
        try {
            if (message.hasPhoto()) {
                quotaServicel.saveQuota(userId, AiFeatureType.ENTRY_AI);

                // First I get a list with different sizes, them I get the best photo
                PhotoSize bestPhoto = message.getPhoto().get(message.getPhoto().size() - 1);
                //
                String fieldId = bestPhoto.getFileId();

                GetFile getFile = new GetFile(fieldId);
                File tgFile = null;
                try {
                    tgFile = execute(getFile);
                } catch (TelegramApiException e) {
                    throw new RuntimeException(e);
                }

                java.io.File localFile = null;
                try {
                    localFile = downloadFile(tgFile);
                } catch (TelegramApiException e) {
                    throw new RuntimeException(e);
                }
                var convertedFile = new MultipartFileConvertor("image/jpeg", localFile);
                var response = aiMealService.parseMealFromImage(userId, convertedFile);

                EntryRequestDTO entryRequestDTO = new EntryRequestDTO(
                        response.mealName(),
                        response.kcal(),
                        response.carbs(),
                        response.fat(),
                        response.protein(),
                        response.mealType() != null ? response.mealType() : MealType.LUNCH
                );
                var responseDTO = entryService.createEntry(entryRequestDTO, userId);
                try {
                    replyWithEntry(responseDTO, chatId);
                } catch (TelegramApiException e) {
                    throw new RuntimeException(e);
                }
                if (localFile != null) {
                    localFile.delete();
                }
            }
        } catch (AiQuotaExceededException e) {
            try {
                replyQuotaFinished(chatId);
            } catch (TelegramApiException ex) {
                throw new RuntimeException(ex);
            }
        }

        // Text
        try {
            if (message.hasText()) {
                quotaServicel.saveQuota(userId, AiFeatureType.ENTRY_AI);
                AiMealResponseDTO meal = aiMealService.parseMealFromText(userId, message.getText());
                EntryRequestDTO entryRequestDTO = new EntryRequestDTO(
                        meal.mealName(),
                        meal.kcal(),
                        meal.carbs(),
                        meal.fat(),
                        meal.protein(),
                        meal.mealType() != null ? meal.mealType() : MealType.LUNCH
                );
                var responseDTO = entryService.createEntry(entryRequestDTO, userId);
                // Call a method to reply with the entry
                try {
                    replyWithEntry(responseDTO, chatId);
                } catch (TelegramApiException e) {
                    throw new RuntimeException(e);
                }
            }
        } catch (AiQuotaExceededException e) {
            try {
                replyQuotaFinished(chatId);
            } catch (TelegramApiException ex) {
                throw new RuntimeException(ex);
            }
        }


        // Audio
        if (message.hasVoice()) {
            try {
                // First check if there are credits left
                quotaServicel.saveQuota(userId, AiFeatureType.ENTRY_AI);

                String fileId = message.getVoice().getFileId();
                // Get the file
                GetFile getFile = new GetFile(fileId);
                File tgFile = null;
                try {
                    // executes the get file
                    tgFile = execute(getFile);
                } catch (TelegramApiException e) {
                    throw new RuntimeException(e);
                }

                java.io.File localFile = null;
                try {
                    // download the file that was gotten before
                    localFile = downloadFile(tgFile);
                } catch (TelegramApiException e) {
                    throw new RuntimeException(e);
                }
                // Java file to converted file
                var convertedFile = new MultipartFileConvertor("audio/ogg", localFile);

                var text = aiAudioService.transcribe(userId, convertedFile);
                var response = aiMealService.parseMealFromText(userId, text);

                EntryRequestDTO entryRequestDTO = new EntryRequestDTO(
                        response.mealName(),
                        response.kcal(),
                        response.carbs(),
                        response.fat(),
                        response.protein(),
                        response.mealType() != null ? response.mealType() : MealType.LUNCH
                );
                var responseDTO = entryService.createEntry(entryRequestDTO, userId);

                try {
                    replyWithEntry(responseDTO, chatId);
                } catch (TelegramApiException e) {
                    throw new RuntimeException(e);
                }
                if (localFile != null) {
                    localFile.delete();
                }
            } catch (AiQuotaExceededException e) {
                try {
                    replyQuotaFinished(chatId);
                } catch (TelegramApiException ex) {
                    throw new RuntimeException(ex);
                }
            }
        }
    }

    public void replyWithEntry(EntryResponseDTO dto, Long chatId) throws TelegramApiException {
        String response = "🍽️ " + dto.mealName() +
                "\n🔥 " + dto.kcal() + " kcal" +
                "\n🍗 " + dto.protein() + "g P | 🥔 " + dto.carbs() + "g C | 🥑 " + dto.fat() + "g G";
        SendMessage sendMessage = new SendMessage(String.valueOf(chatId), response);
        execute(sendMessage);
    }

    public void replyQuotaFinished(Long chatId) throws TelegramApiException {
        SendMessage sendMessage = new SendMessage(String.valueOf(chatId), "Your AI limit has been reached, Sorry, my API key can't handle that much");
        execute(sendMessage);
    }
}
