package com.project.NutritionTracker.controller;

import com.project.NutritionTracker.dto.GoalRequestDTO;
import com.project.NutritionTracker.dto.GoalResponseDTO;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.service.GoalService;
import org.apache.tomcat.util.buf.UEncoder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/goal")

public class GoalController {

    private final GoalService service;

    public GoalController(GoalService service) {
        this.service = service;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<GoalResponseDTO> createGoal(
            @RequestBody GoalRequestDTO dto,
            @PathVariable UUID userId) {
        GoalResponseDTO created = service.createGoal(dto, userId);

        return ResponseEntity.created(URI.create("/api/goal/" + created.id())).body(created); // code 201, converted to json
    }

    @PutMapping("/{goalId}")
    public ResponseEntity<GoalResponseDTO> updateGoal(
            @PathVariable UUID goalId,
            @RequestBody GoalRequestDTO dto) {
        return ResponseEntity.ok(service.updateGoal(goalId, dto)); //  code 201
    }

    @GetMapping("/user/{userId}/date")
    public ResponseEntity<GoalResponseDTO> getGoalByUserAndDate(
            @PathVariable UUID userId,
            @RequestParam LocalDate date) {
        return ResponseEntity.ok(service.getGoalByUserAndDate(userId, date)); // code 201
    }

    @GetMapping("/user/{userId}/all")
    public ResponseEntity<List<GoalResponseDTO>> getAllGoalsByUser (
           @PathVariable UUID userId) {
        return ResponseEntity.ok(service.findAllGoalsByUser(userId)); // code 201, object to json
    }


}
