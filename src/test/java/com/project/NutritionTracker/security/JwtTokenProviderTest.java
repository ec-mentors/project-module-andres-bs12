package com.project.NutritionTracker.security;

import com.project.NutritionTracker.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private static final String SECRET = "super-secret-key-for-jwt-testing-minimum-256-bits-length-guaranteed";

    private JwtTokenProvider jwtTokenProvider;
    private User sampleUser;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", SECRET);
        ReflectionTestUtils.setField(jwtTokenProvider, "expirationDays", 30L);

        sampleUser = new User();
        sampleUser.setId(UUID.randomUUID());
        sampleUser.setEmail("test@example.com");
        sampleUser.setRole("USER");
    }

    @Test
    void generateToken_thenValidate_returnsUserId() {
        String token = jwtTokenProvider.generateToken(sampleUser);

        assertNotNull(token);
        assertEquals(sampleUser.getId(), jwtTokenProvider.validateTokenAndGetUserId(token));
    }

    @Test
    void validateTokenAndGetUserId_returnsNull_whenTokenIsMalformed() {
        assertNull(jwtTokenProvider.validateTokenAndGetUserId("not-a-jwt"));
    }

    @Test
    void validateTokenAndGetUserId_returnsNull_whenTokenIsTampered() {
        String token = jwtTokenProvider.generateToken(sampleUser);
        String tampered = token.substring(0, token.length() - 4) + "xxxx";

        assertNull(jwtTokenProvider.validateTokenAndGetUserId(tampered));
    }

    @Test
    void validateTokenAndGetUserId_returnsNull_whenTokenIsBlank() {
        assertNull(jwtTokenProvider.validateTokenAndGetUserId(""));
    }
}
