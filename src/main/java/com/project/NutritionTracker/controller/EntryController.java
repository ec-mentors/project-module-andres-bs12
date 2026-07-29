package com.project.NutritionTracker.controller;

import com.project.NutritionTracker.dto.EntryRequestDTO;
import com.project.NutritionTracker.dto.EntryResponseDTO;
import com.project.NutritionTracker.service.EntryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.xml.stream.events.EntityDeclaration;
import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/entry")

public class EntryController {

    private final EntryService service;

    public EntryController(EntryService service) {
        this.service = service;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<EntryResponseDTO>> findByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(service.findByUser(userId));
    }


    @PostMapping("/{userId}")
    public ResponseEntity<EntryResponseDTO> createEntry(
            @PathVariable UUID userId,
            @RequestBody EntryRequestDTO dto) {

        EntryResponseDTO created = service.createEntry(dto, userId);
        return ResponseEntity.created(URI.create("/api/entry/" + created.getId())).body(created);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeEntry(@PathVariable UUID userId) {
        service.removeEntry(userId);

        return ResponseEntity.noContent().build(); // 204 no content
    }

    @GetMapping("/{userId}/today")
    public ResponseEntity<List<EntryResponseDTO>> findTodayEntriesByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(service.findTodayEntriesByUser(userId));
    }

    @PutMapping("/{entryId}/update")
    public ResponseEntity<EntryResponseDTO> updateEntry(
            @PathVariable UUID entryId,
            @RequestBody EntryRequestDTO dto) {

        return ResponseEntity.ok(service.updateEntry(entryId, dto));
    }



}
