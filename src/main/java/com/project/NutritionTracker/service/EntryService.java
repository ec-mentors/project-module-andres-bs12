package com.project.NutritionTracker.service;

import com.project.NutritionTracker.dto.EntryRequestDTO;
import com.project.NutritionTracker.dto.EntryResponseDTO;
import com.project.NutritionTracker.exception.NotFoundException;
import com.project.NutritionTracker.mapper.EntryMapper;
import com.project.NutritionTracker.model.Entry;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.EntryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class EntryService {
    private final EntryMapper mapper;
    private final EntryRepository repository;

    public EntryService(EntryMapper mapper, EntryRepository repository) {
        this.mapper = mapper;
        this.repository = repository;
    }

    public List<EntryResponseDTO> findByUser(User user) {
        if (user == null) {
            return List.of();
        }
        return repository.findByUser(user).stream().map(mapper::toResponseDTO).toList();
    }

    public EntryResponseDTO createEntry(EntryRequestDTO dto, User user) {
        Entry entry = mapper.toEntity(dto);
        entry.setUser(user);
        Entry savedEntry = repository.save(entry);
        return mapper.toResponseDTO(savedEntry);
    }

    public void removeEntry(UUID id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("Entry not found");
        }
    }

    public List<EntryResponseDTO> findTodayEntriesByUser(User user) {

        if (user == null) {
            return List.of();
        }

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        // This method is a sql request
        // SELECT * FROM entry
        // WHERE user_id = 'n'
        //  AND created_on BETWEEN 'date' AND 'date';
        return repository.findByUserAndCreatedOnBetween(user, startOfDay, endOfDay).stream()
                .map(mapper::toResponseDTO)
                .toList();
    }

    public EntryResponseDTO updateEntry(UUID id, EntryRequestDTO dto) {

        Entry entry = repository.findById(id).orElseThrow(() -> new NotFoundException("Entry not found"));

        entry.setCarbs(dto.getCarbs());
        entry.setFat(dto.getFat());
        entry.setMealName(dto.getMealName());
        entry.setProtein(dto.getProtein());
        entry.setKcal(dto.getKcal());

        repository.save(entry);

        return mapper.toResponseDTO(entry);
    }



}
