package com.project.NutritionTracker.service;

import com.project.NutritionTracker.dto.EntryRequestDTO;
import com.project.NutritionTracker.dto.EntryResponseDTO;
import com.project.NutritionTracker.enums.MealType;
import com.project.NutritionTracker.exception.NotFoundException;
import com.project.NutritionTracker.mapper.EntryMapper;
import com.project.NutritionTracker.model.Entry;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.EntryRepository;
import com.project.NutritionTracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EntryServiceTest {

    @Mock
    private EntryRepository repository;

    @Mock
    private UserRepository uRepository;

    @Mock
    private EntryMapper mapper;

    @InjectMocks
    private EntryService service;

    private Entry sampleEntry;
    private User sampleUser;
    private EntryResponseDTO sampleEntryResponseDTO;
    private EntryRequestDTO sampleEntryRequestDTO;

    private UUID sampleId;
    private UUID sampleUserId;


    @BeforeEach
    void setUp() {
        sampleUserId = UUID.randomUUID();
        sampleId = UUID.randomUUID();

        sampleUser = new User();
        sampleUser.setId(sampleId);

        sampleEntry = new Entry(sampleId, sampleUser, "Pasta carbonara", "MANUAL", LocalDateTime.now(), 500, 50.0, 15.0, 30.0, MealType.BREAKFAST);

        sampleEntryRequestDTO = new EntryRequestDTO("Pasta Carbonara", 500, 50.0, 15.0, 30.0, MealType.BREAKFAST);
        sampleEntryResponseDTO = new EntryResponseDTO(sampleId, "Pasta Carbonara", "MANUAL", LocalDateTime.now(), 500, 50.0, 15.0, 30.0, MealType.BREAKFAST);
    }


    // ----------   findEntriesByUser ---------

    @Test
    void findEntryByUser() {
        when(uRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(repository.findByUser(sampleUser)).thenReturn(List.of(sampleEntry, sampleEntry));
        when(mapper.toResponseDTO(sampleEntry)).thenReturn(sampleEntryResponseDTO);

        var response = service.findByUser(sampleUserId);

        assertNotNull(response);
        assertEquals(List.of(sampleEntryResponseDTO, sampleEntryResponseDTO), response);

        verify(uRepository, times(1)).findById(sampleUserId);
        verify(repository, times(1)).findByUser(sampleUser);
        verify(mapper, times(2)).toResponseDTO(sampleEntry);
    }

    @Test
    void findEntryByUser_ThrowsIAE_WhenUserIdIsNull() {
        assertThrows(IllegalArgumentException.class, () -> service.findByUser(null));
        verify(uRepository, never()).findById(any());
        verify(repository, never()).findByUser(any());
        verify(mapper, never()).toResponseDTO(any());
    }

    @Test
    void findEntryByUser_ThrowsNFE_WhenUserNotFound() {
        UUID fakeID = UUID.randomUUID();
        when(uRepository.findById(fakeID)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.findByUser(fakeID));

        verify(uRepository, times(1)).findById(any());
        verify(repository, never()).findByUser(any());
        verify(mapper, never()).toResponseDTO(any());
    }

    @Test
    void findEntryByUser_ReturnsEmpty_WhenUserDoesNotHaveEntries() {
        when(uRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(repository.findByUser(sampleUser)).thenReturn(List.of());

        var result = service.findByUser(sampleUserId);

        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(uRepository, times(1)).findById(any());
        verify(repository, times(1)).findByUser(any());
        verify(mapper, never()).toResponseDTO(any());
    }


    // ----------   createEntry ---------

    @Test
    void createEntry() {
        when(uRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(mapper.toEntity(sampleEntryRequestDTO)).thenReturn(sampleEntry);
        when(mapper.toResponseDTO(sampleEntry)).thenReturn(sampleEntryResponseDTO);
        when(repository.save(sampleEntry)).thenReturn(sampleEntry);

        var result = service.createEntry(sampleEntryRequestDTO, sampleUserId);

        assertNotNull(result);
        assertEquals(result, sampleEntryResponseDTO);

        verify(uRepository, times(1)).findById(sampleUserId);
        verify(repository, times(1)).save(sampleEntry);
        verify(mapper, times(1)).toResponseDTO(any());
    }

    @Test
    void createEntry_throwsIAE_WhenEntryRequestDTOIsNull() {

        assertThrows(IllegalArgumentException.class, () -> service.createEntry(null, sampleUserId));

        verify(uRepository, never()).findById(any());
        verify(repository, never()).findByUser(any());
        verify(mapper, never()).toResponseDTO(any());
    }

    @Test
    void createEntry_throwsIAE_WhenUserIdIsNull() {

        assertThrows(IllegalArgumentException.class, () -> service.createEntry(sampleEntryRequestDTO, null));

        verify(uRepository, never()).findById(any());
        verify(repository, never()).findByUser(any());
        verify(mapper, never()).toResponseDTO(any());
    }

    @Test
    void createEntry_ThrowsNFE_WhenUserNotFound() {
        UUID fakeID = UUID.randomUUID();
        when(uRepository.findById(fakeID)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.createEntry(sampleEntryRequestDTO, fakeID));

        verify(uRepository, times(1)).findById(any());
        verify(repository, never()).findByUser(any());
        verify(mapper, never()).toResponseDTO(any());
    }


    // ----------   removeEntry ---------

    @Test
    void removeEntry() {
        when(repository.existsById(sampleId)).thenReturn(true);
        service.removeEntry(sampleId);
        verify(repository, times(1)).deleteById(sampleId);
    }

    @Test
    void removeEntry_ThrowsRTE_WhenEntryNotFound() {
        UUID fakeId = UUID.randomUUID();
        when(repository.existsById(fakeId)).thenReturn(false);
        assertThrows(RuntimeException.class, () -> service.removeEntry(fakeId));
        verify(repository, never()).deleteById(sampleId);
        verify(repository, never()).deleteById(sampleId);
    }


    // ----------   findTodayEntriesByUser ---------

    @Test
    void findTodayEntriesByUser() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        when(uRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(repository.findByUserAndCreatedOnBetween(sampleUser, startOfDay, endOfDay)).thenReturn(List.of(sampleEntry));
        when(mapper.toResponseDTO(sampleEntry)).thenReturn(sampleEntryResponseDTO);

        var response = service.findTodayEntriesByUser(sampleUserId);

        assertNotNull(response);
        assertEquals(List.of(sampleEntryResponseDTO), response);

        verify(uRepository, times(1)).findById(sampleUserId);
        verify(repository, times(1)).findByUserAndCreatedOnBetween(sampleUser, startOfDay, endOfDay);
        verify(mapper, times(1)).toResponseDTO(sampleEntry);
    }

    @Test
    void findTodayEntriesByUser_ThrowIAE_WhenUserIdIsNull() {
        assertThrows(IllegalArgumentException.class, () -> service.findTodayEntriesByUser(null));

        verify(uRepository, never()).findById(sampleUserId);
        verify(repository, never()).findByUserAndCreatedOnBetween(any(), any(), any());
        verify(mapper, never()).toResponseDTO(sampleEntry);
    }

    @Test
    void findTodayEntriesByUser_ThrowsNFE_WhenUserNotFound() {
        UUID fakeID = UUID.randomUUID();

        when(uRepository.findById(fakeID)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.findTodayEntriesByUser(fakeID));

        verify(uRepository, times(1)).findById(any());
        verify(repository, never()).findByUser(any());
        verify(mapper, never()).toResponseDTO(any());
    }

    @Test
    void findTodayEntriesByUser_WhenNoEntries_ReturnsEmpty() {
        when(uRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));

        when (repository.findByUserAndCreatedOnBetween(
                eq(sampleUser),
                any(LocalDateTime.class),
                any(LocalDateTime.class)
        )).thenReturn(List.of());

        var result = service.findTodayEntriesByUser(sampleUserId);

        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(uRepository, times(1)).findById(sampleUserId);
        verify(repository, times(1)).findByUserAndCreatedOnBetween(sampleUser, LocalDateTime.now().toLocalDate().atStartOfDay(), LocalDate.now().atTime(LocalTime.MAX));
        verify(mapper, never()).toResponseDTO(sampleEntry);
    }


    // ----------   updateEntry ---------

    @Test
    void updateEntry() {
        EntryRequestDTO newEntryRequestDTO = new EntryRequestDTO( "Chicken",99900, 950.0, 915.0, 930.0, MealType.BREAKFAST);
        EntryResponseDTO newEntryResponseDTO = new EntryResponseDTO(sampleId, "Chicken", "Telegram",  LocalDateTime.now(), 99900, 950.0, 915.0, 930.0, MealType.BREAKFAST);

        when(repository.findById(sampleId)).thenReturn(Optional.of(sampleEntry));
        when(repository.save(sampleEntry)).thenReturn(sampleEntry);
        when(mapper.toResponseDTO(sampleEntry)).thenReturn(newEntryResponseDTO);

        var response = service.updateEntry(sampleId, newEntryRequestDTO);

        assertNotNull(response);
        assertEquals(newEntryResponseDTO, response);

        verify(repository, times(1)).findById(sampleId);
        verify(repository, times(1)).save(sampleEntry);
        verify(mapper, times(1)).toResponseDTO(sampleEntry);
    }

    @Test
    void updateEntry_ThrowsIAE_WhenDTOIsNull() {

        assertThrows(IllegalArgumentException.class, () -> service.updateEntry(sampleId, null));

        verify(repository, never()).findById(sampleId);
        verify(repository, never()).save(sampleEntry);
        verify(mapper, never()).toResponseDTO(sampleEntry);
    }

    @Test
    void updateEntry_ThrowsNFE_WhenEntryIsNotFound() {
        EntryRequestDTO newEntryRequestDTO = new EntryRequestDTO( "Chicken",99900, 950.0, 915.0, 930.0, MealType.BREAKFAST);
        when(repository.findById(sampleId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.updateEntry(sampleId, newEntryRequestDTO));

        verify(repository, times(1)).findById(sampleId);
        verify(repository, never()).save(sampleEntry);
        verify(mapper, never()).toResponseDTO(sampleEntry);
    }

}
