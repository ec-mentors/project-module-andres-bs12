package com.project.NutritionTracker.controller;

import com.project.NutritionTracker.dto.EntryRequestDTO;
import com.project.NutritionTracker.dto.EntryResponseDTO;
import com.project.NutritionTracker.model.Entry;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.service.EntryService;
import com.project.NutritionTracker.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;

import com.project.NutritionTracker.repository.UserRepository;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
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
        sampleEntryRequestDTO = new EntryRequestDTO("Pasta Carbonara", 500, 50.0, 15.0, 30.0);
        sampleEntryResponseDTO = new EntryResponseDTO(sampleEntryId, "Pasta Carbonara", "MANUAL", LocalDateTime.of(2026, 8, 1, 12, 0), 500, 50.0, 15.0, 30.0);

        // Entry 2
        sampleEntryRequestDTO2 = new EntryRequestDTO("Chicken Salad", 300, 10.0, 8.0, 35.0);
        sampleEntryResponseDTO2 = new EntryResponseDTO(sampleEntryId2, "Chicken Salad", "MANUAL", LocalDateTime.of(2026, 8, 1, 13, 0), 300, 10.0, 8.0, 35.0);
    }


    // ---------- find Entry by User ----------


    @Test
    @DisplayName("GET /api/entry/ - Success")
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
    @DisplayName("GET /api/entry/{userId} - Success")
    void createEntry_ShouldReturn200_AndEntryDTO() throws Exception {

        when(entryService.createEntry(sampleEntryRequestDTO, sampleUserId)).thenReturn(sampleEntryResponseDTO);

        mockMvc.perform(post ("/api/entry/{userId} - Success"))
                .andExpect(status().isOk());
        verify(entryService.createEntry(sampleEntryRequestDTO, sampleUserId));
    }
}
