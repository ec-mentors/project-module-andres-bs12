package com.project.NutritionTracker.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.project.NutritionTracker.dto.UserRequestDTO;
import com.project.NutritionTracker.dto.UserResponseDTO;
import com.project.NutritionTracker.exception.NotFoundException;
import com.project.NutritionTracker.mapper.UserMapper;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository repository;
    private final UserMapper mapper;

    public UserService(UserRepository repository, UserMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @PreAuthorize("hasRole('ADMIN')")
    public UserResponseDTO findByEmail(String email) {
        if (email == null) {
            return null;
        }

        User user = repository.findByEmail(email).orElseThrow(() -> new NotFoundException("Email not found"));

        return mapper.toResponseDTO(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public UserResponseDTO findById(UUID id) {
        if (id == null) {
            return null;
        }

        User user = repository.findById(id).orElseThrow(() -> new NotFoundException("Id not found"));

        return mapper.toResponseDTO(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public UserResponseDTO findByGoogleId(String googleId) {
        if (googleId == null) {
            return null;
        }

        User user = repository.findByGoogleId(googleId).orElseThrow(() -> new NotFoundException("Id not found, Sign up"));

        return mapper.toResponseDTO(user);
    }

    @PreAuthorize("isAuthenticated() && #id == principal.id")
    public UserResponseDTO updateUser(UUID id, UserRequestDTO dto) {
        if (dto == null || id == null) {
            throw  new IllegalArgumentException("New user can't be null");
        }
        User user = repository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
        user.setFirstName(dto.firstName());
        user.setLastName(dto.lastName());
        return mapper.toResponseDTO(repository.save(user));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponseDTO> getAllUsers() {
        var enttitiesList = repository.findAll();

        return enttitiesList.stream()
                .map(mapper::toResponseDTO)
                .toList();
    }

    // This is like my login process, user exist then log in, doesn't exist then create it
    // This will get the data verified from the method "verifyAndProcessGoogleToken"
    public UserResponseDTO processGoogleAuth(UserRequestDTO dto) {

        if (dto == null || dto.googleId() == null) {
            throw new IllegalArgumentException("Invalid Google authentication payload");
        }

        Optional<User> existingUser = repository.findByGoogleId(dto.googleId());

        if (existingUser.isPresent()) {
            return mapper.toResponseDTO(existingUser.get());
        }

        User newuser = mapper.toEntity(dto);

        // set the time
        newuser.setCreatedAt(LocalDateTime.now());
        return mapper.toResponseDTO(repository.save(newuser));
    }



    // This method is not working yet since it will verify with google, for testable reason, it will not verify tokens yet
    public UserResponseDTO verifyAndProcessGoogleToken(String googleIdToken) {
        // 1. Check that is not empty
        if (googleIdToken == null || googleIdToken.isEmpty()) {
            throw new IllegalArgumentException("Token can't be empty");
        }

        try {
            // Verifier object creation
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    // Start the http client that the library will use to download the public keys
                    new NetHttpTransport(),
                    // Start the Json parser
                    new GsonFactory()
            ).build(); // build the verifier with the configuration

            // Verify if the token is valid. Check the signature with public keys, check the expiration date. If it's false returns null
            GoogleIdToken idToken = verifier.verify(googleIdToken);

            // check if the taken works (not null), if it's null will trow SecurityException
            if (idToken == null) {
                throw new SecurityException("Invalid Google token");
            }

            // get the payload object with the auth data from google
            GoogleIdToken.Payload payload = idToken.getPayload();

            UserRequestDTO dto = new UserRequestDTO(
                (String) payload.get("given_name"),
                (String) payload.get("family_name"),
                payload.getEmail(),
                payload.getSubject() // googleId
            );

            // Now if the token works, will be sent to this method.
            return processGoogleAuth(dto);

        // If anything breaks will trow error
        } catch (Exception e) {
            throw new SecurityException("Google token verification failed: " + e.getMessage());
        }
    }


}

