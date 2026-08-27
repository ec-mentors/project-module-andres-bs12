package com.project.NutritionTracker.controller;

import com.project.NutritionTracker.dto.EntryRequestDTO;
import com.project.NutritionTracker.dto.EntryResponseDTO;
import com.project.NutritionTracker.enums.MealType;
import com.project.NutritionTracker.exception.NotFoundException;
import com.project.NutritionTracker.repository.UserRepository;
import com.project.NutritionTracker.service.EntryService;
import com.project.NutritionTracker.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EntryController.class)
@AutoConfigureMockMvc(addFilters = false)
public class EntryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private EntryService entryService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private UserRepository userRepository;

    // User ID
    private UUID sampleUserId;

    // Entry 1
    private UUID sampleEntryId;
    private EntryRequestDTO sampleEntryRequestDTO;
    private EntryResponseDTO sampleEntryResponseDTO;

    // Entry 2
    private UUID sampleEntryId2;
    private EntryRequestDTO sampleEntryRequestDTO2;
    private EntryResponseDTO sampleEntryResponseDTO2;

    @BeforeEach
    void setUp() {
        sampleUserId = UUID.randomUUID();
        sampleEntryId = UUID.randomUUID();
        sampleEntryId2 = UUID.randomUUID();

        // Entry 1
        sampleEntryRequestDTO = new EntryRequestDTO("Pasta Carbonara", 500, 50.0, 15.0, 30.0, MealType.BREAKFAST);
        sampleEntryResponseDTO = new EntryResponseDTO(sampleEntryId, "Pasta Carbonara", "MANUAL", LocalDateTime.of(2026, 8, 1, 12, 0), 500, 50.0, 15.0, 30.0, MealType.BREAKFAST);

        // Entry 2
        sampleEntryRequestDTO2 = new EntryRequestDTO("Chicken Salad", 300, 10.0, 8.0, 35.0, MealType.BREAKFAST);
        sampleEntryResponseDTO2 = new EntryResponseDTO(sampleEntryId2, "Chicken Salad", "MANUAL", LocalDateTime.of(2026, 8, 1, 13, 0), 300, 10.0, 8.0, 35.0, MealType.BREAKFAST);
    }


    // ---------- find Entry by User ----------

    @Test
    @DisplayName("GET /api/entry/{userId} - Success (200)")
    void findEntriesByUser_ShouldReturn200_AndEntryDTO() throws Exception {
        List<EntryResponseDTO> entries = List.of(sampleEntryResponseDTO, sampleEntryResponseDTO2);
        when(entryService.findByUser(sampleUserId)).thenReturn(entries);

        mockMvc.perform(get("/api/entry/{userId}", sampleUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(sampleEntryId.toString()))
                .andExpect(jsonPath("$[1].id").value(sampleEntryId2.toString()))
                .andExpect(jsonPath("$[0].mealName").value("Pasta Carbonara"))
                .andExpect(jsonPath("$[1].mealName").value("Chicken Salad"))
                .andExpect(jsonPath("$[0].protein").value(30))
                .andExpect(jsonPath("$[1].protein").value(35));

        verify(entryService).findByUser(sampleUserId);
    }

    // ---------- create Entry ----------

    @Test
    @DisplayName("POST /api/entry/{userId} - Success (201)")
    void createEntry_ShouldReturn201_AndEntryDTO() throws Exception {
        when(entryService.createEntry(sampleEntryRequestDTO, sampleUserId)).thenReturn(sampleEntryResponseDTO);

        mockMvc.perform(post("/api/entry/{userId}", sampleUserId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleEntryRequestDTO)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/entry/" + sampleEntryId));

        verify(entryService).createEntry(sampleEntryRequestDTO, sampleUserId);
    }

    // ---------- remove Entry ----------

    @Test
    @DisplayName("DELETE /api/entry/{entryId} - Success (204)")
    void removeEntry_ShouldReturn204() throws Exception {
        mockMvc.perform(delete("/api/entry/{entryId}", sampleEntryId))
                .andExpect(status().isNoContent());
        verify(entryService).removeEntry(sampleEntryId);
    }

    @Test
    @DisplayName("DELETE /api/entry/{entryId} - Entry Not Found (404)")
    void removeEntry_WhenEntryIdDoesNotExist_ShouldReturn404() throws Exception {
        doThrow(new NotFoundException("Entry not found"))
                .when(entryService).removeEntry(sampleEntryId);

        mockMvc.perform(delete("/api/entry/{entryId}", sampleEntryId))
                .andExpect(status().isNotFound());

        verify(entryService).removeEntry(sampleEntryId);
    }

    // ---------- get Today entries ----------

    @Test
    @DisplayName("GET /api/entry/{userId}/today - Success (200)")
    void todayEntries_ShouldReturn200_AndEntries() throws Exception {
        List<EntryResponseDTO> userEntries = List.of(sampleEntryResponseDTO, sampleEntryResponseDTO2);

        when(entryService.findTodayEntriesByUser(sampleUserId)).thenReturn(userEntries);

        mockMvc.perform(get("/api/entry/{userId}/today", sampleUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(sampleEntryId.toString()))
                .andExpect(jsonPath("$[1].id").value(sampleEntryId2.toString()))
                .andExpect(jsonPath("$[0].mealName").value("Pasta Carbonara"))
                .andExpect(jsonPath("$[1].mealName").value("Chicken Salad"))
                .andExpect(jsonPath("$[0].protein").value(30))
                .andExpect(jsonPath("$[1].protein").value(35));

        verify(entryService).findTodayEntriesByUser(eq(sampleUserId));
    }

    // ---------- update Entry ----------

    @Test
    @DisplayName("PUT /api/entry/{entryId}/update - Success (200)")
    void updateEntry_ShouldReturn200_AndEntry() throws Exception {
        when(entryService.updateEntry(sampleEntryId, sampleEntryRequestDTO2)).thenReturn(sampleEntryResponseDTO2);

        mockMvc.perform(put("/api/entry/{entryId}/update", sampleEntryId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleEntryRequestDTO2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mealName").value("Chicken Salad"))
                .andExpect(jsonPath("$.kcal").value(300))
                .andExpect(jsonPath("$.carbs").value(10.0))
                .andExpect(jsonPath("$.fat").value(8.0))
                .andExpect(jsonPath("$.protein").value(35.0));

        verify(entryService).updateEntry(sampleEntryId, sampleEntryRequestDTO2);
    }

    @Test
    @DisplayName("PUT /api/entry/{entryId}/update - Entry Not Found (404)")
    void updateEntry_WhenEntryDoesNotExist_ShouldReturn404() throws Exception {
        UUID fakeEntryId = UUID.randomUUID();

        when(entryService.updateEntry(eq(fakeEntryId), any(EntryRequestDTO.class)))
                .thenThrow(new NotFoundException("Entry not found"));

        mockMvc.perform(put("/api/entry/{entryId}/update", fakeEntryId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleEntryRequestDTO2)))
                .andExpect(status().isNotFound());

        verify(entryService).updateEntry(eq(fakeEntryId), any(EntryRequestDTO.class));
    }

}
