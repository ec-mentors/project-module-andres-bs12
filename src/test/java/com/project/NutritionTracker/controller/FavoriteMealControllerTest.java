package com.project.NutritionTracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.NutritionTracker.dto.FavoriteMealRequestDTO;
import com.project.NutritionTracker.dto.FavoriteMealResponseDTO;
import com.project.NutritionTracker.enums.MealType;
import com.project.NutritionTracker.exception.NotFoundException;
import com.project.NutritionTracker.mapper.FavoriteMealMapper;
import com.project.NutritionTracker.model.Entry;
import com.project.NutritionTracker.model.FavoriteMeal;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.UserRepository;
import com.project.NutritionTracker.service.FavoriteMealService;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FavoriteMealController.class)
@AutoConfigureMockMvc(addFilters = false)
public class FavoriteMealControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private FavoriteMealService favoriteMealService;

    @MockitoBean
    private FavoriteMealMapper mapper;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private UserRepository userRepository;

    private UUID sampleUserId;
    private UUID sampleFavoriteMealId;
    private UUID sampleEntryId;

    private User sampleUser;
    private Entry sampleEntry;
    private FavoriteMeal sampleFavoriteMeal;
    private FavoriteMealRequestDTO sampleRequestDTO;
    private FavoriteMealResponseDTO sampleResponseDTO;

    @BeforeEach
    void setUp() {
        sampleUserId = UUID.randomUUID();
        sampleFavoriteMealId = UUID.randomUUID();
        sampleEntryId = UUID.randomUUID();

        sampleUser = new User();
        sampleUser.setId(sampleUserId);

        sampleEntry = new Entry(sampleEntryId, sampleUser, "Pasta carbonara", "MANUAL", LocalDateTime.now(), 500, 50.0, 15.0, 30.0, MealType.DINNER);
        sampleFavoriteMeal = new FavoriteMeal(sampleFavoriteMealId, sampleUser, "Chicken", 100, 20.0, 30.0, 40.1, MealType.DINNER, LocalDate.now());
        sampleRequestDTO = new FavoriteMealRequestDTO("Chicken", 100, 20.0, 30.0, 40.1, MealType.DINNER);
        sampleResponseDTO = new FavoriteMealResponseDTO(sampleFavoriteMealId, "Chicken", 100, 20.0, 30.0, 40.1, MealType.DINNER, LocalDate.now());
    }

    // ---------- convertEntryToFavorite ----------

    @Test
    @DisplayName("POST /api/favorite-meal/convert/{id} - Success (200)")
    void convertEntryToFavorite_ShouldReturn200_AndFavoriteMealResponseDTO() throws Exception {
        when(favoriteMealService.convertEntryToFavorite(any(Entry.class), eq(sampleUserId)))
                .thenReturn(sampleResponseDTO);

        mockMvc.perform(post("/api/favorite-meal/convert/{id}", sampleUserId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleEntry)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(sampleFavoriteMealId.toString()))
                .andExpect(jsonPath("$.mealName").value("Chicken"))
                .andExpect(jsonPath("$.kcal").value(100))
                .andExpect(jsonPath("$.protein").value(40.1))
                .andExpect(jsonPath("$.mealType").value("dinner"));

        verify(favoriteMealService).convertEntryToFavorite(any(Entry.class), eq(sampleUserId));
    }

    @Test
    @DisplayName("POST /api/favorite-meal/convert/{id} - User Not Found (404)")
    void convertEntryToFavorite_ShouldReturn404_WhenUserNotFound() throws Exception {
        doThrow(new NotFoundException("User not found"))
                .when(favoriteMealService).convertEntryToFavorite(any(Entry.class), eq(sampleUserId));

        mockMvc.perform(post("/api/favorite-meal/convert/{id}", sampleUserId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleEntry)))
                .andExpect(status().isNotFound())
                .andExpect(content().string("User not found"));

        verify(favoriteMealService).convertEntryToFavorite(any(Entry.class), eq(sampleUserId));
    }

    @Test
    @DisplayName("POST /api/favorite-meal/convert/{id} - Invalid UUID Path Variable (400)")
    void convertEntryToFavorite_ShouldReturn400_WhenInvalidUUID() throws Exception {
        mockMvc.perform(post("/api/favorite-meal/convert/{id}", "invalid-uuid-123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleEntry)))
                .andExpect(status().isBadRequest());
    }

    // ---------- createFavorite ----------

    @Test
    @DisplayName("POST /api/favorite-meal/create/{id} - Success (201)")
    void createFavorite_ShouldReturn201_AndFavoriteMealResponseDTO() throws Exception {
        when(favoriteMealService.createFavorite(any(FavoriteMealRequestDTO.class), eq(sampleUserId)))
                .thenReturn(sampleResponseDTO);

        mockMvc.perform(post("/api/favorite-meal/create/{id}", sampleUserId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleRequestDTO)))
                .andExpect(status().isCreated())
                .andExpect(content().json(objectMapper.writeValueAsString(sampleResponseDTO)));

        verify(favoriteMealService).createFavorite(any(FavoriteMealRequestDTO.class), eq(sampleUserId));
    }

    @Test
    @DisplayName("POST /api/favorite-meal/create/{id} - User Not Found (404)")
    void createFavorite_ShouldReturn404_WhenUserNotFound() throws Exception {
        doThrow(new NotFoundException("User not found"))
                .when(favoriteMealService).createFavorite(any(FavoriteMealRequestDTO.class), eq(sampleUserId));

        mockMvc.perform(post("/api/favorite-meal/create/{id}", sampleUserId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleRequestDTO)))
                .andExpect(status().isNotFound())
                .andExpect(content().string("User not found"));

        verify(favoriteMealService).createFavorite(any(FavoriteMealRequestDTO.class), eq(sampleUserId));
    }

    // ---------- removeFavoriteMeal ----------

    @Test
    @DisplayName("DELETE /api/favorite-meal/remove/{fMealId} - Success (204)")
    void removeFavoriteMeal_ShouldReturn204() throws Exception {
        mockMvc.perform(delete("/api/favorite-meal/remove/{fMealId}", sampleFavoriteMealId))
                .andExpect(status().isNoContent());

        verify(favoriteMealService).removeFavoriteMeal(sampleFavoriteMealId);
    }

    @Test
    @DisplayName("DELETE /api/favorite-meal/remove/{fMealId} - Favorite Meal Not Found (404)")
    void removeFavoriteMeal_ShouldReturn404_WhenFavoriteMealNotFound() throws Exception {
        doThrow(new NotFoundException("Favorite meal not found with id: " + sampleFavoriteMealId))
                .when(favoriteMealService).removeFavoriteMeal(sampleFavoriteMealId);

        mockMvc.perform(delete("/api/favorite-meal/remove/{fMealId}", sampleFavoriteMealId))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Favorite meal not found with id: " + sampleFavoriteMealId));

        verify(favoriteMealService).removeFavoriteMeal(sampleFavoriteMealId);
    }

    // ---------- getAllFavorites ----------

    @Test
    @DisplayName("GET /api/favorite-meal/get-all/{id} - Success (200)")
    void getAllFavorites_ShouldReturn200_AndFavoriteMealList() throws Exception {
        List<FavoriteMealResponseDTO> expectedList = List.of(sampleResponseDTO);
        when(favoriteMealService.getAllFavorites(sampleUserId)).thenReturn(expectedList);

        mockMvc.perform(get("/api/favorite-meal/get-all/{id}", sampleUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].mealName").value("Chicken"))
                .andExpect(jsonPath("$[0].kcal").value(100));

        verify(favoriteMealService).getAllFavorites(sampleUserId);
    }

    @Test
    @DisplayName("GET /api/favorite-meal/get-all/{id} - User Not Found (404)")
    void getAllFavorites_ShouldReturn404_WhenUserNotFound() throws Exception {
        doThrow(new NotFoundException("User not found"))
                .when(favoriteMealService).getAllFavorites(sampleUserId);

        mockMvc.perform(get("/api/favorite-meal/get-all/{id}", sampleUserId))
                .andExpect(status().isNotFound())
                .andExpect(content().string("User not found"));

        verify(favoriteMealService).getAllFavorites(sampleUserId);
    }

    // ---------- findAllByUser ----------

    @Test
    @DisplayName("GET /api/favorite-meal/get-all-by-user/{id} - Success (200)")
    void findAllByUser_ShouldReturn200_AndFavoriteMealList() throws Exception {
        List<FavoriteMealResponseDTO> expectedList = List.of(sampleResponseDTO);
        when(favoriteMealService.getAllFavorites(sampleUserId)).thenReturn(expectedList);

        mockMvc.perform(get("/api/favorite-meal/get-all-by-user/{id}", sampleUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].mealName").value("Chicken"))
                .andExpect(jsonPath("$[0].kcal").value(100));

        verify(favoriteMealService).getAllFavorites(sampleUserId);
    }
}
