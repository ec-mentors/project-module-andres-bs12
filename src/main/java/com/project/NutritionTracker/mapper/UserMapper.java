package com.project.NutritionTracker.mapper;

import com.project.NutritionTracker.dto.UserRequestDTO;
import com.project.NutritionTracker.dto.UserResponseDTO;
import com.project.NutritionTracker.model.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component // This means it is a Spring component. Now Spring manage it.
public class UserMapper {

    // Convert DTO input -> Entity user
    public User toEntity(UserRequestDTO dto) {

        if (dto == null) {
            return null;
        }

        User user = new User();
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setGoogleId(dto.getGoogleId());
        user.setCreatedAt(LocalDateTime.now());

        return user;
    }

    // Convert Entity user to safe returnable DTO
    public UserResponseDTO toResponseDTO(User user) {
        if (user == null) {
            return null;
        }

        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setGoogleId(user.getGoogleId());

        return dto;
    }
}
