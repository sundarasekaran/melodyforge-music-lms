package com.musiclms.service;

import com.musiclms.dto.analytics.AdminPlatformAnalyticsResponse;
import com.musiclms.dto.analytics.StudentAnalyticsResponse;
import com.musiclms.dto.analytics.StudentSummaryPageResponse;
import com.musiclms.model.entity.*;
import com.musiclms.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class AnalyticsServiceTest {

    private UserRepository userRepository;
    private UserProgressRepository userProgressRepository;
    private PracticeSessionRepository practiceSessionRepository;
    private AssessmentAttemptRepository assessmentAttemptRepository;
    private CertificateRepository certificateRepository;
    private UserBadgeRepository userBadgeRepository;
    private InstrumentRepository instrumentRepository;
    private LessonRepository lessonRepository;

    private AnalyticsService analyticsService;

    private User testUser;
    private Instrument piano;
    private Instrument guitar;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        userProgressRepository = Mockito.mock(UserProgressRepository.class);
        practiceSessionRepository = Mockito.mock(PracticeSessionRepository.class);
        assessmentAttemptRepository = Mockito.mock(AssessmentAttemptRepository.class);
        certificateRepository = Mockito.mock(CertificateRepository.class);
        userBadgeRepository = Mockito.mock(UserBadgeRepository.class);
        instrumentRepository = Mockito.mock(InstrumentRepository.class);
        lessonRepository = Mockito.mock(LessonRepository.class);

        analyticsService = new AnalyticsService(
                userRepository,
                userProgressRepository,
                practiceSessionRepository,
                assessmentAttemptRepository,
                certificateRepository,
                userBadgeRepository,
                instrumentRepository,
                lessonRepository
        );

        testUser = new User("scholar@musiclms.com", "scholar", "Scholar Student", "pass", Role.ROLE_STUDENT);
        testUser.setId(10L);
        testUser.setTotalXp(850);
        testUser.setCurrentLevel(4);
        testUser.setCurrentStreakDays(7);

        piano = new Instrument("piano", "Piano & Keyboard", "Keyboard", "Piano desc", "piano", true, 1);
        piano.setId(1L);

        guitar = new Instrument("guitar", "Acoustic Guitar", "Strings", "Guitar desc", "guitar", true, 2);
        guitar.setId(2L);
    }

    @Test
    @DisplayName("Should aggregate student analytics with learning time, practice duration and pass rates")
    void testGetStudentAnalytics() {
        Lesson l1 = new Lesson();
        l1.setId(101L);
        l1.setDurationMinutes(15);

        UserProgress p1 = new UserProgress(testUser, l1, true, 95, LocalDateTime.now());
        when(userProgressRepository.findByUser(testUser)).thenReturn(List.of(p1));

        PracticeSession s1 = new PracticeSession();
        s1.setUser(testUser);
        s1.setInstrument(piano);
        s1.setDurationSeconds(600); // 10 minutes
        s1.setRoutineId("rhythm-timing");
        s1.setPracticedAt(LocalDateTime.now());

        when(practiceSessionRepository.findByUserOrderByPracticedAtDesc(testUser)).thenReturn(List.of(s1));

        AssessmentAttempt att1 = new AssessmentAttempt();
        att1.setUser(testUser);
        att1.setLevel(1);
        att1.setScore(85);
        att1.setMaxScore(100);
        att1.setScorePercent(85);
        att1.setPassed(true);
        att1.setXpAwarded(300);
        att1.setAttemptNumber(1);
        att1.setCompletedAt(LocalDateTime.now());
        when(assessmentAttemptRepository.findByUserOrderByStartedAtDesc(testUser)).thenReturn(List.of(att1));

        when(userBadgeRepository.findByUserOrderByAwardedAtDesc(testUser)).thenReturn(Collections.emptyList());
        when(instrumentRepository.findAll()).thenReturn(List.of(piano, guitar));
        when(lessonRepository.countByCourseLevelTierInstrumentSlug("piano")).thenReturn(16L);
        when(lessonRepository.countByCourseLevelTierInstrumentSlug("guitar")).thenReturn(16L);

        StudentAnalyticsResponse res = analyticsService.getStudentAnalytics(testUser, "all", "30d");

        assertNotNull(res);
        assertEquals(15, res.getTotalLearningMinutes());
        assertEquals(10, res.getTotalPracticeMinutes());
        assertEquals(1, res.getCompletedLessonsCount());
        assertEquals(1, res.getCompletedRoutinesCount());
        assertEquals(1, res.getAssessmentAttemptsCount());
        assertEquals(1, res.getAssessmentPassedCount());
        assertEquals(100.0, res.getAssessmentPassRate());
        assertEquals(85, res.getBestAssessmentScore());
        assertEquals(850, res.getTotalXp());
        assertEquals(4, res.getCurrentLevel());
        assertEquals(7, res.getCurrentStreakDays());
        assertEquals(7, res.getWeeklyPractice().size());
        assertEquals(2, res.getInstrumentProgress().size());
    }

    @Test
    @DisplayName("Should aggregate platform-wide metrics for administrator console")
    void testGetAdminPlatformAnalytics() {
        when(userRepository.count()).thenReturn(50L);
        when(practiceSessionRepository.findByPracticedAtAfter(any())).thenReturn(Collections.emptyList());
        when(userProgressRepository.countByCompletedTrue()).thenReturn(140L);
        when(practiceSessionRepository.count()).thenReturn(85L);
        when(practiceSessionRepository.findAll()).thenReturn(Collections.emptyList());
        when(assessmentAttemptRepository.count()).thenReturn(40L);
        when(assessmentAttemptRepository.countByPassedTrue()).thenReturn(32L);
        when(certificateRepository.count()).thenReturn(12L);
        when(instrumentRepository.findAll()).thenReturn(List.of(piano, guitar));
        when(lessonRepository.findAll()).thenReturn(Collections.emptyList());

        AdminPlatformAnalyticsResponse res = analyticsService.getAdminPlatformAnalytics();

        assertNotNull(res);
        assertEquals(50L, res.getTotalRegisteredStudents());
        assertEquals(140L, res.getTotalCompletedLessons());
        assertEquals(85L, res.getTotalPracticeSessions());
        assertEquals(40L, res.getTotalAssessmentAttempts());
        assertEquals(80.0, res.getAssessmentPassRate());
        assertEquals(12L, res.getTotalCertificatesIssued());
        assertEquals(2, res.getInstrumentPopularity().size());
        assertEquals(3, res.getAssessmentLevelBreakdown().size());
        assertEquals(7, res.getWeeklyActivityTrend().size());
    }

    @Test
    @DisplayName("Should return paginated students with completed lessons and practice stats")
    void testGetPaginatedStudents() {
        when(userRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(testUser)));

        when(userProgressRepository.countByUserAndCompletedTrue(testUser)).thenReturn(5L);
        when(practiceSessionRepository.findByUserOrderByPracticedAtDesc(testUser)).thenReturn(Collections.emptyList());

        StudentSummaryPageResponse pageRes = analyticsService.getPaginatedStudents(null, 0, 10);

        assertNotNull(pageRes);
        assertEquals(1, pageRes.getStudents().size());
        assertEquals("scholar", pageRes.getStudents().get(0).getUsername());
        assertEquals(5L, pageRes.getStudents().get(0).getCompletedLessons());
    }
}
