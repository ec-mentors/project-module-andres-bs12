package com.project.NutritionTracker.repository;

import com.project.NutritionTracker.model.Entry;
import com.project.NutritionTracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EntryRepository extends JpaRepository<Entry, UUID> {

    List<Entry> findByUser(User user);
}
