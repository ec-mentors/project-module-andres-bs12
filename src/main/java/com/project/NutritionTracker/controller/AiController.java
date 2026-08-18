package com.project.NutritionTracker.controller;

import com.project.NutritionTracker.dto.AiGoalRequestDTO;
import com.project.NutritionTracker.dto.AiGoalResponseDTO;
import com.project.NutritionTracker.service.AiGoalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiGoalService service;

    public AiController(AiGoalService service) {
        this.service = service;
    }

    @PostMapping("calculate-goal")
    public ResponseEntity<AiGoalResponseDTO> calculateGoal(@RequestBody AiGoalRequestDTO aiGoalRequestDTO) {
        AiGoalResponseDTO responseDTO = service.calculateGoal(aiGoalRequestDTO);
        return ResponseEntity.ok(responseDTO);
    }

}
