package com.project.NutritionTracker.service;

import com.project.NutritionTracker.dto.EntryRequestDTO;
import com.project.NutritionTracker.dto.EntryResponseDTO;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ExtendWith(MockitoExtension.class)
public class FavoriteMealServiceTest {

    @Mock
    FavoriteMealRepository repository;

    @Mock
    UserRepository userRepository;

    @Mock
    FavoriteMealMapper mapper;

    @InjectMocks
    private FavoriteMealService fService;

    private FavoriteMeal sampleFavoriteMeal;
    private User sampleUser;
    private Entry sampleEntry;

    private FavoriteMealRequestDTO fMealRequestDTO;
    private FavoriteMealResponseDTO fMealResponseDTO;

    private UUID mockFavouriteId;
    private UUID mockUserId;
    private UUID mockEntryId;


    @BeforeEach
    void setUp() {
        mockFavouriteId = UUID.randomUUID();
        mockUserId = UUID.randomUUID();

        sampleUser = new User();
        sampleUser.setId(mockUserId);

        sampleFavoriteMeal = new FavoriteMeal(mockFavouriteId, sampleUser, "Chicken", 100, 20.0, 30.0, 40.1, MealType.DINNER, LocalDate.now());
        fMealResponseDTO = new FavoriteMealResponseDTO(mockFavouriteId, "Chicken", 100, 20.0, 30.0, 40.1, MealType.DINNER, LocalDate.now());
        fMealRequestDTO = new FavoriteMealRequestDTO("Chicken", 100, 20.0, 30.0, 40.1, MealType.DINNER);
        sampleEntry = new Entry(mockEntryId, sampleUser, "Pasta carbonara", "MANUAL", LocalDateTime.now(), 500, 50.0, 15.0, 30.0, MealType.DINNER);

    }

    // convert entry to favourite


    @Test
    void convertEntryToFavourite() {
        when(userRepository.findById(any())).thenReturn(Optional.of(sampleUser));
        when(mapper.toResponseDTO(any())).thenReturn(fMealResponseDTO);

        var response = fService.convertEntryToFavorite(sampleEntry, mockUserId);

        assertEquals(fMealResponseDTO, response);
        assertEquals(MealType.DINNER, response.mealType());
    }


    @Test
    void convertEntryToFavourite_whenMealTypeIsNullAndCreatedAt2PM_shouldSetLunch() {
        // to capture mealType
        ArgumentCaptor<FavoriteMeal> mealCaptor = ArgumentCaptor.forClass(FavoriteMeal.class);
        when(userRepository.findById(mockUserId)).thenReturn(Optional.of(sampleUser));

        sampleEntry.setMealType(null);
        sampleEntry.setCreatedOn(LocalDate.now().atTime(14, 0));

        fService.convertEntryToFavorite(sampleEntry, mockUserId);

        verify(repository).save(mealCaptor.capture());

        FavoriteMeal saved = mealCaptor.getValue();

        assertEquals(MealType.LUNCH, saved.getMealType());
    }

    @Test
    void convertEntryToFavourite_whenMealTypeIsNullAndCreatedAt7PM_shouldSetDinner() {
        // to capture mealType
        ArgumentCaptor<FavoriteMeal> mealCaptor = ArgumentCaptor.forClass(FavoriteMeal.class);
        when(userRepository.findById(mockUserId)).thenReturn(Optional.of(sampleUser));

        sampleEntry.setMealType(null);
        sampleEntry.setCreatedOn(LocalDate.now().atTime(19, 0));

        fService.convertEntryToFavorite(sampleEntry, mockUserId);

        verify(repository).save(mealCaptor.capture());

        FavoriteMeal saved = mealCaptor.getValue();

        assertEquals(MealType.DINNER, saved.getMealType());
    }

    @Test
    void convertEntryToFavourite_whenMealTypeIsNullAndCreatedAt8AM_shouldSetBreakfast() {
        // to capture mealType
        ArgumentCaptor<FavoriteMeal> mealCaptor = ArgumentCaptor.forClass(FavoriteMeal.class);
        when(userRepository.findById(mockUserId)).thenReturn(Optional.of(sampleUser));

        sampleEntry.setMealType(null);
        sampleEntry.setCreatedOn(LocalDate.now().atTime(8, 0));

        fService.convertEntryToFavorite(sampleEntry, mockUserId);

        verify(repository).save(mealCaptor.capture());

        FavoriteMeal saved = mealCaptor.getValue();

        assertEquals(MealType.BREAKFAST, saved.getMealType());
    }

    @Test
    void convertEntryToFavourite_whenMealTypeIsNullAndCreatedAt5PM_shouldSetSnack() {
        // to capture mealType
        ArgumentCaptor<FavoriteMeal> mealCaptor = ArgumentCaptor.forClass(FavoriteMeal.class);
        when(userRepository.findById(mockUserId)).thenReturn(Optional.of(sampleUser));

        sampleEntry.setMealType(null);
        sampleEntry.setCreatedOn(LocalDate.now().atTime(17, 0));

        fService.convertEntryToFavorite(sampleEntry, mockUserId);

        verify(repository).save(mealCaptor.capture());

        FavoriteMeal saved = mealCaptor.getValue();

        assertEquals(MealType.SNACK, saved.getMealType());
    }

    @Test
    void convertEntryToFavourite_whenCreatedOnIsNull_shouldSetToDinner() {
        // to capture mealType
        ArgumentCaptor<FavoriteMeal> mealCaptor = ArgumentCaptor.forClass(FavoriteMeal.class);
        when(userRepository.findById(mockUserId)).thenReturn(Optional.of(sampleUser));

        sampleEntry.setMealType(null);
        sampleEntry.setCreatedOn(null);

        fService.convertEntryToFavorite(sampleEntry, mockUserId);

        verify(repository).save(mealCaptor.capture());

        FavoriteMeal saved = mealCaptor.getValue();

        assertEquals(MealType.LUNCH, saved.getMealType());
    }

    @Test
    void convertEntryToFavourite_ifUserIdIsNull_throwIAE() {
        assertThrows(IllegalArgumentException.class, () -> fService.convertEntryToFavorite(sampleEntry, null));
    }

    @Test
    void convertEntryToFavourite_ifUserIdIsNotFound_throwNFE() {
        UUID fakeid = UUID.randomUUID();
        when(userRepository.findById(fakeid)).thenThrow(NotFoundException.class);
        assertThrows(NotFoundException.class, () -> fService.convertEntryToFavorite(sampleEntry, fakeid));
    }


    // Create favourite


    @Test
    void createFavourite() {
        when(userRepository.findById(any())).thenReturn(Optional.of(sampleUser));
        when(mapper.toResponseDTO(any())).thenReturn(fMealResponseDTO);

        var response = fService.createFavorite(fMealRequestDTO, mockUserId);

        assertEquals(fMealResponseDTO, response);
        assertEquals(MealType.DINNER, response.mealType());
    }


    @Test
    void createFavourite_ifUserIdIsNull_throwIAE() {
        assertThrows(IllegalArgumentException.class, () -> fService.createFavorite(fMealRequestDTO, null));
    }

    @Test
    void createFavourite_ifUserIdIsNotFound_throwNFE() {
        UUID fakeid = UUID.randomUUID();
        when(userRepository.findById(fakeid)).thenThrow(NotFoundException.class);
        assertThrows(NotFoundException.class, () -> fService.createFavorite(fMealRequestDTO, fakeid));
    }


    // removeFavoriteMeal


    @Test
    void removeFavoriteMeal() {
        when(repository.existsById(mockFavouriteId)).thenReturn(true);
        fService.removeFavoriteMeal(mockFavouriteId);
        verify(repository, times(1)).deleteById(mockFavouriteId);
    }

    @Test
    void removeFavoriteMeal_ifMealNotFound_ThrowsNFE() {
        when(repository.existsById(mockFavouriteId)).thenReturn(false);
        assertThrows(NotFoundException.class, () -> fService.removeFavoriteMeal(mockFavouriteId));
        verify(repository, times(0)).deleteById(mockFavouriteId);
    }


    // get all favorites

    @Test
    void getAllFavorites() {
        List<FavoriteMealResponseDTO> expected = List.of(fMealResponseDTO);
        when(userRepository.existsById(mockUserId)).thenReturn(true);
        when(repository.findAllByUserId(mockUserId)).thenReturn(List.of(sampleFavoriteMeal));
        when(mapper.toResponseDTO(sampleFavoriteMeal)).thenReturn(fMealResponseDTO);

        var result = fService.getAllFavorites(mockUserId);
        assertEquals(expected, result);
    }

    @Test
    void getAllFavorites_ifUserNotFound_ThrowsNFE() {
        when(userRepository.existsById(mockUserId)).thenReturn(false);
        assertThrows(NotFoundException.class, () -> fService.getAllFavorites(mockUserId));
    }


    // update favorite

    @Test
    void updateFavorite() {
        FavoriteMealRequestDTO newDTO = new FavoriteMealRequestDTO("Kebab", 1403, 53.0, 23.0, 40.1, MealType.LUNCH);
        FavoriteMealResponseDTO expected = new FavoriteMealResponseDTO(mockEntryId, "Kebab", 1403, 53.0, 23.0, 40.1, MealType.LUNCH, LocalDate.now());

        when(repository.findById(mockEntryId)).thenReturn(Optional.of(sampleFavoriteMeal));
        when(repository.save(sampleFavoriteMeal)).thenReturn(sampleFavoriteMeal);
        when(mapper.toResponseDTO(sampleFavoriteMeal)).thenReturn(expected);

        var response = fService.updateFavorite(newDTO, mockEntryId);
        assertNotNull(response);
        assertEquals(expected, response);

        verify(repository, times(1)).findById(mockEntryId);
        verify(repository, times(1)).save(sampleFavoriteMeal);
        verify(mapper, times(1)).toResponseDTO(sampleFavoriteMeal);
    }

    @Test
    void updateEntry_ThrowsIAE_WhenDTOIsNull() {
        UUID fakeid = UUID.randomUUID();
        assertThrows(NotFoundException.class, () -> fService.updateFavorite(fMealRequestDTO, fakeid));
    }
}
