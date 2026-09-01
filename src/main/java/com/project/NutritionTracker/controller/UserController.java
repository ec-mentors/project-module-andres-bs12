package com.project.NutritionTracker.controller;

import com.project.NutritionTracker.dto.AuthResponseDTO;
import com.project.NutritionTracker.dto.UserRequestDTO;
import com.project.NutritionTracker.dto.UserResponseDTO;
import com.project.NutritionTracker.exception.NotFoundException;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.UserRepository;
import com.project.NutritionTracker.service.UserService;
import jakarta.validation.Valid;
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

    // Response entity represents the complete HTTP response sent back to the client

    // Controller not connected to google verification yet for testable reasons.
    // To make it work with Google, the method 'processGoogleAuth' should be called instead of 'processGoogleAuth'

    // Request body, it's expecting a json object to be sent as key value
    @PostMapping("/auth/google")
    public ResponseEntity<AuthResponseDTO> authWithGoogle(@Valid  @RequestBody String googleId) {
        AuthResponseDTO response = service.verifyAndProcessGoogleToken(googleId); // not auth yet

        return ResponseEntity.ok(response); // code 200, converts java object to json
    }



    // @RequesTParam is needed because we need to receive an email. it comes from the URL after the ?
    // http://localhost:8080/api/user/search?email=andres.postman@example.com
    @GetMapping("/search")
    public ResponseEntity<UserResponseDTO> findByEmail(@Valid @RequestParam String email) {
        UserResponseDTO user = service.findByEmail(email);
        return ResponseEntity.ok(user); // Code 200. Automatically generated with .ok java object converted to json
    }

    // Path variable to use the variable inside mapping
    // PathVariable -> to identify unique resources,
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> findById(@PathVariable UUID id) {
        UserResponseDTO user = service.findById(id);
        return ResponseEntity.ok(user); // Code 200. Automatically generated with .ok
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable UUID id, // Since this is on the path
            @Valid @RequestBody UserRequestDTO dto) { // Since this one is a json object
        UserResponseDTO user = service.updateUser(id, dto);

        return ResponseEntity.ok(user); // code 200 // object to json
    }

    @GetMapping()
    public ResponseEntity<List<UserResponseDTO>> findAllUsers() {
        return ResponseEntity.ok(service.getAllUsers());
    }

}
