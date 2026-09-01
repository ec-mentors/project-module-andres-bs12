package com.project.NutritionTracker.security;

import com.project.NutritionTracker.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UserPrincipalTest {

    @Test
    void exposesUserIdentityAndRoleAuthority() {
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);
        user.setEmail("admin@example.com");
        user.setRole("ADMIN");

        UserPrincipal principal = new UserPrincipal(user);

        assertEquals(userId, principal.getId());
        assertEquals("admin@example.com", principal.getUsername());
        assertTrue(principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals));
    }
}
