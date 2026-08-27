package com.project.NutritionTracker.controller;

import com.project.NutritionTracker.dto.FavoriteMealRequestDTO;
import com.project.NutritionTracker.dto.FavoriteMealResponseDTO;
import com.project.NutritionTracker.model.Entry;
import com.project.NutritionTracker.service.FavoriteMealService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/favorite-meal")
public class FavoriteMealController {


    private final FavoriteMealService service;

    public FavoriteMealController(FavoriteMealService service) {
        this.service = service;
    }

    @PostMapping("/convert/{id}")
    public ResponseEntity<FavoriteMealResponseDTO> convertEntryToFavorite(
            @Valid @RequestBody Entry entry,
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.convertEntryToFavorite(entry, id));
    }

    @PostMapping("/create/{id}")
    public ResponseEntity<FavoriteMealResponseDTO> createFavorite(
            @Valid @RequestBody FavoriteMealRequestDTO dto,
            @PathVariable UUID id
    ) {
        FavoriteMealResponseDTO response = service.createFavorite(dto, id);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/remove/{fMealId}")
    public ResponseEntity<Void> removeFavoriteMeal(
            @PathVariable UUID fMealId
    ) {
        service.removeFavoriteMeal(fMealId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("get-all/{id}")
    public ResponseEntity<List<FavoriteMealResponseDTO>> getAllFavorites(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.getAllFavorites(id));
    }

    @GetMapping("get-all-by-user/{id}")
    public ResponseEntity<List<FavoriteMealResponseDTO>> findAllByUser(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(service.getAllFavorites(id));
    }


}
