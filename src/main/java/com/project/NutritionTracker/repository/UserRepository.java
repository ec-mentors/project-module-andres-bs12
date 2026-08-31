package com.project.NutritionTracker.repository;

import com.project.NutritionTracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository <User, UUID> {

    // To find a user by email when log in
    Optional<User> findByEmail(String email); // to make request with a legible identifier, if I want to show the email instead of Google id

    Optional<User> findByGoogleId(String googleId);

    Optional<User> findByTelegramChatId(Long telegramChatId);

}
