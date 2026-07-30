package com.project.NutritionTracker.service;

import com.project.NutritionTracker.dto.UserRequestDTO;
import com.project.NutritionTracker.dto.UserResponseDTO;
import com.project.NutritionTracker.exception.NotFoundException;
import com.project.NutritionTracker.mapper.UserMapper;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository repository;
    private final UserMapper mapper;

    public UserService(UserRepository repository, UserMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public UserResponseDTO createUser(UserRequestDTO dto) {

        if (dto == null) {
            return null;
        }

        if (repository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already register, Log in");
        }

        // Here ios possible to do it directly because User is a main entity, do not depend on anything else I have to assign,for example
        // the other entities needed and assigned user "manually". User has already all the data needed, and the date is created on the mapper
        User user = mapper.toEntity(dto);

        return mapper.toResponseDTO(repository.save(user));
    }


    public UserResponseDTO findByEmail(String email) {
        if (email == null) {
            return null;
        }

        User user = repository.findByEmail(email).orElseThrow(() -> new NotFoundException("Email not found, Sign up"));

        return mapper.toResponseDTO(user);
    }


    public UserResponseDTO findById(UUID id) {
        if (id == null) {
            return null;
        }

        User user = repository.findById(id).orElseThrow(() -> new NotFoundException("Id not found, Sign up"));

        return mapper.toResponseDTO(user);
    }

    public UserResponseDTO findByGoogleId(String googleId) {
        if (googleId == null) {
            return null;
        }

        User user = repository.findByGoogleId(googleId).orElseThrow(() -> new NotFoundException("Id not found, Sign up"));

        return mapper.toResponseDTO(user);
    }

    public UserResponseDTO updateUser(UUID id, UserRequestDTO dto) {
        User user = repository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
            user.setFirstName(dto.getFirstName());
            user.setLastName(dto.getLastName());
            return mapper.toResponseDTO(repository.save(user));
        }

        public List<UserResponseDTO> getAllUsers() {
            var enttitiesList = repository.findAll();

            return enttitiesList.stream()
                    .map(mapper::toResponseDTO)
                    .toList();
        }


}

