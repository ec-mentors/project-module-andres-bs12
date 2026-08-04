package com.project.NutritionTracker.mapper;

import com.project.NutritionTracker.dto.UserRequestDTO;
import com.project.NutritionTracker.dto.UserResponseDTO;
import com.project.NutritionTracker.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "telegramChatId", ignore = true)
    User toEntity(UserRequestDTO dto);

    // Automatic output
    UserResponseDTO toResponseDTO(User user);
    }
