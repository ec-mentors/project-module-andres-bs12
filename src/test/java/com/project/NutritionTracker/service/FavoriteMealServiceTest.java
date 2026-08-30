package com.project.NutritionTracker.service;

import com.project.NutritionTracker.dto.FavoriteMealRequestDTO;
import com.project.NutritionTracker.dto.FavoriteMealResponseDTO;
import com.project.NutritionTracker.enums.MealType;
import com.project.NutritionTracker.exception.NotFoundException;
import com.project.NutritionTracker.mapper.FavoriteMealMapper;
import com.project.NutritionTracker.model.Entry;
import com.project.NutritionTracker.model.FavoriteMeal;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.FavoriteMealRepository;
import com.project.NutritionTracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FavoriteMealServiceTest {

    @Mock
    private FavoriteMealRepository favoriteMealRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FavoriteMealMapper mapper;

    @InjectMocks
    private FavoriteMealService favoriteMealService;

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
    @DisplayName("convertEntryToFavorite - Success with explicit MealType")
    void convertEntryToFavorite_ShouldReturnFavoriteMealResponseDTO() {
        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(favoriteMealRepository.save(any(FavoriteMeal.class))).thenReturn(sampleFavoriteMeal);
        when(mapper.toResponseDTO(any(FavoriteMeal.class))).thenReturn(sampleResponseDTO);

        FavoriteMealResponseDTO response = favoriteMealService.convertEntryToFavorite(sampleEntry, sampleUserId);

        assertNotNull(response);
        assertEquals(sampleResponseDTO, response);
        assertEquals(MealType.DINNER, response.mealType());
    }

    @Test
    @DisplayName("convertEntryToFavorite - Auto-infer LUNCH when MealType is null at 2:00 PM")
    void convertEntryToFavorite_WhenMealTypeIsNullAndCreatedOn2PM_ShouldSetLunch() {
        ArgumentCaptor<FavoriteMeal> mealCaptor = ArgumentCaptor.forClass(FavoriteMeal.class);
        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(favoriteMealRepository.save(any(FavoriteMeal.class))).thenReturn(sampleFavoriteMeal);
        when(mapper.toResponseDTO(any(FavoriteMeal.class))).thenReturn(sampleResponseDTO);

        sampleEntry.setMealType(null);
        sampleEntry.setCreatedOn(LocalDate.now().atTime(14, 0));

        favoriteMealService.convertEntryToFavorite(sampleEntry, sampleUserId);

        verify(favoriteMealRepository).save(mealCaptor.capture());
        FavoriteMeal saved = mealCaptor.getValue();
        assertEquals(MealType.LUNCH, saved.getMealType());
    }

    @Test
    @DisplayName("convertEntryToFavorite - Auto-infer DINNER when MealType is null at 7:00 PM")
    void convertEntryToFavorite_WhenMealTypeIsNullAndCreatedOn7PM_ShouldSetDinner() {
        ArgumentCaptor<FavoriteMeal> mealCaptor = ArgumentCaptor.forClass(FavoriteMeal.class);
        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(favoriteMealRepository.save(any(FavoriteMeal.class))).thenReturn(sampleFavoriteMeal);
        when(mapper.toResponseDTO(any(FavoriteMeal.class))).thenReturn(sampleResponseDTO);

        sampleEntry.setMealType(null);
        sampleEntry.setCreatedOn(LocalDate.now().atTime(19, 0));

        favoriteMealService.convertEntryToFavorite(sampleEntry, sampleUserId);

        verify(favoriteMealRepository).save(mealCaptor.capture());
        FavoriteMeal saved = mealCaptor.getValue();
        assertEquals(MealType.DINNER, saved.getMealType());
    }

    @Test
    @DisplayName("convertEntryToFavorite - Auto-infer BREAKFAST when MealType is null at 8:00 AM")
    void convertEntryToFavorite_WhenMealTypeIsNullAndCreatedOn8AM_ShouldSetBreakfast() {
        ArgumentCaptor<FavoriteMeal> mealCaptor = ArgumentCaptor.forClass(FavoriteMeal.class);
        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(favoriteMealRepository.save(any(FavoriteMeal.class))).thenReturn(sampleFavoriteMeal);
        when(mapper.toResponseDTO(any(FavoriteMeal.class))).thenReturn(sampleResponseDTO);

        sampleEntry.setMealType(null);
        sampleEntry.setCreatedOn(LocalDate.now().atTime(8, 0));

        favoriteMealService.convertEntryToFavorite(sampleEntry, sampleUserId);

        verify(favoriteMealRepository).save(mealCaptor.capture());
        FavoriteMeal saved = mealCaptor.getValue();
        assertEquals(MealType.BREAKFAST, saved.getMealType());
    }

    @Test
    @DisplayName("convertEntryToFavorite - Auto-infer SNACK when MealType is null at 5:00 PM")
    void convertEntryToFavorite_WhenMealTypeIsNullAndCreatedOn5PM_ShouldSetSnack() {
        ArgumentCaptor<FavoriteMeal> mealCaptor = ArgumentCaptor.forClass(FavoriteMeal.class);
        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(favoriteMealRepository.save(any(FavoriteMeal.class))).thenReturn(sampleFavoriteMeal);
        when(mapper.toResponseDTO(any(FavoriteMeal.class))).thenReturn(sampleResponseDTO);

        sampleEntry.setMealType(null);
        sampleEntry.setCreatedOn(LocalDate.now().atTime(17, 0));

        favoriteMealService.convertEntryToFavorite(sampleEntry, sampleUserId);

        verify(favoriteMealRepository).save(mealCaptor.capture());
        FavoriteMeal saved = mealCaptor.getValue();
        assertEquals(MealType.SNACK, saved.getMealType());
    }

    @Test
    @DisplayName("convertEntryToFavorite - Default to LUNCH when createdOn is null")
    void convertEntryToFavorite_WhenCreatedOnIsNull_ShouldSetLunch() {
        ArgumentCaptor<FavoriteMeal> mealCaptor = ArgumentCaptor.forClass(FavoriteMeal.class);
        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(favoriteMealRepository.save(any(FavoriteMeal.class))).thenReturn(sampleFavoriteMeal);
        when(mapper.toResponseDTO(any(FavoriteMeal.class))).thenReturn(sampleResponseDTO);

        sampleEntry.setMealType(null);
        sampleEntry.setCreatedOn(null);

        favoriteMealService.convertEntryToFavorite(sampleEntry, sampleUserId);

        verify(favoriteMealRepository).save(mealCaptor.capture());
        FavoriteMeal saved = mealCaptor.getValue();
        assertEquals(MealType.LUNCH, saved.getMealType());
    }

    @Test
    @DisplayName("convertEntryToFavorite - Throws IllegalArgumentException when userId is null")
    void convertEntryToFavorite_WhenUserIdIsNull_ShouldThrowIllegalArgumentException() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> favoriteMealService.convertEntryToFavorite(sampleEntry, null)
        );
        assertEquals("User can't be null", exception.getMessage());
    }

    @Test
    @DisplayName("convertEntryToFavorite - Throws NotFoundException when user not found")
    void convertEntryToFavorite_WhenUserNotFound_ShouldThrowNotFoundException() {
        UUID nonExistentUserId = UUID.randomUUID();
        when(userRepository.findById(nonExistentUserId)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(
                NotFoundException.class,
                () -> favoriteMealService.convertEntryToFavorite(sampleEntry, nonExistentUserId)
        );
        assertEquals("User not found", exception.getMessage());
    }

    // ---------- createFavorite ----------

    @Test
    @DisplayName("createFavorite - Success")
    void createFavorite_ShouldReturnFavoriteMealResponseDTO() {
        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(favoriteMealRepository.save(any(FavoriteMeal.class))).thenReturn(sampleFavoriteMeal);
        when(mapper.toResponseDTO(any(FavoriteMeal.class))).thenReturn(sampleResponseDTO);

        FavoriteMealResponseDTO response = favoriteMealService.createFavorite(sampleRequestDTO, sampleUserId);

        assertNotNull(response);
        assertEquals(sampleResponseDTO, response);
        assertEquals(MealType.DINNER, response.mealType());
    }

    @Test
    @DisplayName("createFavorite - Throws IllegalArgumentException when userId is null")
    void createFavorite_WhenUserIdIsNull_ShouldThrowIllegalArgumentException() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> favoriteMealService.createFavorite(sampleRequestDTO, null)
        );
        assertEquals("User can't be null", exception.getMessage());
    }

    @Test
    @DisplayName("createFavorite - Throws NotFoundException when user not found")
    void createFavorite_WhenUserNotFound_ShouldThrowNotFoundException() {
        UUID nonExistentUserId = UUID.randomUUID();
        when(userRepository.findById(nonExistentUserId)).thenReturn(Optional.empty());

        NotFoundException exception = assertThrows(
                NotFoundException.class,
                () -> favoriteMealService.createFavorite(sampleRequestDTO, nonExistentUserId)
        );
        assertEquals("User not found", exception.getMessage());
    }

    // ---------- removeFavoriteMeal ----------

    @Test
    @DisplayName("removeFavoriteMeal - Success")
    void removeFavoriteMeal_ShouldDeleteFavoriteMeal() {
        when(favoriteMealRepository.existsById(sampleFavoriteMealId)).thenReturn(true);

        favoriteMealService.removeFavoriteMeal(sampleFavoriteMealId);

        verify(favoriteMealRepository, times(1)).deleteById(sampleFavoriteMealId);
    }

    @Test
    @DisplayName("removeFavoriteMeal - Throws NotFoundException when meal not found")
    void removeFavoriteMeal_WhenMealNotFound_ShouldThrowNotFoundException() {
        when(favoriteMealRepository.existsById(sampleFavoriteMealId)).thenReturn(false);

        NotFoundException exception = assertThrows(
                NotFoundException.class,
                () -> favoriteMealService.removeFavoriteMeal(sampleFavoriteMealId)
        );
        assertTrue(exception.getMessage().contains("Favorite meal not found with id"));
        verify(favoriteMealRepository, never()).deleteById(any());
    }

    // ---------- getAllFavorites ----------

    @Test
    @DisplayName("getAllFavorites - Success")
    void getAllFavorites_ShouldReturnFavoriteMealList() {
        List<FavoriteMealResponseDTO> expectedList = List.of(sampleResponseDTO);
        when(userRepository.existsById(sampleUserId)).thenReturn(true);
        when(favoriteMealRepository.findAllByUserId(sampleUserId)).thenReturn(List.of(sampleFavoriteMeal));
        when(mapper.toResponseDTO(sampleFavoriteMeal)).thenReturn(sampleResponseDTO);

        List<FavoriteMealResponseDTO> result = favoriteMealService.getAllFavorites(sampleUserId);

        assertEquals(expectedList, result);
        verify(favoriteMealRepository).findAllByUserId(sampleUserId);
    }

    @Test
    @DisplayName("getAllFavorites - Throws NotFoundException when user not found")
    void getAllFavorites_WhenUserNotFound_ShouldThrowNotFoundException() {
        when(userRepository.existsById(sampleUserId)).thenReturn(false);

        NotFoundException exception = assertThrows(
                NotFoundException.class,
                () -> favoriteMealService.getAllFavorites(sampleUserId)
        );
        assertEquals("User not found", exception.getMessage());
    }

    // ---------- updateFavorite ----------

    @Test
    @DisplayName("updateFavorite - Success")
    void updateFavorite_ShouldReturnUpdatedFavoriteMealResponseDTO() {
        FavoriteMealRequestDTO updateRequest = new FavoriteMealRequestDTO("Kebab", 1403, 53.0, 23.0, 40.1, MealType.LUNCH);
        FavoriteMealResponseDTO updatedResponse = new FavoriteMealResponseDTO(sampleFavoriteMealId, "Kebab", 1403, 53.0, 23.0, 40.1, MealType.LUNCH, LocalDate.now());

        when(favoriteMealRepository.findById(sampleFavoriteMealId)).thenReturn(Optional.of(sampleFavoriteMeal));
        when(favoriteMealRepository.save(sampleFavoriteMeal)).thenReturn(sampleFavoriteMeal);
        when(mapper.toResponseDTO(sampleFavoriteMeal)).thenReturn(updatedResponse);

        FavoriteMealResponseDTO response = favoriteMealService.updateFavorite(updateRequest, sampleFavoriteMealId);

        assertNotNull(response);
        assertEquals(updatedResponse, response);

        verify(favoriteMealRepository, times(1)).findById(sampleFavoriteMealId);
        verify(favoriteMealRepository, times(1)).save(sampleFavoriteMeal);
        verify(mapper, times(1)).toResponseDTO(sampleFavoriteMeal);
    }

    @Test
    @DisplayName("updateFavorite - Throws NotFoundException when meal not found")
    void updateFavorite_WhenMealNotFound_ShouldThrowNotFoundException() {
        when(favoriteMealRepository.findById(sampleFavoriteMealId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> favoriteMealService.updateFavorite(sampleRequestDTO, sampleFavoriteMealId));
        verify(favoriteMealRepository, never()).save(any());
    }
}
