package com.musiclms.service;

import com.musiclms.model.entity.*;
import com.musiclms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class InstrumentHistoryService {

    private final InstrumentRepository instrumentRepository;
    private final HistorySectionRepository historySectionRepository;
    private final UserHistoryProgressRepository userHistoryProgressRepository;
    private final GamificationService gamificationService;

    public InstrumentHistoryService(InstrumentRepository instrumentRepository,
                                    HistorySectionRepository historySectionRepository,
                                    UserHistoryProgressRepository userHistoryProgressRepository,
                                    GamificationService gamificationService) {
        this.instrumentRepository = instrumentRepository;
        this.historySectionRepository = historySectionRepository;
        this.userHistoryProgressRepository = userHistoryProgressRepository;
        this.gamificationService = gamificationService;
    }

    @Transactional(readOnly = true)
    public List<HistorySection> getPublishedSections(String slug) {
        Instrument instrument = instrumentRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Instrument not found with slug: " + slug));
        return historySectionRepository.findByInstrumentAndIsPublishedTrueOrderBySectionNumberAsc(instrument);
    }

    @Transactional(readOnly = true)
    public List<HistorySection> getAllSectionsForAdmin(String slug) {
        Instrument instrument = instrumentRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Instrument not found with slug: " + slug));
        return historySectionRepository.findByInstrumentOrderBySectionNumberAsc(instrument);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getHistoryWithProgress(String slug, User user) {
        List<HistorySection> sections = getPublishedSections(slug);
        List<UserHistoryProgress> progressList = user != null
                ? userHistoryProgressRepository.findByUserAndHistorySectionInstrumentSlug(user, slug)
                : Collections.emptyList();

        Map<Long, UserHistoryProgress> progressMap = new HashMap<>();
        for (UserHistoryProgress p : progressList) {
            if (p.getHistorySection() != null) {
                progressMap.put(p.getHistorySection().getId(), p);
            }
        }

        List<Map<String, Object>> response = new ArrayList<>();
        boolean previousCompleted = true; // Chapter 1 is unlocked by default

        for (int i = 0; i < sections.size(); i++) {
            HistorySection section = sections.get(i);
            UserHistoryProgress prog = progressMap.get(section.getId());
            boolean isCompleted = prog != null && Boolean.TRUE.equals(prog.getCompleted());
            boolean isUnlocked = previousCompleted || (user != null && user.getRole() == Role.ROLE_ADMIN);

            Map<String, Object> item = new HashMap<>();
            item.put("id", section.getId());
            item.put("sectionNumber", section.getSectionNumber());
            item.put("title", section.getTitle());
            item.put("era", section.getEra());
            item.put("introduction", section.getIntroduction());
            item.put("content", section.getContent());
            item.put("keyTakeaway", section.getKeyTakeaway());
            item.put("imageCaption", section.getImageCaption());
            item.put("imageUrl", section.getImageUrl());
            item.put("timelineJson", section.getTimelineJson());
            item.put("factsJson", section.getFactsJson());
            item.put("galleryJson", section.getGalleryJson());
            item.put("audioNote", section.getAudioNote());
            item.put("audioDescription", section.getAudioDescription());
            item.put("quizJson", section.getQuizJson());
            item.put("xpReward", section.getXpReward());
            item.put("durationMinutes", section.getDurationMinutes());
            item.put("isPublished", section.getIsPublished());
            item.put("completed", isCompleted);
            item.put("quizPassed", prog != null && Boolean.TRUE.equals(prog.getQuizPassed()));
            item.put("scorePercent", prog != null ? prog.getScorePercent() : 0);
            item.put("unlocked", isUnlocked);

            response.add(item);
            previousCompleted = isCompleted;
        }

        return response;
    }

    @Transactional
    public Map<String, Object> completeChapter(String slug, Long chapterId, User user, Integer scorePercent) {
        HistorySection section = historySectionRepository.findById(chapterId)
                .orElseThrow(() -> new IllegalArgumentException("History chapter not found with id: " + chapterId));

        if (!section.getInstrument().getSlug().equalsIgnoreCase(slug)) {
            throw new IllegalArgumentException("Chapter does not belong to instrument: " + slug);
        }

        Optional<UserHistoryProgress> existing = userHistoryProgressRepository.findByUserAndHistorySection(user, section);
        boolean wasAlreadyCompleted = existing.map(UserHistoryProgress::getCompleted).orElse(false);

        int score = scorePercent != null ? scorePercent : 100;
        UserHistoryProgress progress = existing.orElse(new UserHistoryProgress());
        progress.setUser(user);
        progress.setHistorySection(section);
        progress.setCompleted(true);
        progress.setQuizPassed(score >= 70);
        progress.setScorePercent(score);
        progress.setCompletedAt(LocalDateTime.now());
        userHistoryProgressRepository.save(progress);

        int xpAwarded = 0;
        if (!wasAlreadyCompleted) {
            xpAwarded = section.getXpReward();
            gamificationService.awardXp(user, xpAwarded);
            gamificationService.evaluateAchievements(user);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("chapterId", section.getId());
        result.put("completed", true);
        result.put("quizPassed", progress.getQuizPassed());
        result.put("scorePercent", score);
        result.put("xpAwarded", xpAwarded);
        result.put("totalXp", user.getTotalXp());
        result.put("currentLevel", user.getCurrentLevel());
        return result;
    }

    @Transactional
    public HistorySection saveChapter(Long instrumentId, HistorySection section) {
        Instrument instrument = instrumentRepository.findById(instrumentId)
                .orElseThrow(() -> new IllegalArgumentException("Instrument not found with id: " + instrumentId));
        section.setInstrument(instrument);
        if (section.getSectionNumber() == null) {
            List<HistorySection> existing = historySectionRepository.findByInstrumentOrderBySectionNumberAsc(instrument);
            section.setSectionNumber(existing.size() + 1);
        }
        return historySectionRepository.save(section);
    }

    @Transactional
    public HistorySection updateChapter(Long id, HistorySection updated) {
        HistorySection section = historySectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Chapter not found with id: " + id));

        if (updated.getTitle() != null) section.setTitle(updated.getTitle());
        if (updated.getEra() != null) section.setEra(updated.getEra());
        if (updated.getIntroduction() != null) section.setIntroduction(updated.getIntroduction());
        if (updated.getContent() != null) section.setContent(updated.getContent());
        if (updated.getKeyTakeaway() != null) section.setKeyTakeaway(updated.getKeyTakeaway());
        if (updated.getImageCaption() != null) section.setImageCaption(updated.getImageCaption());
        if (updated.getImageUrl() != null) section.setImageUrl(updated.getImageUrl());
        if (updated.getTimelineJson() != null) section.setTimelineJson(updated.getTimelineJson());
        if (updated.getFactsJson() != null) section.setFactsJson(updated.getFactsJson());
        if (updated.getGalleryJson() != null) section.setGalleryJson(updated.getGalleryJson());
        if (updated.getAudioNote() != null) section.setAudioNote(updated.getAudioNote());
        if (updated.getAudioDescription() != null) section.setAudioDescription(updated.getAudioDescription());
        if (updated.getQuizJson() != null) section.setQuizJson(updated.getQuizJson());
        if (updated.getXpReward() != null) section.setXpReward(updated.getXpReward());
        if (updated.getDurationMinutes() != null) section.setDurationMinutes(updated.getDurationMinutes());
        if (updated.getSectionNumber() != null) section.setSectionNumber(updated.getSectionNumber());
        if (updated.getIsPublished() != null) section.setIsPublished(updated.getIsPublished());

        return historySectionRepository.save(section);
    }

    @Transactional
    public HistorySection togglePublish(Long id) {
        HistorySection section = historySectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Chapter not found with id: " + id));
        section.setIsPublished(!Boolean.TRUE.equals(section.getIsPublished()));
        return historySectionRepository.save(section);
    }

    @Transactional
    public void deleteChapter(Long id) {
        historySectionRepository.deleteById(id);
    }
}
