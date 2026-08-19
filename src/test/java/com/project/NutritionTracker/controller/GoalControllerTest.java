package com.project.NutritionTracker.controller;

import com.project.NutritionTracker.dto.GoalRequestDTO;
import com.project.NutritionTracker.dto.GoalResponseDTO;
import com.project.NutritionTracker.exception.NotFoundException;
import com.project.NutritionTracker.repository.UserRepository;
import com.project.NutritionTracker.service.GoalService;
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

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GoalController.class)
@AutoConfigureMockMvc(addFilters = false)
public class GoalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private GoalService goalService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private UserRepository userRepository;

    // User ID
    private UUID sampleUserId;

    // Goal 1
    private UUID sampleGoalId;
    private GoalRequestDTO sampleGoalRequestDTO;
    private GoalResponseDTO sampleGoalResponseDTO;

    // Goal 2
    private UUID sampleGoalId2;
    private GoalRequestDTO sampleGoalRequestDTO2;
    private GoalResponseDTO sampleGoalResponseDTO2;

    @BeforeEach
    void setUp() {
        sampleUserId = UUID.randomUUID();
        sampleGoalId = UUID.randomUUID();
        sampleGoalId2 = UUID.randomUUID();

        // Goal 1
        sampleGoalRequestDTO = new GoalRequestDTO(2000, 250.0, 65.0, 150.0);
        sampleGoalResponseDTO = new GoalResponseDTO(sampleGoalId, LocalDate.of(2026, 8, 1), 2000, 250.0, 65.0, 150.0);

        // Goal 2
        sampleGoalRequestDTO2 = new GoalRequestDTO(2200, 270.0, 70.0, 160.0);
        sampleGoalResponseDTO2 = new GoalResponseDTO(sampleGoalId2, LocalDate.of(2026, 8, 2), 2200, 270.0, 70.0, 160.0);
    }

    // ---------- createGoal ----------

    @Test
    @DisplayName("POST /api/goal/{userId} - Success")
    void createGoal_ShouldReturn201_AndGoalResponseDTO() throws Exception {
        when(goalService.createGoal(sampleGoalRequestDTO, sampleUserId)).thenReturn(sampleGoalResponseDTO);

        mockMvc.perform(post("/api/goal/{userId}", sampleUserId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleGoalRequestDTO)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/goal/" + sampleGoalId))
                .andExpect(jsonPath("$.id").value(sampleGoalId.toString()))
                .andExpect(jsonPath("$.kcal").value(2000))
                .andExpect(jsonPath("$.carbs").value(250.0))
                .andExpect(jsonPath("$.fat").value(65.0))
                .andExpect(jsonPath("$.protein").value(150.0));

        verify(goalService).createGoal(sampleGoalRequestDTO, sampleUserId);
    }

    // ---------- updateGoal ----------

    @Test
    @DisplayName("PUT /api/goal/{goalId} - Success")
    void updateGoal_ShouldReturn200_AndGoalResponseDTO() throws Exception {
        when(goalService.updateGoal(sampleGoalId, sampleGoalRequestDTO2)).thenReturn(sampleGoalResponseDTO2);

        mockMvc.perform(put("/api/goal/{goalId}", sampleGoalId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleGoalRequestDTO2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(sampleGoalId2.toString()))
                .andExpect(jsonPath("$.kcal").value(2200))
                .andExpect(jsonPath("$.carbs").value(270.0))
                .andExpect(jsonPath("$.fat").value(70.0))
                .andExpect(jsonPath("$.protein").value(160.0));

        verify(goalService).updateGoal(sampleGoalId, sampleGoalRequestDTO2);
    }

    @Test
    @DisplayName("PUT /api/goal/{goalId} - Not Found (404)")
    void updateGoal_WhenGoalDoesNotExist_ShouldReturn404() throws Exception {
        UUID fakeGoalId = UUID.randomUUID();
        when(goalService.updateGoal(eq(fakeGoalId), any(GoalRequestDTO.class)))
                .thenThrow(new NotFoundException("Goal not found"));

        mockMvc.perform(put("/api/goal/{goalId}", fakeGoalId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleGoalRequestDTO2)))
                .andExpect(status().isNotFound());

        verify(goalService).updateGoal(eq(fakeGoalId), any(GoalRequestDTO.class));
    }

    // ---------- getGoalByUserAndDate ----------

    @Test
    @DisplayName("GET /api/goal/user/{userId}/date - Success")
    void getGoalByUserAndDate_ShouldReturn200_AndGoalResponseDTO() throws Exception {
        LocalDate date = LocalDate.of(2026, 8, 1);
        when(goalService.getGoalByUserAndDate(sampleUserId, date)).thenReturn(sampleGoalResponseDTO);

        mockMvc.perform(get("/api/goal/user/{userId}/date", sampleUserId)
                        .param("date", "2026-08-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(sampleGoalId.toString()))
                .andExpect(jsonPath("$.kcal").value(2000))
                .andExpect(jsonPath("$.startDate").value("2026-08-01"));

        verify(goalService).getGoalByUserAndDate(sampleUserId, date);
    }

    // ---------- getAllGoalsByUser ----------

    @Test
    @DisplayName("GET /api/goal/user/{userId}/all - Success")
    void getAllGoalsByUser_ShouldReturn200_AndListOfGoalResponseDTO() throws Exception {
        List<GoalResponseDTO> goalList = List.of(sampleGoalResponseDTO, sampleGoalResponseDTO2);
        when(goalService.findAllGoalsByUser(sampleUserId)).thenReturn(goalList);

        mockMvc.perform(get("/api/goal/user/{userId}/all", sampleUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(sampleGoalId.toString()))
                .andExpect(jsonPath("$[0].kcal").value(2000))
                .andExpect(jsonPath("$[1].id").value(sampleGoalId2.toString()))
                .andExpect(jsonPath("$[1].kcal").value(2200));

        verify(goalService).findAllGoalsByUser(sampleUserId);
    }
}
