package com.project.NutritionTracker.service;

import com.project.NutritionTracker.dto.GoalRequestDTO;
import com.project.NutritionTracker.dto.GoalResponseDTO;
import com.project.NutritionTracker.exception.NotFoundException;
import com.project.NutritionTracker.mapper.GoalMapper;
import com.project.NutritionTracker.model.Goal;
import com.project.NutritionTracker.model.User;
import com.project.NutritionTracker.repository.GoalRepository;
import com.project.NutritionTracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GoalServiceTest {

    @Mock
    private GoalRepository repository;
    @Mock
    private GoalMapper mapper;
    @Mock
    private UserRepository uRepository;
    @InjectMocks
    private GoalService service;

    private Goal sampleGoal;
    private GoalRequestDTO sampleGoalRequestDTO;
    private GoalResponseDTO sampleGoalResponseDTO;

    private UUID sampleId;
    private User sampleUser;
    private LocalDate sampleStartdate;
    private Long telegramId;

    @BeforeEach
    void setSUp() {
        // User
        sampleUser = new User();
        sampleUser.setId(sampleId);
        sampleUser.setGoogleId("googleid123");
        sampleUser.setCreatedAt(LocalDateTime.now());
        sampleUser.setEmail("sampleemail@sample.com");
        sampleUser.setFirstName("Ben");
        sampleUser.setLastName("Marx");

        // Goal
        sampleId = UUID.randomUUID();
        sampleStartdate = LocalDate.of(2026, 8, 6);
        sampleGoal = new Goal(sampleId, sampleUser, sampleStartdate, 1000, 100.0, 10.0, 1.0);
        sampleGoalRequestDTO = new GoalRequestDTO(1000, 100.0, 10.0, 1.0);
        sampleGoalResponseDTO = new GoalResponseDTO(sampleId, sampleStartdate, 1000, 100.0, 10.0, 1.0);
    }


    // ----------   createGoal ---------

    @Test
    void createGoal() {
        when(uRepository.findById(sampleId)).thenReturn(Optional.of(sampleUser));
        when(mapper.toEntity(sampleGoalRequestDTO)).thenReturn(sampleGoal);
        when(repository.save(sampleGoal)).thenReturn(sampleGoal);
        when(mapper.toResponseDTO(sampleGoal)).thenReturn(sampleGoalResponseDTO);

        GoalResponseDTO responseDTO = service.createGoal(sampleGoalRequestDTO, sampleId);

        assertNotNull(responseDTO);
        assertEquals(sampleGoalResponseDTO, responseDTO);
        assertEquals(sampleStartdate, responseDTO.startDate());
        assertEquals(sampleId, responseDTO.id());

        verify(uRepository, times(1)).findById(sampleId);
        verify(repository, times(1)).save(sampleGoal);
        verify(mapper, times(1)).toResponseDTO(sampleGoal);
    }

    @Test
    void createGoal_ReturnsNull_WhenDTOIsNull() {
        GoalResponseDTO responseDTO = service.createGoal(null, sampleId);
        assertNull(responseDTO);
        verify(uRepository, never()).findById(sampleId);
        verify(repository, never()).save(sampleGoal);
        verify(mapper, never()).toResponseDTO(sampleGoal);
    }

    @Test
    void createGoal_ThrowNFE_WhenUserIdNotFound() {
        UUID fakeid = UUID.randomUUID();
        when(uRepository.findById(fakeid)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.createGoal(sampleGoalRequestDTO, fakeid));

        verify(uRepository, times(1)).findById(fakeid);
        verify(repository, never()).save(sampleGoal);
        verify(mapper, never()).toResponseDTO(sampleGoal);
    }

    @Test
    void createGoal_SetsCurrentDateCorrectly() {
        when(uRepository.findById(sampleId)).thenReturn(Optional.of(sampleUser));
        when(mapper.toEntity(sampleGoalRequestDTO)).thenReturn(sampleGoal);
        when(repository.save(any(Goal.class))).thenReturn(sampleGoal);
        when(mapper.toResponseDTO(any())).thenReturn(sampleGoalResponseDTO);

        service.createGoal(sampleGoalRequestDTO, sampleId);

        ArgumentCaptor<Goal> goalCaptor = ArgumentCaptor.forClass(Goal.class); // Create a captor
        verify(repository).save(goalCaptor.capture()); // catch the goal to inspect
        Goal savedGoal = goalCaptor.getValue();

        assertEquals(LocalDate.now(), savedGoal.getStartDate());
    }


    // ----------   getGoalByUserAndDate ---------

    @Test
    void getGoalByUserAndDate() {
        when(uRepository.findById(sampleId)).thenReturn(Optional.of(sampleUser));
        when(repository.findByUserAndStartDate(sampleUser, sampleStartdate)).thenReturn(Optional.of(sampleGoal));
        when(mapper.toResponseDTO(sampleGoal)).thenReturn(sampleGoalResponseDTO);

        GoalResponseDTO responseDTO = service.getGoalByUserAndDate(sampleId, sampleStartdate);

        assertNotNull(responseDTO);
        assertEquals(sampleGoalResponseDTO, responseDTO);
        assertEquals(sampleStartdate, responseDTO.startDate());
        assertEquals(sampleId, responseDTO.id());

        verify(uRepository, times(1)).findById(sampleId);
        verify(repository, times(1)).findByUserAndStartDate(sampleUser, sampleStartdate);
        verify(mapper, times(1)).toResponseDTO(sampleGoal);
    }

    @Test
    void getGoalByUserAndDate_throwIAE_WhenUserIdIsNull() {
        assertThrows(IllegalArgumentException.class, () -> service.getGoalByUserAndDate(null, sampleStartdate));

        verify(uRepository, never()).findById(sampleId);
        verify(repository, never()).findByUserAndStartDate(sampleUser, sampleStartdate);
        verify(mapper, never()).toResponseDTO(sampleGoal);
    }

    @Test
    void getGoalByUserAndDate_throwNFW_WhenUserIdIsNotFound() {
        UUID fakeid = UUID.randomUUID();
        when(uRepository.findById(fakeid)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.getGoalByUserAndDate(fakeid, sampleStartdate));

        verify(uRepository, times(1)).findById(fakeid);
        verify(repository, never()).findByUserAndStartDate(any(), any());
        verify(mapper, never()).toResponseDTO(sampleGoal);
    }

    @Test
    void getGoalByUserAndDate_ReturnsEmpty_IfDateNotFound() {

        LocalDate fakeLocalDate = LocalDate.of(2022, 8, 6);
        when(uRepository.findById(sampleId)).thenReturn(Optional.of(sampleUser));

        assertThrows(NotFoundException.class, () -> service.getGoalByUserAndDate(sampleId, fakeLocalDate));

        verify(uRepository, times(1)).findById(sampleId);
        verify(repository, times(1)).findByUserAndStartDate(sampleUser, fakeLocalDate);
        verify(mapper, never()).toResponseDTO(any());
    }


    // ----------   findAllGoalsByUser ---------

    @Test
    void findAllGoalsByUser() {
        Goal sampleGoal2 = new Goal(sampleId, sampleUser, sampleStartdate, 2000, 200.0, 20.0, 2.0);
        GoalResponseDTO sampleGoalResponseDTO2 = new GoalResponseDTO(sampleId, sampleStartdate, 2000, 200.0, 20.0, 2.0);

        when(uRepository.findById(sampleId)).thenReturn(Optional.of(sampleUser));
        when(repository.findAllByUser(sampleUser)).thenReturn(List.of(sampleGoal, sampleGoal2));
        when(mapper.toResponseDTO(sampleGoal)).thenReturn(sampleGoalResponseDTO);
        when(mapper.toResponseDTO(sampleGoal2)).thenReturn(sampleGoalResponseDTO2);

        List<GoalResponseDTO> responsesDTO = service.findAllGoalsByUser(sampleId);

        assertNotNull(responsesDTO);
        assertEquals(responsesDTO, List.of(sampleGoalResponseDTO, sampleGoalResponseDTO2));

        verify(uRepository, times(1)).findById(sampleId);
        verify(repository, times(1)).findAllByUser(sampleUser);
        verify(mapper, times(2)).toResponseDTO(any());
    }

    @Test
    void findAllGoalsByUser_TrowsIAE_WhenUserIdIsNull() {
        assertThrows(IllegalArgumentException.class, () -> service.findAllGoalsByUser(null));

        verify(uRepository, never()).findById(sampleId);
        verify(repository, never()).findAllByUser(sampleUser);
        verify(mapper, never()).toResponseDTO(sampleGoal);
    }

    @Test
    void findAllGoalsByUser_throwNFW_WhenUserIdIsNotFound() {
        UUID fakeid = UUID.randomUUID();
        when(uRepository.findById(fakeid)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.findAllGoalsByUser(fakeid));

        verify(uRepository, times(1)).findById(fakeid);
        verify(repository, never()).findAllByUser(sampleUser);
        verify(mapper, never()).toResponseDTO(sampleGoal);
    }

    @Test
    void findAllGoalsByUser_ReturnsEmpty_WhenGoalsDoesNotExist() {
        when(uRepository.findById(sampleId)).thenReturn(Optional.of(sampleUser));
        when(repository.findAllByUser(sampleUser)).thenReturn(List.of());

        List<GoalResponseDTO> responsesDTO = service.findAllGoalsByUser(sampleId);

        assertEquals(responsesDTO, List.of());

        verify(uRepository, times(1)).findById(sampleId);
        verify(repository, times(1)).findAllByUser(sampleUser);
        verify(mapper, never()).toResponseDTO(any());

    }

    @Test
    void updateGoal_ThrowsNFE_WhenGoalNotFound() {
        UUID fakeGoalId = UUID.randomUUID();
        when(repository.findById(fakeGoalId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.updateGoal(fakeGoalId, sampleGoalRequestDTO));

        verify(repository, times(1)).findById(fakeGoalId);
        verify(repository, never()).findAllByUser(any());
        verify(mapper, never()).toResponseDTO(any());
    }


    // ----------   updateGoal ---------

    @Test
    void updateGoal() {
        GoalRequestDTO sampleGoalRequestDTO2 = new GoalRequestDTO(2000, 200.0, 20.0, 2.0);
        GoalResponseDTO sampleGoalResponseDTO2 = new GoalResponseDTO(sampleId, LocalDate.now(), 2000, 200.0, 20.0, 2.0);

        when(repository.findById(sampleId)).thenReturn(Optional.of(sampleGoal));
        when(mapper.toResponseDTO(sampleGoal)).thenReturn(sampleGoalResponseDTO2);
        when(repository.save(sampleGoal)).thenReturn(sampleGoal);

        GoalResponseDTO responseDTO = service.updateGoal(sampleId, sampleGoalRequestDTO2);

        assertNotNull(responseDTO);
        assertEquals(sampleGoalResponseDTO2, responseDTO);
        assertEquals(2000, responseDTO.kcal());
        assertEquals(200.0, responseDTO.carbs());
        assertEquals(20.0, responseDTO.fat());
        assertEquals(2.0, responseDTO.protein());

        verify(repository, times(1)).findById(sampleId);
        verify(repository, times(1)).save(sampleGoal);
        verify(mapper, times(1)).toResponseDTO(sampleGoal);
    }

    @Test
    void updateGoal_ThrowsNFE_WhenGoalIdNotFound() {
        UUID fakeGoalId = UUID.randomUUID();
        GoalRequestDTO sampleGoalRequestDTO2 = new GoalRequestDTO(2000, 200.0, 20.0, 2.0);

        when(repository.findById(fakeGoalId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.updateGoal(fakeGoalId, sampleGoalRequestDTO2));
        verify(repository, never()).findById(sampleId);
        verify(repository, never()).save(sampleGoal);
        verify(mapper, never()).toResponseDTO(sampleGoal);
    }

    @Test
    void updateGoal_TrowsIAE_IfGoalRequestIsNull() {
        when(repository.findById(sampleId)).thenReturn(Optional.of(sampleGoal));

        assertThrows(IllegalArgumentException.class, () -> service.updateGoal(sampleId, null));

        verify(repository, times(1)).findById(sampleId);
        verify(repository, never()).save(sampleGoal);
        verify(mapper, never()).toResponseDTO(sampleGoal);
    }

}
