package com.project.NutritionTracker.controller;

import com.project.NutritionTracker.dto.UserRequestDTO;
import com.project.NutritionTracker.dto.UserResponseDTO;
import com.project.NutritionTracker.exception.NotFoundException;
import com.project.NutritionTracker.service.UserService;
import com.project.NutritionTracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@WebMvcTest(UserController.class) // Tells spring, just start the layer to use UserController
@AutoConfigureMockMvc(addFilters = false) // Deactivate Spring boot security filters
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private UserRepository userRepository;


    private UUID sampleId;
    private String sampleEmail;
    private UserResponseDTO sampleResponseDTO;
    private UserRequestDTO sampleRequestDTO;

    // Sample 2
    private UUID sampleId2;
    private String sampleEmail2;
    private UserResponseDTO sampleResponseDTO2;
    private UserRequestDTO sampleRequestDTO2;


    @BeforeEach
    void setUp() {
        sampleId = UUID.randomUUID();
        sampleEmail = "text@example.com";
        sampleResponseDTO = new UserResponseDTO("John", sampleId, "Doe", sampleEmail, LocalDateTime.of(2026, 8, 1, 12, 0), "google-123");
        sampleRequestDTO = new UserRequestDTO("John", "Doe", sampleEmail, "google-123");

        // Sample 2
        sampleId2 = UUID.randomUUID();
        sampleEmail2 = "felixwhite@gmail.com";
        sampleResponseDTO2 = new UserResponseDTO("Felix", sampleId2, "White", sampleEmail2, LocalDateTime.of(2026, 8, 1, 12, 0), "googleId1234");
        sampleRequestDTO2 = new UserRequestDTO("Felix", "White", sampleEmail2, "googleId1234");
    }


    // ---------- findByEmail ----------

    @Test
    @DisplayName("GET /api/user/search - Success")
    void findByEmail_ShouldReturn200_AndUserResponseDTO() throws Exception {

        when(userService.findByEmail(sampleEmail)).thenReturn(sampleResponseDTO);

        mockMvc.perform(get("/api/user/search").param("email", sampleEmail)).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(sampleId.toString())).andExpect(jsonPath("$.firstName").value("John")).andExpect(jsonPath("$.email").value(sampleEmail));

        verify(userService).findByEmail(sampleEmail);
    }

    @Test
    @DisplayName("GET /api/user/search - Email not found(404)")
    void findByEmail_WhenNotFound_Returns404() throws Exception {
        String fakeEmail = "fake@email.com";
        when(userService.findByEmail(fakeEmail)).thenThrow(new NotFoundException(("Email not found")));

        mockMvc.perform(get("/api/user/search").param("email", fakeEmail)).andExpect(status().isNotFound());

        verify(userService).findByEmail(fakeEmail);
    }


    // ---------- findById ----------

    @Test
    @DisplayName("GET /api/user/{id} - Success")
    void findById_ShouldReturn200_AndUserResponseDTO() throws Exception {

        when(userService.findById(sampleId)).thenReturn(sampleResponseDTO);

        mockMvc.perform(get("/api/user/{id}", sampleId)).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(sampleId.toString())).andExpect(jsonPath("$.firstName").value("John")).andExpect(jsonPath("$.email").value(sampleEmail));

        verify(userService).findById(sampleId);
    }

    @Test
    @DisplayName("GET /api/user/{id} - User not found(404)")
    void findById_WhenIdDoesNotExist_ShouldReturn404() throws Exception {
        UUID fakeId = UUID.randomUUID();
        when(userService.findById(fakeId)).thenThrow(new NotFoundException("Id not found"));

        mockMvc.perform(get("/api/user/{id}", fakeId)).andExpect(status().isNotFound());
        verify(userService).findById(fakeId);
    }


    // ---------- findAllUsers ----------

    @Test
    @DisplayName("GET /api/user - Success")
    void findByAllUsers_ShouldReturn200_AndListOfUserResponseDTO() throws Exception {
        List<UserResponseDTO> userList = List.of(sampleResponseDTO, sampleResponseDTO2);
        when(userService.getAllUsers()).thenReturn(userList);

        mockMvc.perform(get("/api/user")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(2)).andExpect(jsonPath("$[0].id").value(sampleId.toString())).andExpect(jsonPath("$[1].id").value(sampleId2.toString())).andExpect(jsonPath("$[0].firstName").value("John")).andExpect(jsonPath("$[1].firstName").value("Felix")).andExpect(jsonPath("$[0].email").value(sampleEmail)).andExpect(jsonPath("$[1].email").value(sampleEmail2));

        verify(userService).getAllUsers();
    }


    // ---------- UpdateUser ----------


    @Test
    @DisplayName("PUT /api/user/{id} - Success")
    void updateUser_ShouldReturn200_AndUserResponseDTO() throws Exception {

        UserResponseDTO updatedResponse = new UserResponseDTO("Felix", sampleId, "White", sampleEmail, LocalDateTime.of(2026, 8, 1, 12, 0), "google-123");

        when(userService.updateUser(sampleId, sampleRequestDTO2)).thenReturn(updatedResponse);

        mockMvc.perform(put("/api/user/{id}", sampleId).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(sampleRequestDTO2))).andExpect(status().isOk()).andExpect(jsonPath("$.firstName").value("Felix")).andExpect(jsonPath("$.lastName").value("White")).andExpect(jsonPath("$.email").value(sampleEmail));

        verify(userService).updateUser(sampleId, sampleRequestDTO2);
    }

    @Test
    @DisplayName("PUT /api/user/{id} - User not found (404)")
    void updateUser_WhenUserDoesNotExist_ShouldReturn404() throws Exception {

        UUID fakeId = UUID.randomUUID();

        when(userService.updateUser(eq(fakeId), any(UserRequestDTO.class))).thenThrow(new NotFoundException("User not found"));

        mockMvc.perform(put("/api/user/{id}", fakeId).contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(sampleRequestDTO2))).andExpect(status().isNotFound());

        verify(userService).updateUser(eq(fakeId), any(UserRequestDTO.class));
    }


    // ---------- authWithGoogle ----------


    @Test
    @DisplayName("POST /api/user/auth/google - Success")
    void authWithGoogle_ShouldReturn200_AndUserResponseDTO() throws Exception {
        String googleIdToken = "google-token-123";
        when(userService.verifyAndProcessGoogleToken(googleIdToken)).thenReturn(sampleResponseDTO);

        mockMvc.perform(post("/api/user/auth/google").contentType(MediaType.TEXT_PLAIN).content(googleIdToken)).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(sampleId.toString())).andExpect(jsonPath("$.firstName").value("John")).andExpect(jsonPath("$.email").value(sampleEmail));

        verify(userService).verifyAndProcessGoogleToken(googleIdToken);
    }

    @Test
    @DisplayName("POST /api/user/auth/google - Not found (404)")
    void authWithGoogle_WhenTokenIsNotValid_ShouldReturn404() throws Exception {
        String fakeGoogleId = "fake-googleId";
        when(userService.verifyAndProcessGoogleToken(fakeGoogleId)).thenThrow(new NotFoundException(("Id nor found, Sign up")));

        mockMvc.perform(post("/api/user/auth/google").contentType(MediaType.TEXT_PLAIN).content(fakeGoogleId)).andExpect(status().isNotFound());

        verify(userService).verifyAndProcessGoogleToken(fakeGoogleId);
    }

}


