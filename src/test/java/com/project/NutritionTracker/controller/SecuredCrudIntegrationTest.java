package com.project.NutritionTracker.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.UserRepository;
import com.project.NutritionTracker.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SecuredCrudIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private User owner;
    private User otherUser;
    private String ownerToken;
    private String otherToken;

    @BeforeEach
    void setUp() {
        owner = persistUser("owner@example.com", "google-owner");
        otherUser = persistUser("other@example.com", "google-other");
        ownerToken = jwtTokenProvider.generateToken(owner);
        otherToken = jwtTokenProvider.generateToken(otherUser);
    }

    @Test
    @DisplayName("Authenticated owner can create, list, update and delete an entry")
    void ownerCanCreateUpdateAndDeleteEntry() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/entry/{userId}", owner.getId())
                        .header("Authorization", bearer(ownerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "mealName": "Overnight oats",
                                  "kcal": 420,
                                  "carbs": 55.0,
                                  "fat": 12.0,
                                  "protein": 18.0,
                                  "mealType": "breakfast"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.mealName").value("Overnight oats"))
                .andExpect(jsonPath("$.kcal").value(420))
                .andExpect(jsonPath("$.mealType").value("breakfast"))
                .andReturn();

        String entryId = readId(created);

        mockMvc.perform(get("/api/entry/{userId}", owner.getId())
                        .header("Authorization", bearer(ownerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(entryId));

        mockMvc.perform(put("/api/entry/{entryId}/update", entryId)
                        .header("Authorization", bearer(ownerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "mealName": "Overnight oats with berries",
                                  "kcal": 480,
                                  "carbs": 62.0,
                                  "fat": 13.0,
                                  "protein": 20.0,
                                  "mealType": "lunch"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mealName").value("Overnight oats with berries"))
                .andExpect(jsonPath("$.kcal").value(480))
                .andExpect(jsonPath("$.mealType").value("lunch"));

        mockMvc.perform(delete("/api/entry/{entryId}", entryId)
                        .header("Authorization", bearer(ownerToken)))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Create entry without JWT is forbidden")
    void createEntryWithoutTokenIsForbidden() throws Exception {
        mockMvc.perform(post("/api/entry/{userId}", owner.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "mealName": "Oats",
                                  "kcal": 300,
                                  "carbs": 40.0,
                                  "fat": 8.0,
                                  "protein": 12.0,
                                  "mealType": "breakfast"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Cannot create or mutate another user's entries")
    void cannotAccessAnotherUsersEntries() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/entry/{userId}", owner.getId())
                        .header("Authorization", bearer(ownerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "mealName": "Owner meal",
                                  "kcal": 250,
                                  "carbs": 20.0,
                                  "fat": 10.0,
                                  "protein": 15.0,
                                  "mealType": "dinner"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        String entryId = readId(created);

        mockMvc.perform(post("/api/entry/{userId}", owner.getId())
                        .header("Authorization", bearer(otherToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "mealName": "Intruder meal",
                                  "kcal": 100,
                                  "carbs": 10.0,
                                  "fat": 2.0,
                                  "protein": 8.0,
                                  "mealType": "snack"
                                }
                                """))
                .andExpect(status().isForbidden());

        mockMvc.perform(put("/api/entry/{entryId}/update", entryId)
                        .header("Authorization", bearer(otherToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "mealName": "Hacked meal",
                                  "kcal": 1,
                                  "carbs": 1.0,
                                  "fat": 1.0,
                                  "protein": 1.0,
                                  "mealType": "snack"
                                }
                                """))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/entry/{entryId}", entryId)
                        .header("Authorization", bearer(otherToken)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Authenticated owner can create a goal")
    void ownerCanCreateGoal() throws Exception {
        mockMvc.perform(post("/api/goal/{userId}", owner.getId())
                        .header("Authorization", bearer(ownerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "kcal": 2100,
                                  "carbs": 220.0,
                                  "fat": 70.0,
                                  "protein": 160.0
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.kcal").value(2100));
    }

    @Test
    @DisplayName("Create entry without mealType infers it on the backend")
    void createEntryWithoutMealTypeInfersIt() throws Exception {
        mockMvc.perform(post("/api/entry/{userId}", owner.getId())
                        .header("Authorization", bearer(ownerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "mealName": "Oats",
                                  "kcal": 300,
                                  "carbs": 40.0,
                                  "fat": 8.0,
                                  "protein": 12.0
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.mealName").value("Oats"))
                .andExpect(jsonPath("$.mealType").isNotEmpty());
    }

    private User persistUser(String email, String googleId) {
        User user = new User();
        user.setEmail(email);
        user.setGoogleId(googleId);
        user.setFirstName("Test");
        user.setLastName("User");
        user.setRole("USER");
        return userRepository.save(user);
    }

    private static String bearer(String token) {
        return "Bearer " + token;
    }

    private String readId(MvcResult result) throws Exception {
        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        return body.get("id").asText();
    }
}
