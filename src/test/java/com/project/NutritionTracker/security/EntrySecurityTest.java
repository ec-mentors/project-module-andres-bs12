package com.project.NutritionTracker.security;

import com.project.NutritionTracker.model.Entry;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.EntryRepository;
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
class EntrySecurityTest {

    @Mock
    private EntryRepository entryRepository;

    @InjectMocks
    private EntrySecurity entrySecurity;

    private UUID entryId;
    private UUID ownerId;
    private UserPrincipal ownerPrincipal;

    @BeforeEach
    void setUp() {
        entryId = UUID.randomUUID();
        ownerId = UUID.randomUUID();
        ownerPrincipal = new UserPrincipal(user(ownerId));
    }

    @Test
    void isOwner_returnsTrue_whenAuthenticatedUserOwnsEntry() {
        when(entryRepository.findById(entryId)).thenReturn(Optional.of(entry(entryId, ownerId)));

        assertTrue(entrySecurity.isOwner(entryId, ownerPrincipal));
    }

    @Test
    void isOwner_returnsFalse_whenAnotherUserOwnsEntry() {
        when(entryRepository.findById(entryId)).thenReturn(Optional.of(entry(entryId, UUID.randomUUID())));

        assertFalse(entrySecurity.isOwner(entryId, ownerPrincipal));
    }

    @Test
    void isOwner_returnsFalse_whenEntryDoesNotExist() {
        when(entryRepository.findById(entryId)).thenReturn(Optional.empty());

        assertFalse(entrySecurity.isOwner(entryId, ownerPrincipal));
    }

    @Test
    void isOwner_returnsFalse_whenIdOrPrincipalIsMissing() {
        assertFalse(entrySecurity.isOwner(null, ownerPrincipal));
        assertFalse(entrySecurity.isOwner(entryId, null));
        assertFalse(entrySecurity.isOwner(entryId, new UserPrincipal(user(null))));
    }

    private static User user(UUID id) {
        User user = new User();
        user.setId(id);
        user.setEmail("owner@example.com");
        user.setRole("USER");
        return user;
    }

    private static Entry entry(UUID id, UUID userId) {
        Entry entry = new Entry();
        entry.setId(id);
        entry.setUser(user(userId));
        return entry;
    }
}
