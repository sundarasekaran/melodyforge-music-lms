package com.musiclms.service;

import com.musiclms.model.entity.*;
import com.musiclms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final InstrumentRepository instrumentRepository;
    private final HistorySectionRepository historySectionRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final PracticeSessionRepository practiceSessionRepository;

    public AdminService(InstrumentRepository instrumentRepository,
                        HistorySectionRepository historySectionRepository,
                        LessonRepository lessonRepository,
                        UserRepository userRepository,
                        PracticeSessionRepository practiceSessionRepository) {
        this.instrumentRepository = instrumentRepository;
        this.historySectionRepository = historySectionRepository;
        this.lessonRepository = lessonRepository;
        this.userRepository = userRepository;
        this.practiceSessionRepository = practiceSessionRepository;
    }

    @Transactional
    public Instrument saveInstrument(Instrument instrument) {
        return instrumentRepository.save(instrument);
    }

    @Transactional
    public HistorySection saveHistorySection(Long instrumentId, HistorySection section) {
        Instrument instrument = instrumentRepository.findById(instrumentId)
                .orElseThrow(() -> new IllegalArgumentException("Instrument not found: " + instrumentId));
        section.setInstrument(instrument);
        return historySectionRepository.save(section);
    }

    @Transactional
    public Lesson saveLesson(Lesson lesson) {
        return lessonRepository.save(lesson);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPlatformStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalInstruments", instrumentRepository.count());
        stats.put("totalLessons", lessonRepository.count());
        stats.put("totalPracticeSessions", practiceSessionRepository.count());
        return stats;
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
