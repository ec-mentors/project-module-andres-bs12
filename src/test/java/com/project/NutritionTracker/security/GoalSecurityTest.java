package com.project.NutritionTracker.security;

import com.project.NutritionTracker.model.Goal;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.GoalRepository;
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
class GoalSecurityTest {

    @Mock
    private GoalRepository goalRepository;

    @InjectMocks
    private GoalSecurity goalSecurity;

    private UUID goalId;
    private UUID ownerId;
    private UserPrincipal ownerPrincipal;

    @BeforeEach
    void setUp() {
        goalId = UUID.randomUUID();
        ownerId = UUID.randomUUID();
        ownerPrincipal = new UserPrincipal(user(ownerId));
    }

    @Test
    void isOwner_returnsTrue_whenAuthenticatedUserOwnsGoal() {
        when(goalRepository.findById(goalId)).thenReturn(Optional.of(goal(goalId, ownerId)));

        assertTrue(goalSecurity.isOwner(goalId, ownerPrincipal));
    }

    @Test
    void isOwner_returnsFalse_whenAnotherUserOwnsGoal() {
        when(goalRepository.findById(goalId)).thenReturn(Optional.of(goal(goalId, UUID.randomUUID())));

        assertFalse(goalSecurity.isOwner(goalId, ownerPrincipal));
    }

    @Test
    void isOwner_returnsFalse_whenGoalDoesNotExist() {
        when(goalRepository.findById(goalId)).thenReturn(Optional.empty());

        assertFalse(goalSecurity.isOwner(goalId, ownerPrincipal));
    }

    @Test
    void isOwner_returnsFalse_whenIdOrPrincipalIsMissing() {
        assertFalse(goalSecurity.isOwner(null, ownerPrincipal));
        assertFalse(goalSecurity.isOwner(goalId, null));
        assertFalse(goalSecurity.isOwner(goalId, new UserPrincipal(user(null))));
    }

    private static User user(UUID id) {
        User user = new User();
        user.setId(id);
        user.setEmail("owner@example.com");
        user.setRole("USER");
        return user;
    }

    private static Goal goal(UUID id, UUID userId) {
        Goal goal = new Goal();
        goal.setId(id);
        goal.setUser(user(userId));
        return goal;
    }
}
