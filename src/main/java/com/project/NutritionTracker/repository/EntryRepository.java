package com.project.NutritionTracker.repository;

import com.project.NutritionTracker.model.Entry;
import com.project.NutritionTracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface EntryRepository extends JpaRepository<Entry, UUID> {

    List<Entry> findByUser(User user);


    // This method is a sql request
    // SELECT * FROM entry
    // WHERE user_id = 'n'
    //  AND created_on BETWEEN 'date' AND 'date';
    List<Entry> findByUserAndCreatedOnBetween(User user, LocalDateTime start, LocalDateTime end);
}
