package com.project.NutritionTracker.service;

import com.project.NutritionTracker.dto.EntryRequestDTO;
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
import com.project.NutritionTracker.security.UserPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
public class FavoriteMealService {

    private final FavoriteMealMapper mapper;
    private final UserRepository userRepository;
    private final FavoriteMealRepository favoriteMealRepository;

    public FavoriteMealService(FavoriteMealMapper mapper, UserRepository userRepository, FavoriteMealRepository favoriteMealRepository) {
        this.mapper = mapper;
        this.userRepository = userRepository;
        this.favoriteMealRepository = favoriteMealRepository;
    }

    @PreAuthorize("isAuthenticated() && #userId == principal.id")
    public FavoriteMealResponseDTO convertEntryToFavorite(Entry entry, UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("new user can't be null");
        }
        User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        FavoriteMeal favoriteMeal = new FavoriteMeal();
        favoriteMeal.setProtein(entry.getProtein());
        favoriteMeal.setMealName(entry.getMealName());
        favoriteMeal.setCarbs(entry.getCarbs());
        favoriteMeal.setFat(entry.getFat());
        favoriteMeal.setKcal(entry.getKcal());
        favoriteMeal.setUser(user);
        favoriteMeal.setCreatedAt(LocalDate.now());
        favoriteMeal.setMealType(entry.getMealType());
        if (favoriteMeal.getMealType() == null) {
            if (entry.getCreatedOn() == null) {
                favoriteMeal.setMealType(MealType.LUNCH);
            } else {
                LocalTime timeCreated = entry.getCreatedOn().toLocalTime();
                if (timeCreated.isBefore(LocalTime.NOON)) {
                    favoriteMeal.setMealType(MealType.BREAKFAST);
                } else if (timeCreated.isBefore(LocalTime.of(16, 0))) {
                    favoriteMeal.setMealType(MealType.LUNCH);
                } else if (timeCreated.isBefore(LocalTime.of(19, 0))) {
                    favoriteMeal.setMealType(MealType.SNACK);
                } else {
                    favoriteMeal.setMealType(MealType.DINNER);
                }
            }
        }
        // To get the id and send it back
        FavoriteMeal savedMeal = favoriteMealRepository.save(favoriteMeal);
        return mapper.toResponseDTO(savedMeal);
    }

    @PreAuthorize("isAuthenticated() && #userId == principal.id")
    public FavoriteMealResponseDTO createFavorite(FavoriteMealRequestDTO dto, UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User can't be null");
        }
        User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));

        FavoriteMeal favoriteMeal = new FavoriteMeal();
        favoriteMeal.setMealName(dto.mealName());
        favoriteMeal.setProtein(dto.protein());
        favoriteMeal.setFat(dto.fat());
        favoriteMeal.setKcal(dto.kcal());
        favoriteMeal.setCarbs(dto.carbs());
        favoriteMeal.setCreatedAt(LocalDate.now());
        favoriteMeal.setUser(user);
        favoriteMeal.setMealType(dto.mealType());

        FavoriteMeal savedMeal = favoriteMealRepository.save(favoriteMeal);
        return mapper.toResponseDTO(savedMeal);
    }

    @PreAuthorize("isAuthenticated() && @favoriteMealSecurity.isOwner(#fMealId, principal)")
    public void removeFavoriteMeal(UUID fMealId) {
        if (!favoriteMealRepository.existsById(fMealId)) {
            throw new NotFoundException("Favorite meal not found with id: " + fMealId);
        }
        favoriteMealRepository.deleteById(fMealId);
    }

    @PreAuthorize("isAuthenticated() && #userId == principal.id")
    public List<FavoriteMealResponseDTO> getAllFavorites(UUID userId) {
        if (userRepository.existsById(userId)) {
            return favoriteMealRepository.findAllByUserId(userId).stream().map(mapper::toResponseDTO).toList();
        } else throw new NotFoundException("User not found");
    }


    @PreAuthorize("isAuthenticated() && @favoriteMealSecurity.isOwner(#fMealId, principal)")
    public FavoriteMealResponseDTO updateFavorite(FavoriteMealRequestDTO dto, UUID fMealId) {
        FavoriteMeal actualFavoriteMeal = favoriteMealRepository.findById(fMealId).orElseThrow(() -> new NotFoundException("Entry not found"));

        actualFavoriteMeal.setProtein(dto.protein());
        actualFavoriteMeal.setMealName(dto.mealName());
        actualFavoriteMeal.setCarbs(dto.carbs());
        actualFavoriteMeal.setFat(dto.fat());
        actualFavoriteMeal.setKcal(dto.kcal());
        actualFavoriteMeal.setMealType(dto.mealType());

        FavoriteMeal saved = favoriteMealRepository.save(actualFavoriteMeal);
        return mapper.toResponseDTO(saved);
    }

}

