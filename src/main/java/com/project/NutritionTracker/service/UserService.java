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
import org.springframework.stereotype.Service;

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

    // Old version
//    public UserResponseDTO createUser(UserRequestDTO dto) {
//
//        if (dto == null) {
//            return null;
//        }
//
//        if (repository.findByEmail(dto.getEmail()).isPresent()) {
//            throw new RuntimeException("Email already register, Log in");
//        }
//
//        // Here ios possible to do it directly because User is a main entity, do not depend on anything else I have to assign,for example
//        // the other entities needed and assigned user "manually". User has already all the data needed, and the date is created on the mapper
//        User user = mapper.toEntity(dto);
//
//        return mapper.toResponseDTO(repository.save(user));
//    }


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

    // This is like my login process, user exist then log in, doesn't exist then create it
    // This will get the data verified from the method "verifyAndProcessGoogleToken"
    public UserResponseDTO processGoogleAuth(UserRequestDTO dto) {

        if (dto == null || dto.getGoogleId() == null) {
            throw new IllegalArgumentException("Invalid Google authentication payload");
        }

        Optional<User> existingUser = repository.findByGoogleId(dto.getGoogleId());

        if (existingUser.isPresent()) {
            return mapper.toResponseDTO(existingUser.get());
        }

        User newuser = mapper.toEntity(dto);
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

            // This is a request since will be sent to another method not to the user yet.
            UserRequestDTO dto = new UserRequestDTO();

            // Subject in JWT contains the identifier. (googleId)
            dto.setGoogleId(payload.getSubject());
            dto.setEmail(payload.getEmail());
            dto.setFirstName((String) payload.get("given_name"));
            dto.setLastName((String) payload.get("family_name"));

            // Now if the token works, will be sent to this method.
            return processGoogleAuth(dto);

        // If anything breaks will trow error
        } catch (Exception e) {
            throw new SecurityException("Google token verification failed: " + e.getMessage());
        }
    }


}

