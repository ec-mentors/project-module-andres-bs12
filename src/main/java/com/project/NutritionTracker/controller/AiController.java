package com.project.NutritionTracker.controller;

import com.project.NutritionTracker.dto.AiGoalRequestDTO;
import com.project.NutritionTracker.dto.AiGoalResponseDTO;
import com.project.NutritionTracker.dto.AiMealResponseDTO;
import com.project.NutritionTracker.dto.AiMealTextRequestDTO;
import com.project.NutritionTracker.enums.AiFeatureType;
import com.project.NutritionTracker.service.AiAudioService;
import com.project.NutritionTracker.service.AiGoalService;
import com.project.NutritionTracker.service.AiMealService;
import com.project.NutritionTracker.service.AiQuotaService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiGoalService AiGoalservice;
    private final AiMealService aiMealService;
    private final AiAudioService audioService;
    private final AiQuotaService quotaService;

    // Goal config

    public AiController(AiGoalService aiGoalservice, AiMealService aiMealService, AiAudioService audioService, AiQuotaService quotaService) {
        this.AiGoalservice = aiGoalservice;
        this.aiMealService = aiMealService;
        this.audioService = audioService;
        this.quotaService = quotaService;
    }

    // Goal

    @PostMapping("/calculate-goal/{userId}")
    public ResponseEntity<AiGoalResponseDTO> calculateGoal(
            @PathVariable UUID userId,
            @Valid @RequestBody AiGoalRequestDTO aiGoalRequestDTO) {
        quotaService.saveQuota(userId, AiFeatureType.GOAL_AI);
        AiGoalResponseDTO responseDTO = AiGoalservice.calculateGoal(userId, aiGoalRequestDTO);
        return ResponseEntity.ok(responseDTO);
    }

    // Meal AiGoalservice

    @PostMapping("/parse-meal-text/{userId}")
    public ResponseEntity<AiMealResponseDTO> parseMealFromText(
            @PathVariable UUID userId,
            @Valid @RequestBody AiMealTextRequestDTO dto) {
        quotaService.saveQuota(userId, AiFeatureType.ENTRY_AI);
        // DTO is required so the json keys are ignored and just the text is sent as String with the .description
        return ResponseEntity.ok(aiMealService.parseMealFromText(userId, dto.description()));
    }


    @PostMapping(value = "/parse-meal-audio/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    // Multipart -> To upload heavy files by parts like a vidio (audio, img, info, etc), this just accepts files
    public ResponseEntity<AiMealResponseDTO> parseMealFromAudio(
            @PathVariable UUID userId,
            @Valid @RequestParam("audio")MultipartFile audio) {
        quotaService.saveQuota(userId, AiFeatureType.ENTRY_AI);
        return ResponseEntity.ok(aiMealService.parseMealFromText(userId, audioService.transcribe(userId, audio)));
    }

    @PostMapping(value = "/parse-meal-image/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    // Multipart -> To upload heavy files by parts like a vidio (audio, img, info, etc), this just accepts files
    public ResponseEntity<AiMealResponseDTO> parseMealFromImagen(
            @PathVariable UUID userId,
            @Valid @RequestParam("image")MultipartFile image) {
        quotaService.saveQuota(userId, AiFeatureType.ENTRY_AI);
        return ResponseEntity.ok(aiMealService.parseMealFromImage(userId, image));
    }
}
