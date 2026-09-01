package com.project.NutritionTracker.security;

import com.project.NutritionTracker.model.FavoriteMeal;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.FavoriteMealRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FavoriteMealSecurityTest {

    @Mock
    private FavoriteMealRepository favoriteMealRepository;

    @InjectMocks
    private FavoriteMealSecurity favoriteMealSecurity;

    private UUID favoriteMealId;
    private UUID ownerId;
    private UserPrincipal ownerPrincipal;

    @BeforeEach
    void setUp() {
        favoriteMealId = UUID.randomUUID();
        ownerId = UUID.randomUUID();
        ownerPrincipal = new UserPrincipal(user(ownerId));
    }

    @Test
    void isOwner_returnsTrue_whenAuthenticatedUserOwnsFavorite() {
        when(favoriteMealRepository.findById(favoriteMealId))
                .thenReturn(Optional.of(favoriteMeal(favoriteMealId, ownerId)));

        assertTrue(favoriteMealSecurity.isOwner(favoriteMealId, ownerPrincipal));
    }

    @Test
    void isOwner_returnsFalse_whenAnotherUserOwnsFavorite() {
        when(favoriteMealRepository.findById(favoriteMealId))
                .thenReturn(Optional.of(favoriteMeal(favoriteMealId, UUID.randomUUID())));

        assertFalse(favoriteMealSecurity.isOwner(favoriteMealId, ownerPrincipal));
    }

    @Test
    void isOwner_returnsFalse_whenFavoriteDoesNotExist() {
        when(favoriteMealRepository.findById(favoriteMealId)).thenReturn(Optional.empty());

        assertFalse(favoriteMealSecurity.isOwner(favoriteMealId, ownerPrincipal));
    }

    @Test
    void isOwner_returnsFalse_whenIdOrPrincipalIsMissing() {
        assertFalse(favoriteMealSecurity.isOwner(null, ownerPrincipal));
        assertFalse(favoriteMealSecurity.isOwner(favoriteMealId, null));
        assertFalse(favoriteMealSecurity.isOwner(favoriteMealId, new UserPrincipal(user(null))));
    }

    private static User user(UUID id) {
        User user = new User();
        user.setId(id);
        user.setEmail("owner@example.com");
        user.setRole("USER");
        return user;
    }

    private static FavoriteMeal favoriteMeal(UUID id, UUID userId) {
        FavoriteMeal meal = new FavoriteMeal();
        meal.setId(id);
        meal.setUser(user(userId));
        return meal;
    }
}
