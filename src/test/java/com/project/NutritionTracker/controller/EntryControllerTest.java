package com.project.NutritionTracker.controller;

import com.project.NutritionTracker.dto.EntryRequestDTO;
import com.project.NutritionTracker.dto.EntryResponseDTO;
import com.project.NutritionTracker.exception.NotFoundException;
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

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.project.NutritionTracker.repository.UserRepository;

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
    @DisplayName("post /api/entry/{userId} - Success")
    void createEntry_ShouldReturn200_AndEntryDTO() throws Exception {

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
    @DisplayName("post /api/entry/{entryId} - Success")
    void removeEntry_ShouldReturn204() throws Exception {

        mockMvc.perform(delete("/api/entry/{entryId}", sampleEntryId))
                .andExpect(status().isNoContent());

        verify(entryService).removeEntry(sampleEntryId);
    }

    @Test
    @DisplayName("post /api/entry/{entryId} - Not Found (404)")
    void removeEntry_WhenEntryIdDoesNotExist_ShouldReturn404() throws Exception {
        UUID fakeEntryId = UUID.randomUUID();

        doThrow(new NotFoundException("Entry not found"))
                .when(entryService).removeEntry(fakeEntryId);

        mockMvc.perform(delete("/api/entry/{entryId}", fakeEntryId))
                .andExpect(status().isNotFound());

        verify(entryService).removeEntry(fakeEntryId);
    }

    // ---------- get Today entries ----------


    @Test
    @DisplayName("get /api/entry/{userId}/today - Success")
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
    @DisplayName("put /api/entry/{entryId}/update - success")
    void updateEntry_return200_AndEntry() throws Exception {

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

}
