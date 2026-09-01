package com.project.NutritionTracker.service;

import com.project.NutritionTracker.dto.AuthResponseDTO;
import com.project.NutritionTracker.dto.UserRequestDTO;
import com.project.NutritionTracker.dto.UserResponseDTO;
import com.project.NutritionTracker.exception.NotFoundException;
import com.project.NutritionTracker.mapper.UserMapper;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.UserRepository;
import com.project.NutritionTracker.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) // Allows mockito without starting Spring
public class UserServiceTest {

    @Mock
    private UserRepository repository;
    @Mock
    private UserMapper mapper;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @InjectMocks
    private UserService service;

    private User sampleUser;
    private UserResponseDTO sampleResponseDTO;
    private UserRequestDTO sampleRequestDTO;
    private UUID sampleId;
    private String sampleEmail;
    private String sampleGoogleId;
    // Sample 2
    private UserResponseDTO sampleResponseDTO2;

    @BeforeEach
    void setUp() {
        sampleId = UUID.randomUUID();
        sampleEmail = "test@example.com";
        sampleGoogleId = "google-123";

        sampleUser = new User(sampleId, sampleGoogleId, "John", "Doe", sampleEmail, null, LocalDateTime.of(2026, 8, 1, 10, 1), "USER");
        sampleResponseDTO = new UserResponseDTO("John", sampleId, "Doe", sampleEmail, LocalDateTime.of(2026, 8, 1, 10, 1), "google-123", null);
        sampleRequestDTO = new UserRequestDTO("John", "Doe", sampleEmail, "google-123");

        //sample 2
        sampleResponseDTO2 = new UserResponseDTO("Denis", sampleId, "Manson", sampleEmail, LocalDateTime.of(2026, 8, 1, 10, 1), "google-123", null);
    }


    // ----------   findByEmail ---------


    @Test
    void findByEmailSuccess() {
        // Given
        when(repository.findByEmail(sampleEmail)).thenReturn(Optional.of(sampleUser));
        when(mapper.toResponseDTO(sampleUser)).thenReturn(sampleResponseDTO);
        // When
        UserResponseDTO result = service.findByEmail(sampleEmail);
        // Then
        assertNotNull(result);
        assertEquals(sampleEmail, result.email());
        verify(repository, times(1)).findByEmail(sampleEmail);
        verify(mapper, times(1)).toResponseDTO(sampleUser);
    }

    @Test
    void findByEmail_ReturnsNull_WhenEmailIsNull() {
        UserResponseDTO result = service.findByEmail(null);

        assertNull(result);
        verify(repository, never()).findByEmail(any());
    }

    @Test
    void findByEmail_ThrowsNotFoundException_WhenEmailDoesNotExist() {

        when(repository.findByEmail("nouser@example.com")).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.findByEmail("nouser@example.com"));
        verify(repository, times(1)).findByEmail("nouser@example.com");
    }


    // ----------   findById ---------


    @Test
    void findByIdSuccess() {
        // Given
        when(repository.findById(sampleId)).thenReturn(Optional.of(sampleUser));
        when(mapper.toResponseDTO(sampleUser)).thenReturn(sampleResponseDTO);
        // When
        UserResponseDTO result = service.findById(sampleId);
        // Then
        assertNotNull(result);
        assertEquals(sampleId, result.id());
        verify(repository, times(1)).findById(sampleId);
        verify(mapper, times(1)).toResponseDTO(sampleUser);
    }

    @Test
    void findById_ReturnsNull_WhenIdIsNull() {
        UserResponseDTO result = service.findById(null);

        assertNull(result);
        verify(repository, never()).findById(any());
    }

    @Test
    void findById_ThrowsNotFoundException_WhenIdDoesNotExist() {
        UUID nonExistingId = UUID.randomUUID();
        when(repository.findById(nonExistingId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.findById(nonExistingId));
        verify(repository, times(1)).findById(nonExistingId);
    }


    // ----------   findByGoogleId ---------


    @Test
    void findByGoogleId() {
        // Given
        when(repository.findByGoogleId(sampleGoogleId)).thenReturn(Optional.of(sampleUser));
        when(mapper.toResponseDTO(sampleUser)).thenReturn(sampleResponseDTO);
        // When
        UserResponseDTO result = service.findByGoogleId(sampleGoogleId);
        // Then
        assertNotNull(result);
        assertEquals(sampleGoogleId, result.googleId());
        verify(repository, times(1)).findByGoogleId(sampleGoogleId);
        verify(mapper, times(1)).toResponseDTO(sampleUser);
    }

    @Test
    void findByGoogleId_ReturnsNull_WhenNullGId() {
        // When
        UserResponseDTO result = service.findByGoogleId(null);
        // Then
        assertNull(result);
        verify(repository, never()).findByGoogleId(null);
    }

    @Test
    void findByGoogleId__TrowsNotFoundException_WhenGIdDoesNotExist() {
        when(repository.findByGoogleId("NonGoogleId")).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> service.findByGoogleId("NonGoogleId"));
        verify(repository, times(1)).findByGoogleId("NonGoogleId");
    }


    // ----------   Update User ---------


    @Test
    void updateUser() {
        UserRequestDTO userRequestDTO = new UserRequestDTO("Denis", "Manson", sampleEmail, sampleGoogleId);
        // Given
        when(repository.findById(sampleId)).thenReturn(Optional.of(sampleUser));
        when(repository.save(sampleUser)).thenReturn(sampleUser);
        when(mapper.toResponseDTO(sampleUser)).thenReturn(sampleResponseDTO2);
        // When
        UserResponseDTO responseDTO = service.updateUser(sampleId, userRequestDTO);
        // Then
        assertNotNull(responseDTO);
        assertEquals(sampleResponseDTO2, responseDTO);
        assertEquals("Denis", sampleUser.getFirstName());
        assertEquals("Manson", sampleUser.getLastName());
    }

    @Test
    void updateUser_ThrowsNullPointerException_WhenDTOIsNull() {
        assertThrows(IllegalArgumentException.class, () -> service.updateUser(sampleId, null));
        verify(repository, never()).findById(any());
    }

    @Test
    void updateUser_ThrowsNullPointerException_WhenIdIsNull() {
        assertThrows(IllegalArgumentException.class, () -> service.updateUser(null, sampleRequestDTO));
        verify(repository, never()).findById(any());
    }

    @Test
    void updateUser_TrowsNotFoundException_WhenIdIsNotFound() {
        UUID nonExistingId = UUID.randomUUID();
        when(repository.findById(nonExistingId)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> service.updateUser(nonExistingId, sampleRequestDTO));
        verify(repository, times(1)).findById(nonExistingId);
    }


    // ----------   Update User ---------


    @Test
    void getAllUsers() {
        // Given
        when(repository.findAll()).thenReturn(List.of(sampleUser));
        when(mapper.toResponseDTO(sampleUser)).thenReturn(sampleResponseDTO);
        // When
        List<UserResponseDTO> response = service.getAllUsers();
        // Then
        assertNotNull(response);
        assertEquals(1, response.size());
        assertTrue(response.contains(sampleResponseDTO));
        verify(repository, times(1)).findAll();
        verify(mapper, times(1)).toResponseDTO(sampleUser);
    }

    @Test
    void getAllUsers_ReturnsEmptyList_WhenNoUsersExist() {
        // Given
        when(repository.findAll()).thenReturn(List.of());
        // When
        List<UserResponseDTO> response = service.getAllUsers();
        // Then
        assertNotNull(response);
        assertTrue(response.isEmpty());
        verify(repository, times(1)).findAll();
        verify(mapper, never()).toResponseDTO(any());
    }


    // ----------   ProcessGoogleAuth ---------


    @Test
    void ProcessGoogleAuth_NullTrowsException() {
        assertThrows(IllegalArgumentException.class, () -> service.processGoogleAuth(null));
    }

    @Test
    void ProcessGoogleAuth_ExistingUserLogsIn_WithoutSaving() {
        when(repository.findByGoogleId(sampleGoogleId)).thenReturn(Optional.of(sampleUser));
        when(mapper.toResponseDTO(sampleUser)).thenReturn(sampleResponseDTO);
        when(jwtTokenProvider.generateToken(sampleUser)).thenReturn("mocked-jwt-token");

        AuthResponseDTO result = service.processGoogleAuth(sampleRequestDTO);

        assertNotNull(result);
        assertEquals(sampleResponseDTO, result.userResponseDTO());
        assertEquals("mocked-jwt-token", result.token());
        verify(repository, never()).save(any());
    }

    @Test
    void ProcessGoogleAuth_NonExistingUserLogsIn_Saving() {
        when(repository.findByGoogleId(sampleGoogleId)).thenReturn(Optional.empty());
        when(mapper.toResponseDTO(sampleUser)).thenReturn(sampleResponseDTO);
        when(mapper.toEntity(sampleRequestDTO)).thenReturn(sampleUser);
        when(repository.save(sampleUser)).thenReturn(sampleUser);
        when(jwtTokenProvider.generateToken(sampleUser)).thenReturn("mocked-jwt-token");

        AuthResponseDTO result = service.processGoogleAuth(sampleRequestDTO);

        assertNotNull(result);
        assertEquals(sampleResponseDTO, result.userResponseDTO());
        assertEquals("mocked-jwt-token", result.token());
        verify(repository, times(1)).save(sampleUser);
    }

    @Test
    void ProcessGoogleAuth_NullGoogleId_ThrowsException() {
        UserRequestDTO invalidDTO = new UserRequestDTO("John", "Doe", sampleEmail, null);

        assertThrows(IllegalArgumentException.class, () -> service.processGoogleAuth(invalidDTO));
    }
}


