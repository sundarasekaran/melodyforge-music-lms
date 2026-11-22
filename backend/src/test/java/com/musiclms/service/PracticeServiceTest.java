package com.musiclms.service;

import com.musiclms.dto.*;
import com.musiclms.model.entity.Instrument;
import com.musiclms.model.entity.PracticeSession;
import com.musiclms.model.entity.Role;
import com.musiclms.model.entity.User;
import com.musiclms.repository.InstrumentRepository;
import com.musiclms.repository.PracticeSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PracticeServiceTest {

    @Mock
    private PracticeSessionRepository practiceSessionRepository;

    @Mock
    private InstrumentRepository instrumentRepository;

    @Mock
    private GamificationService gamificationService;

    @InjectMocks
    private PracticeService practiceService;

    private User testUser;
    private User otherUser;
    private Instrument piano;

    @BeforeEach
    void setUp() {
        testUser = new User("student@musiclms.com", "student", "Student Learner", "pass", Role.ROLE_STUDENT);
        testUser.setId(1L);
        testUser.setCurrentStreakDays(3);

        otherUser = new User("other@musiclms.com", "other", "Other Learner", "pass", Role.ROLE_STUDENT);
        otherUser.setId(2L);

        piano = new Instrument("piano", "Piano", "Keyboard", "Acoustic Piano", "piano", true, 1);
        piano.setId(10L);
    }

    @Test
    @DisplayName("1. Should successfully start a structured practice routine session")
    void testStartRoutineSession() {
        when(instrumentRepository.findBySlug("piano")).thenReturn(Optional.of(piano));
        when(practiceSessionRepository.save(any(PracticeSession.class))).thenAnswer(invocation -> {
            PracticeSession ps = invocation.getArgument(0);
            ps.setId(101L);
            return ps;
        });

        StartRoutineRequest req = new StartRoutineRequest();
        req.setInstrumentSlug("piano");
        req.setRoutineId("rhythm-timing-walk");
        req.setRoutineTitle("Stepping in Time: The Metronome Walk");
        req.setTargetBpm(72);
        req.setTimeSignature("4/4");
        req.setTotalExercises(4);

        PracticeSession session = practiceService.startRoutineSession(testUser, req);

        assertNotNull(session);
        assertEquals(101L, session.getId());
        assertEquals("IN_PROGRESS", session.getStatus());
        assertEquals("rhythm-timing-walk", session.getRoutineId());
        assertEquals(72, session.getTargetBpm());
        assertEquals("4/4", session.getTimeSignature());
        assertEquals(0, session.getCompletedExercises());
        assertEquals(4, session.getTotalExercises());
        assertEquals(0, session.getDurationSeconds());
        assertEquals(testUser, session.getUser());
        verify(practiceSessionRepository).save(any(PracticeSession.class));
    }

    @Test
    @DisplayName("2. Should update progress for an active practice session")
    void testUpdateRoutineProgress() {
        PracticeSession session = new PracticeSession();
        session.setId(101L);
        session.setUser(testUser);
        session.setDurationSeconds(60);
        session.setCompletedExercises(1);
        session.setStatus("IN_PROGRESS");

        when(practiceSessionRepository.findById(101L)).thenReturn(Optional.of(session));
        when(practiceSessionRepository.save(any(PracticeSession.class))).thenAnswer(i -> i.getArgument(0));

        UpdateRoutineProgressRequest req = new UpdateRoutineProgressRequest();
        req.setDurationSeconds(180);
        req.setCompletedExercises(2);
        req.setNotes("Completed exercise 2 with 72 BPM metronome");

        PracticeSession updated = practiceService.updateRoutineProgress(testUser, 101L, req);

        assertEquals(180, updated.getDurationSeconds());
        assertEquals(2, updated.getCompletedExercises());
        assertEquals("Completed exercise 2 with 72 BPM metronome", updated.getNotes());
    }

    @Test
    @DisplayName("3. Should reject progress update when user is not the session owner")
    void testRejectUpdateFromUnauthorizedUser() {
        PracticeSession session = new PracticeSession();
        session.setId(101L);
        session.setUser(testUser); // owned by user 1
        session.setStatus("IN_PROGRESS");

        when(practiceSessionRepository.findById(101L)).thenReturn(Optional.of(session));

        UpdateRoutineProgressRequest req = new UpdateRoutineProgressRequest();
        req.setDurationSeconds(200);

        // Attempting to update with otherUser (user 2)
        assertThrows(SecurityException.class, () -> {
            practiceService.updateRoutineProgress(otherUser, 101L, req);
        });
    }

    @Test
    @DisplayName("4. Should complete routine session and award server-authoritative XP")
    void testCompleteRoutineSession() {
        PracticeSession session = new PracticeSession();
        session.setId(101L);
        session.setUser(testUser);
        session.setDurationSeconds(120);
        session.setCompletedExercises(2);
        session.setStatus("IN_PROGRESS");

        when(practiceSessionRepository.findById(101L)).thenReturn(Optional.of(session));
        when(practiceSessionRepository.save(any(PracticeSession.class))).thenAnswer(i -> i.getArgument(0));

        CompleteRoutineRequest req = new CompleteRoutineRequest();
        req.setDurationSeconds(300);
        req.setCompletedExercises(4);
        req.setNotes("Finished full rhythm routine!");

        PracticeSession completed = practiceService.completeRoutineSession(testUser, 101L, req);

        assertEquals("COMPLETED", completed.getStatus());
        assertEquals(300, completed.getDurationSeconds());
        assertEquals(4, completed.getCompletedExercises());
        assertNotNull(completed.getCompletedAt());
        assertTrue(completed.getXpEarned() >= 35, "Should award server-authoritative XP");

        // Verify gamification interactions
        verify(gamificationService).updateStreak(testUser);
        verify(gamificationService).awardXp(eq(testUser), anyInt());
        verify(gamificationService).evaluateAchievements(testUser);
    }

    @Test
    @DisplayName("5. Should prevent duplicate completion and duplicate XP rewards (Idempotency)")
    void testPreventDuplicateCompletionRewards() {
        PracticeSession alreadyCompleted = new PracticeSession();
        alreadyCompleted.setId(101L);
        alreadyCompleted.setUser(testUser);
        alreadyCompleted.setDurationSeconds(300);
        alreadyCompleted.setCompletedExercises(4);
        alreadyCompleted.setStatus("COMPLETED");
        alreadyCompleted.setXpEarned(80);
        alreadyCompleted.setCompletedAt(LocalDateTime.now().minusMinutes(5));

        when(practiceSessionRepository.findById(101L)).thenReturn(Optional.of(alreadyCompleted));

        CompleteRoutineRequest retryReq = new CompleteRoutineRequest();
        retryReq.setDurationSeconds(300);
        retryReq.setCompletedExercises(4);

        PracticeSession result = practiceService.completeRoutineSession(testUser, 101L, retryReq);

        assertEquals("COMPLETED", result.getStatus());
        assertEquals(80, result.getXpEarned());

        // Gamification services MUST NOT be called again on duplicate complete
        verify(gamificationService, never()).awardXp(any(), anyInt());
        verify(gamificationService, never()).updateStreak(any());
    }

    @Test
    @DisplayName("6. Should compute aggregate practice statistics accurately")
    void testGetPracticeStats() {
        PracticeSession s1 = new PracticeSession();
        s1.setDurationSeconds(300);
        s1.setXpEarned(50);
        s1.setStatus("COMPLETED");
        s1.setRoutineId("rhythm-timing-walk");

        PracticeSession s2 = new PracticeSession();
        s2.setDurationSeconds(600);
        s2.setXpEarned(80);
        s2.setStatus("COMPLETED");
        s2.setRoutineId("five-finger-velocity");

        List<PracticeSession> list = Arrays.asList(s1, s2);
        when(practiceSessionRepository.findByUserOrderByPracticedAtDesc(testUser)).thenReturn(list);
        when(practiceSessionRepository.countByUserAndStatus(testUser, "COMPLETED")).thenReturn(2L);
        when(practiceSessionRepository.countByUserAndRoutineIdNotNull(testUser)).thenReturn(2L);

        PracticeStatsResponse stats = practiceService.getPracticeStats(testUser);

        assertNotNull(stats);
        assertEquals(900L, stats.getTotalPracticeSeconds());
        assertEquals(2L, stats.getTotalSessionsCompleted());
        assertEquals(2L, stats.getRoutinesCompletedCount());
        assertEquals(3, stats.getCurrentStreakDays());
        assertEquals(130, stats.getTotalPracticeXp());
    }
}
