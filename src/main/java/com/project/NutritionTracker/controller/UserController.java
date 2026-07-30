package com.project.NutritionTracker.controller;

import com.project.NutritionTracker.dto.UserRequestDTO;
import com.project.NutritionTracker.dto.UserResponseDTO;
import com.project.NutritionTracker.exception.NotFoundException;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.UserRepository;
import com.project.NutritionTracker.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }


    @PostMapping("/auth/google")
    public ResponseEntity<UserResponseDTO> authWithGoogle(@RequestBody UserRequestDTO dto) {
        UserResponseDTO response = service.processGoogleAuth(dto);

        return ResponseEntity.ok(response);
    }



    // @RequesTParam is needed because we need to receive an email. it comes from the URL after the ?
    // http://localhost:8080/api/user/search?email=andres.postman@example.com
    @GetMapping("/search")
    public ResponseEntity<UserResponseDTO> findByEmail(@RequestParam String email) {
        UserResponseDTO user = service.findByEmail(email);
        return ResponseEntity.ok(user); // Code 200. Automatically generated with .ok
    }

    // Path variable to use the variable inside mapping
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> findById(@PathVariable UUID id) {
        UserResponseDTO user = service.findById(id);
        return ResponseEntity.ok(user); // Code 200. Automatically generated with .ok
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable UUID id, // Since this is on the path
            @RequestBody UserRequestDTO dto) { // Since this one is a json object
        UserResponseDTO user = service.updateUser(id, dto);

        return ResponseEntity.ok(user);
    }

    @GetMapping()
    public ResponseEntity<List<UserResponseDTO>> findAllUsers() {
        return ResponseEntity.ok(service.getAllUsers());
    }

}
