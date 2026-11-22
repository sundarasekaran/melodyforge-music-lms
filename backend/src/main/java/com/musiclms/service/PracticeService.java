package com.musiclms.service;

import com.musiclms.dto.*;
import com.musiclms.model.entity.Instrument;
import com.musiclms.model.entity.PracticeSession;
import com.musiclms.model.entity.User;
import com.musiclms.repository.InstrumentRepository;
import com.musiclms.repository.PracticeSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PracticeService {

    private final PracticeSessionRepository practiceSessionRepository;
    private final InstrumentRepository instrumentRepository;
    private final GamificationService gamificationService;

    public PracticeService(PracticeSessionRepository practiceSessionRepository,
                           InstrumentRepository instrumentRepository,
                           GamificationService gamificationService) {
        this.practiceSessionRepository = practiceSessionRepository;
        this.instrumentRepository = instrumentRepository;
        this.gamificationService = gamificationService;
    }

    @Transactional
    public PracticeSession logPracticeSession(User user, PracticeSessionRequest request) {
        String slug = (request.getInstrumentSlug() != null && !request.getInstrumentSlug().isBlank())
                ? request.getInstrumentSlug() : "piano";

        Instrument instrument = instrumentRepository.findBySlug(slug)
                .orElseGet(() -> instrumentRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new IllegalStateException("No instrument configured")));

        int duration = request.getDurationSeconds() != null ? request.getDurationSeconds() : 60;
        // Award XP proportional to practice duration (minimum 25 XP, max 100 XP per session)
        int xpEarned = Math.min(100, Math.max(25, duration / 10));

        PracticeSession session = new PracticeSession(
                user,
                instrument,
                duration,
                request.getNotes(),
                request.getAudioRecordingUrl(),
                xpEarned
        );

        PracticeSession saved = practiceSessionRepository.save(session);

        gamificationService.updateStreak(user);
        gamificationService.awardXp(user, xpEarned);
        gamificationService.evaluateAchievements(user);

        return saved;
    }

    // --- Phase 3: Structured Practice Routines Workflow ---

    @Transactional
    public PracticeSession startRoutineSession(User user, StartRoutineRequest request) {
        String slug = (request.getInstrumentSlug() != null && !request.getInstrumentSlug().isBlank())
                ? request.getInstrumentSlug() : "piano";

        Instrument instrument = instrumentRepository.findBySlug(slug)
                .orElseGet(() -> instrumentRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new IllegalStateException("No instrument configured")));

        PracticeSession session = new PracticeSession();
        session.setUser(user);
        session.setInstrument(instrument);
        session.setDurationSeconds(0);
        session.setXpEarned(0);
        session.setRoutineId(request.getRoutineId() != null ? request.getRoutineId() : "general-piano-practice");
        session.setRoutineTitle(request.getRoutineTitle() != null ? request.getRoutineTitle() : "Structured Practice Routine");
        session.setTargetBpm(request.getTargetBpm() != null ? Math.max(40, Math.min(208, request.getTargetBpm())) : 80);
        session.setTimeSignature(request.getTimeSignature() != null ? request.getTimeSignature() : "4/4");
        session.setCompletedExercises(0);
        session.setTotalExercises(request.getTotalExercises() != null ? request.getTotalExercises() : 4);
        session.setStatus("IN_PROGRESS");
        session.setStartedAt(LocalDateTime.now());
        session.setPracticedAt(LocalDateTime.now());

        return practiceSessionRepository.save(session);
    }

    @Transactional
    public PracticeSession updateRoutineProgress(User user, Long sessionId, UpdateRoutineProgressRequest request) {
        PracticeSession session = practiceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Practice session not found: " + sessionId));

        // Authorization check: ensure user owns this session
        if (!session.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized: Cannot update practice session of another student");
        }

        if (request.getDurationSeconds() != null && request.getDurationSeconds() > session.getDurationSeconds()) {
            session.setDurationSeconds(request.getDurationSeconds());
        }
        if (request.getCompletedExercises() != null && request.getCompletedExercises() > session.getCompletedExercises()) {
            session.setCompletedExercises(request.getCompletedExercises());
        }
        if (request.getNotes() != null) {
            session.setNotes(request.getNotes());
        }

        return practiceSessionRepository.save(session);
    }

    @Transactional
    public PracticeSession completeRoutineSession(User user, Long sessionId, CompleteRoutineRequest request) {
        PracticeSession session = practiceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Practice session not found: " + sessionId));

        // Authorization check
        if (!session.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized: Cannot complete practice session of another student");
        }

        // Idempotency / Duplicate reward protection
        if ("COMPLETED".equalsIgnoreCase(session.getStatus())) {
            return session;
        }

        int finalDuration = Math.max(30, request.getDurationSeconds() != null ? request.getDurationSeconds() : session.getDurationSeconds());
        int finalCompleted = request.getCompletedExercises() != null ? request.getCompletedExercises() : session.getCompletedExercises();

        // Calculate server-authoritative XP: Base (35 XP) + completed exercises bonus + duration bonus
        int xpEarned = Math.min(120, Math.max(35, 35 + (finalCompleted * 10) + (finalDuration / 25)));

        session.setDurationSeconds(finalDuration);
        session.setCompletedExercises(finalCompleted);
        session.setStatus("COMPLETED");
        session.setCompletedAt(LocalDateTime.now());
        session.setXpEarned(xpEarned);

        if (request.getNotes() != null) {
            session.setNotes(request.getNotes());
        }
        if (request.getAudioRecordingUrl() != null) {
            session.setAudioRecordingUrl(request.getAudioRecordingUrl());
        }

        PracticeSession saved = practiceSessionRepository.save(session);

        // Server-authoritative gamification updates
        gamificationService.updateStreak(user);
        gamificationService.awardXp(user, xpEarned);
        gamificationService.evaluateAchievements(user);

        return saved;
    }

    @Transactional(readOnly = true)
    public PracticeStatsResponse getPracticeStats(User user) {
        List<PracticeSession> sessions = practiceSessionRepository.findByUserOrderByPracticedAtDesc(user);

        long totalSeconds = sessions.stream()
                .mapToLong(s -> s.getDurationSeconds() != null ? s.getDurationSeconds() : 0)
                .sum();
        long completedCount = practiceSessionRepository.countByUserAndStatus(user, "COMPLETED");
        long routineCount = practiceSessionRepository.countByUserAndRoutineIdNotNull(user);
        int totalXp = sessions.stream()
                .mapToInt(s -> s.getXpEarned() != null ? s.getXpEarned() : 0)
                .sum();

        return new PracticeStatsResponse(
                totalSeconds,
                completedCount,
                routineCount,
                user.getCurrentStreakDays(),
                totalXp
        );
    }

    @Transactional(readOnly = true)
    public List<PracticeSession> getUserPracticeHistory(User user) {
        return practiceSessionRepository.findByUserOrderByPracticedAtDesc(user);
    }
}
