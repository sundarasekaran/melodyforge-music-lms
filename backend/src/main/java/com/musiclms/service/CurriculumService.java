package com.musiclms.service;

import com.musiclms.dto.LessonCompletionRequest;
import com.musiclms.model.entity.*;
import com.musiclms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CurriculumService {

    private final LearningTierRepository tierRepository;
    private final LearningLevelRepository levelRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final UserProgressRepository progressRepository;
    private final GamificationService gamificationService;

    public CurriculumService(LearningTierRepository tierRepository,
                             LearningLevelRepository levelRepository,
                             CourseRepository courseRepository,
                             LessonRepository lessonRepository,
                             UserProgressRepository progressRepository,
                             GamificationService gamificationService) {
        this.tierRepository = tierRepository;
        this.levelRepository = levelRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.progressRepository = progressRepository;
        this.gamificationService = gamificationService;
    }

    @Transactional(readOnly = true)
    public List<LearningTier> getTiersForInstrument(String slug) {
        return tierRepository.findByInstrumentSlugOrderByTierOrderAsc(slug);
    }

    @Transactional(readOnly = true)
    public Lesson getLessonById(Long id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getLessonDetailsWithProgress(Long lessonId, User user) {
        Lesson lesson = getLessonById(lessonId);
        Optional<UserProgress> progress = progressRepository.findByUserAndLesson(user, lesson);

        Map<String, Object> response = new HashMap<>();
        response.put("lesson", lesson);
        response.put("completed", progress.map(UserProgress::getCompleted).orElse(false));
        response.put("scorePercent", progress.map(UserProgress::getScorePercent).orElse(0));
        return response;
    }

    @Transactional
    public Map<String, Object> completeLesson(Long lessonId, User user, LessonCompletionRequest request) {
        Lesson lesson = getLessonById(lessonId);
        Optional<UserProgress> existing = progressRepository.findByUserAndLesson(user, lesson);

        boolean wasAlreadyCompleted = existing.map(UserProgress::getCompleted).orElse(false);
        int score = request.getScorePercent() != null ? request.getScorePercent() : 100;

        UserProgress progress = existing.orElse(new UserProgress());
        progress.setUser(user);
        progress.setLesson(lesson);
        progress.setCompleted(true);
        progress.setScorePercent(score);
        progress.setCompletedAt(LocalDateTime.now());
        progressRepository.save(progress);

        int xpAwarded = 0;
        if (!wasAlreadyCompleted) {
            xpAwarded = lesson.getXpReward();
            gamificationService.awardXp(user, xpAwarded);
            gamificationService.evaluateAchievements(user);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("lessonId", lesson.getId());
        result.put("completed", true);
        result.put("scorePercent", score);
        result.put("xpAwarded", xpAwarded);
        result.put("totalXp", user.getTotalXp());
        result.put("currentLevel", user.getCurrentLevel());
        return result;
    }

    @Transactional(readOnly = true)
    public List<UserProgress> getUserProgress(User user) {
        return progressRepository.findByUser(user);
    }
}
