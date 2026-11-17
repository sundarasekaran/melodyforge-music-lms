package com.musiclms.service;

import com.musiclms.dto.PracticeSessionRequest;
import com.musiclms.model.entity.Instrument;
import com.musiclms.model.entity.PracticeSession;
import com.musiclms.model.entity.User;
import com.musiclms.repository.InstrumentRepository;
import com.musiclms.repository.PracticeSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional(readOnly = true)
    public List<PracticeSession> getUserPracticeHistory(User user) {
        return practiceSessionRepository.findByUserOrderByPracticedAtDesc(user);
    }
}
