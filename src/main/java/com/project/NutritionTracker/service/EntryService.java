package com.project.NutritionTracker.service;

import com.project.NutritionTracker.dto.DailyProgressDTO;
import com.project.NutritionTracker.dto.EntryRequestDTO;
import com.project.NutritionTracker.dto.EntryResponseDTO;
import com.project.NutritionTracker.enums.MealType;
import com.project.NutritionTracker.exception.NotFoundException;
import com.project.NutritionTracker.mapper.EntryMapper;
import com.project.NutritionTracker.model.Entry;
import com.project.NutritionTracker.model.Goal;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.EntryRepository;
import com.project.NutritionTracker.repository.GoalRepository;
import com.project.NutritionTracker.repository.UserRepository;
import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.security.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class EntryService {
    private final EntryMapper mapper;
    private final EntryRepository repository;
    private final UserRepository uRepository;
    private final GoalRepository gRepository;


    public EntryService(EntryMapper mapper, EntryRepository repository, UserRepository uRepository, GoalRepository gRepository) {
        this.mapper = mapper;
        this.repository = repository;
        this.uRepository = uRepository;
        this.gRepository = gRepository;
    }

    @PreAuthorize("isAuthenticated() && #userId == principal.id")
    public List<EntryResponseDTO> findByUser(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User can't be null");
        }

        User user = uRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found with id: " + userId));

        return repository.findByUser(user).stream().map(mapper::toResponseDTO).toList();
    }

    @PreAuthorize("isAuthenticated() && #userId == principal.id")
    public EntryResponseDTO createEntry(EntryRequestDTO dto, UUID userId) {
        if (dto == null || userId == null) {
            throw new IllegalArgumentException("dto and user must not be null");
        }
        User user = uRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found with id: " + userId));
        Entry entry = mapper.toEntity(dto);

        entry.setUser(user);
        entry.setCreatedOn(LocalDateTime.now());
        if (entry.getMealType() == null) {
            entry.setMealType(inferMealType(entry.getCreatedOn()));
        }
        Entry savedEntry = repository.save(entry);
        return mapper.toResponseDTO(savedEntry);
    }

    @PreAuthorize("isAuthenticated() && @entrySecurity.isOwner(#id, principal)")
    public void removeEntry(UUID id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("Entry not found");
        }
    }

    @PreAuthorize("isAuthenticated() && #userId == principal.id")
    public List<EntryResponseDTO> findTodayEntriesByUser(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("UserId can't be null");
        }

        User user = uRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found with id: " + userId));

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        return repository.findByUserAndCreatedOnBetween(user, startOfDay, endOfDay).stream()
                .map(mapper::toResponseDTO)
                .toList();
    }

    @PreAuthorize("isAuthenticated() && @entrySecurity.isOwner(#id, principal)")
    public EntryResponseDTO updateEntry(UUID id, EntryRequestDTO dto) {

        if (dto == null) {
            throw new IllegalArgumentException("DTO can't be null");
        }

        Entry entry = repository.findById(id).orElseThrow(() -> new NotFoundException("Entry not found"));

        entry.setCarbs(dto.carbs());
        entry.setFat(dto.fat());
        entry.setMealName(dto.mealName());
        entry.setProtein(dto.protein());
        entry.setKcal(dto.kcal());
        if (dto.mealType() != null) {
            entry.setMealType(dto.mealType());
        }

        repository.save(entry);

        return mapper.toResponseDTO(entry);
    }

    @PreAuthorize("isAuthenticated() && #userId == principal.id")
    public DailyProgressDTO getLeftToday(UUID userId) {

        if (userId == null) {
            throw new IllegalArgumentException("User can't be null");
        }
        User user = uRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found with id: " + userId));

        var todayEntries = findTodayEntriesByUser(userId);

        int consumedKcal = todayEntries.stream().mapToInt(EntryResponseDTO::kcal).sum();
        double consumedCarbs = todayEntries.stream().mapToDouble(EntryResponseDTO::carbs).sum();
        double consumedFat = todayEntries.stream().mapToDouble(EntryResponseDTO::fat).sum();
        double consumedProtein = todayEntries.stream().mapToDouble(EntryResponseDTO::protein).sum();

        Goal goal = gRepository.findFirstByUserOrderByStartDateDesc(user).orElseThrow(() -> new NotFoundException("No goal found fot user. please set your goals first"));

        Integer remainingKcal = goal.getKcal() - consumedKcal;
        double remainingCarbs = Math.max(0.0, goal.getCarbs() - consumedCarbs);
        double remainingFat = Math.max(0.0, goal.getFat() - consumedFat);
        double remainingProtein = Math.max(0.0, goal.getProtein() - consumedProtein);

        return new DailyProgressDTO(remainingKcal, remainingCarbs, remainingFat, remainingProtein);
    }

    private MealType inferMealType(LocalDateTime createdOn) {
        if (createdOn == null) {
            return MealType.LUNCH;
        }
        LocalTime timeCreated = createdOn.toLocalTime();
        if (timeCreated.isBefore(LocalTime.NOON)) {
            return MealType.BREAKFAST;
        }
        if (timeCreated.isBefore(LocalTime.of(16, 0))) {
            return MealType.LUNCH;
        }
        if (timeCreated.isBefore(LocalTime.of(19, 0))) {
            return MealType.SNACK;
        }
        return MealType.DINNER;
    }


}
