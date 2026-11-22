package com.musiclms.service;

import com.musiclms.dto.*;
import com.musiclms.model.entity.*;
import com.musiclms.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssessmentServiceTest {

    @Mock
    private AssessmentAttemptRepository attemptRepository;

    @Mock
    private CertificateRepository certificateRepository;

    @Mock
    private InstrumentRepository instrumentRepository;

    @Mock
    private GamificationService gamificationService;

    private AssessmentService assessmentService;

    private User testUser;
    private User otherUser;
    private Instrument piano;

    @BeforeEach
    void setUp() {
        testUser = new User("student@musiclms.com", "student", "Alex Rivera", "pass", Role.ROLE_STUDENT);
        testUser.setId(1L);

        otherUser = new User("other@musiclms.com", "other", "Other Student", "pass", Role.ROLE_STUDENT);
        otherUser.setId(2L);

        piano = new Instrument("piano", "Piano & Keyboard", "Keyboard", "Acoustic Piano", "piano", true, 1);
        piano.setId(10L);

        assessmentService = new AssessmentService(attemptRepository, certificateRepository, instrumentRepository, gamificationService);
    }

    @Test
    @DisplayName("1. Assessment Overview: Level 1 should be available, Level 2 and 3 locked initially")
    void testAssessmentOverviewProgression() {
        when(attemptRepository.existsByUserAndLevelAndPassedTrue(testUser, 1)).thenReturn(false);
        when(attemptRepository.existsByUserAndLevelAndPassedTrue(testUser, 2)).thenReturn(false);
        when(attemptRepository.existsByUserAndLevelAndPassedTrue(testUser, 3)).thenReturn(false);
        when(attemptRepository.findByUserAndLevelOrderByStartedAtDesc(eq(testUser), anyInt())).thenReturn(Collections.emptyList());

        List<AssessmentResponse> list = assessmentService.getAssessmentsOverview(testUser);

        assertEquals(3, list.size());
        assertEquals("AVAILABLE", list.get(0).getStatus());
        assertEquals("LOCKED", list.get(1).getStatus());
        assertEquals("LOCKED", list.get(2).getStatus());
        assertEquals(70, list.get(0).getPassingThreshold());
        assertEquals(75, list.get(1).getPassingThreshold());
        assertEquals(80, list.get(2).getPassingThreshold());
    }

    @Test
    @DisplayName("2. Starting Level 2 before passing Level 1 should be blocked by prerequisite check")
    void testPrerequisiteCheckBlocksLevel2() {
        when(attemptRepository.existsByUserAndLevelAndPassedTrue(testUser, 1)).thenReturn(false);

        assertThrows(IllegalStateException.class, () -> {
            assessmentService.startAttempt(testUser, 2);
        });
    }

    @Test
    @DisplayName("3. Successfully start Level 1 assessment attempt")
    void testStartLevel1Attempt() {
        when(instrumentRepository.findBySlug("piano")).thenReturn(Optional.of(piano));
        when(attemptRepository.findTopByUserAndLevelOrderByAttemptNumberDesc(testUser, 1)).thenReturn(Optional.empty());
        when(attemptRepository.save(any(AssessmentAttempt.class))).thenAnswer(i -> {
            AssessmentAttempt a = i.getArgument(0);
            a.setId(501L);
            return a;
        });

        AssessmentAttempt attempt = assessmentService.startAttempt(testUser, 1);

        assertNotNull(attempt);
        assertEquals(501L, attempt.getId());
        assertEquals(1, attempt.getLevel());
        assertEquals("IN_PROGRESS", attempt.getStatus());
        assertEquals(70, attempt.getPassingThreshold());
        assertEquals(10, attempt.getMaxScore());
        assertEquals(1, attempt.getAttemptNumber());
    }

    @Test
    @DisplayName("4. Server-Authoritative Grading: Validate answers, calculate score, enforce 70% threshold")
    void testSubmitAttemptGradingAndPassing() {
        AssessmentAttempt attempt = new AssessmentAttempt();
        attempt.setId(501L);
        attempt.setUser(testUser);
        attempt.setLevel(1);
        attempt.setPassingThreshold(70);
        attempt.setMaxScore(10);
        attempt.setStatus("IN_PROGRESS");

        when(attemptRepository.findById(501L)).thenReturn(Optional.of(attempt));
        when(attemptRepository.existsByUserAndLevelAndPassedTrue(testUser, 1)).thenReturn(false);
        when(attemptRepository.save(any(AssessmentAttempt.class))).thenAnswer(i -> i.getArgument(0));

        // Submit 8 correct answers out of 10 (80% score -> Passed!)
        SubmitAssessmentRequest req = new SubmitAssessmentRequest();
        List<SubmittedAnswerDto> answers = new ArrayList<>();

        // q1: Cristofori (index 1)
        SubmittedAnswerDto a1 = new SubmittedAnswerDto();
        a1.setQuestionId("l1-1");
        a1.setSelectedOptionIndex(1);
        answers.add(a1);

        // q2: Soundboard (index 0)
        SubmittedAnswerDto a2 = new SubmittedAnswerDto();
        a2.setQuestionId("l1-2");
        a2.setSelectedOptionIndex(0);
        answers.add(a2);

        // q3: 88 keys (index 1)
        SubmittedAnswerDto a3 = new SubmittedAnswerDto();
        a3.setQuestionId("l1-3");
        a3.setSelectedOptionIndex(1);
        answers.add(a3);

        // q4: Middle C (MIDI 60)
        SubmittedAnswerDto a4 = new SubmittedAnswerDto();
        a4.setQuestionId("l1-4");
        a4.setSelectedKeyMidi(60);
        answers.add(a4);

        // q5: True (index 0)
        SubmittedAnswerDto a5 = new SubmittedAnswerDto();
        a5.setQuestionId("l1-5");
        a5.setSelectedOptionIndex(0);
        answers.add(a5);

        // q6: G key (MIDI 67)
        SubmittedAnswerDto a6 = new SubmittedAnswerDto();
        a6.setQuestionId("l1-6");
        a6.setSelectedKeyMidi(67);
        answers.add(a6);

        // q7: Forearms parallel (index 1)
        SubmittedAnswerDto a7 = new SubmittedAnswerDto();
        a7.setQuestionId("l1-7");
        a7.setSelectedOptionIndex(1);
        answers.add(a7);

        // q8: Thumb = 1 (index 2)
        SubmittedAnswerDto a8 = new SubmittedAnswerDto();
        a8.setQuestionId("l1-8");
        a8.setSelectedOptionIndex(2);
        answers.add(a8);

        req.setAnswers(answers);

        AssessmentResultResponse result = assessmentService.submitAttempt(testUser, 501L, req);

        assertEquals(8, result.getScore());
        assertEquals(10, result.getMaxScore());
        assertEquals(80, result.getScorePercent());
        assertTrue(result.getPassed());
        assertEquals(100, result.getXpAwarded());
        verify(gamificationService).awardXp(testUser, 100);
        verify(gamificationService).evaluateAchievements(testUser);
    }

    @Test
    @DisplayName("5. Reject attempt submission from unauthorized student")
    void testRejectSubmissionFromUnauthorizedUser() {
        AssessmentAttempt attempt = new AssessmentAttempt();
        attempt.setId(501L);
        attempt.setUser(testUser); // owned by user 1
        attempt.setStatus("IN_PROGRESS");

        when(attemptRepository.findById(501L)).thenReturn(Optional.of(attempt));

        SubmitAssessmentRequest req = new SubmitAssessmentRequest();
        assertThrows(SecurityException.class, () -> {
            assessmentService.submitAttempt(otherUser, 501L, req);
        });
    }

    @Test
    @DisplayName("6. Prevent duplicate final submission of completed attempt")
    void testPreventDuplicateSubmissionOfCompletedAttempt() {
        AssessmentAttempt attempt = new AssessmentAttempt();
        attempt.setId(501L);
        attempt.setUser(testUser);
        attempt.setStatus("COMPLETED");

        when(attemptRepository.findById(501L)).thenReturn(Optional.of(attempt));

        SubmitAssessmentRequest req = new SubmitAssessmentRequest();
        assertThrows(IllegalStateException.class, () -> {
            assessmentService.submitAttempt(testUser, 501L, req);
        });
    }

    @Test
    @DisplayName("7. Graduation Eligibility: Requires passing Level 1, 2, and 3")
    void testGraduationEligibility() {
        when(attemptRepository.existsByUserAndLevelAndPassedTrue(testUser, 1)).thenReturn(true);
        when(attemptRepository.existsByUserAndLevelAndPassedTrue(testUser, 2)).thenReturn(true);
        when(attemptRepository.existsByUserAndLevelAndPassedTrue(testUser, 3)).thenReturn(false);

        assertFalse(assessmentService.checkGraduationEligibility(testUser));

        when(attemptRepository.existsByUserAndLevelAndPassedTrue(testUser, 3)).thenReturn(true);
        assertTrue(assessmentService.checkGraduationEligibility(testUser));
    }

    @Test
    @DisplayName("8. Certificate Claim: Reject ineligible user and succeed for eligible user")
    void testCertificateClaim() {
        // Ineligible case:
        when(attemptRepository.existsByUserAndLevelAndPassedTrue(testUser, 1)).thenReturn(true);
        when(attemptRepository.existsByUserAndLevelAndPassedTrue(testUser, 2)).thenReturn(true);
        when(attemptRepository.existsByUserAndLevelAndPassedTrue(testUser, 3)).thenReturn(false);

        ClaimCertificateRequest req = new ClaimCertificateRequest();
        req.setRecipientName("Alex Rivera");

        assertThrows(IllegalStateException.class, () -> {
            assessmentService.claimCertificate(testUser, req);
        });

        // Eligible case:
        when(attemptRepository.existsByUserAndLevelAndPassedTrue(testUser, 3)).thenReturn(true);
        when(instrumentRepository.findBySlug("piano")).thenReturn(Optional.of(piano));
        when(certificateRepository.findByUserAndInstrumentSlug(testUser, "piano")).thenReturn(Optional.empty());
        when(certificateRepository.save(any(Certificate.class))).thenAnswer(i -> {
            Certificate c = i.getArgument(0);
            c.setId(901L);
            return c;
        });

        CertificateResponse cert = assessmentService.claimCertificate(testUser, req);

        assertNotNull(cert);
        assertEquals(901L, cert.getId());
        assertEquals("Alex Rivera", cert.getRecipientName());
        assertNotNull(cert.getCertificateNumber());
        assertTrue(cert.getCertificateNumber().startsWith("MF-CERT-PIANO-"));
        assertNotNull(cert.getVerificationHash());
        verify(gamificationService).awardXp(testUser, 300);
        verify(gamificationService).evaluateAchievements(testUser);
    }
}
