package com.project.NutritionTracker.controller;

import com.project.NutritionTracker.dto.AiGoalRequestDTO;
import com.project.NutritionTracker.dto.AiGoalResponseDTO;
import com.project.NutritionTracker.dto.AiMealResponseDTO;
import com.project.NutritionTracker.dto.AiMealTextRequestDTO;
import com.project.NutritionTracker.service.AiAudioService;
import com.project.NutritionTracker.service.AiGoalService;
import com.project.NutritionTracker.service.AiMealService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    // Goal config
    private final AiGoalService AiGoalservice;
    // Audio config
    private final AiMealService aiMealService;
    // Meal config
    private final AiAudioService audioService;

    // Goal config

    public AiController(AiGoalService aiGoalservice, AiMealService aiMealService, AiAudioService audioService) {
        this.AiGoalservice = aiGoalservice;
        this.aiMealService = aiMealService;
        this.audioService = audioService;
    }

    // Goal

    @PostMapping("/calculate-goal")
    public ResponseEntity<AiGoalResponseDTO> calculateGoal(@RequestBody AiGoalRequestDTO aiGoalRequestDTO) {
        AiGoalResponseDTO responseDTO = AiGoalservice.calculateGoal(aiGoalRequestDTO);
        return ResponseEntity.ok(responseDTO);
    }

    // Meal AiGoalservice

    @PostMapping("/parse-meal-text")
    public ResponseEntity<AiMealResponseDTO> parseMealFromText(@Valid @RequestBody AiMealTextRequestDTO dto) {
        // DTO is required so the json keys are ignored and just the text is sent as String with the .description
        return ResponseEntity.ok(aiMealService.parseMealFromText(dto.description()));
    }


    @PostMapping(value = "/parse-meal-audio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    // Multipart -> To upload heavy files by parts like a vidio (audio, img, info, etc), this just accepts files
    public ResponseEntity<AiMealResponseDTO> parseMealFromAudio(@RequestParam("audio")MultipartFile audio) {
        return ResponseEntity.ok(aiMealService.parseMealFromText(audioService.transcribe(audio)));
    }

    @PostMapping(value = "/parse-meal-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    // Multipart -> To upload heavy files by parts like a vidio (audio, img, info, etc), this just accepts files
    public ResponseEntity<AiMealResponseDTO> parseMealFromImagen(@RequestParam("image")MultipartFile image) {
        return ResponseEntity.ok(aiMealService.parseMealFromImage(image));
    }
}
