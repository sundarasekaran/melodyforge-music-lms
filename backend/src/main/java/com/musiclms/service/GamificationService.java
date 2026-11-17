package com.musiclms.service;

import com.musiclms.dto.LeaderboardResponse;
import com.musiclms.model.entity.Badge;
import com.musiclms.model.entity.User;
import com.musiclms.model.entity.UserBadge;
import com.musiclms.repository.BadgeRepository;
import com.musiclms.repository.UserBadgeRepository;
import com.musiclms.repository.UserProgressRepository;
import com.musiclms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GamificationService {

    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserProgressRepository userProgressRepository;

    public GamificationService(UserRepository userRepository,
                               BadgeRepository badgeRepository,
                               UserBadgeRepository userBadgeRepository,
                               UserProgressRepository userProgressRepository) {
        this.userRepository = userRepository;
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.userProgressRepository = userProgressRepository;
    }

    @Transactional
    public void awardXp(User user, int xp) {
        user.setTotalXp(user.getTotalXp() + xp);
        // Calculate Level: Level 1 = 0-200 XP, Level 2 = 201-500, Level 3 = 501-900, Level N = (N-1)*300
        int calculatedLevel = Math.max(1, (user.getTotalXp() / 250) + 1);
        user.setCurrentLevel(calculatedLevel);
        userRepository.save(user);
    }

    @Transactional
    public void updateStreak(User user) {
        LocalDateTime now = LocalDateTime.now();
        if (user.getLastPracticeDate() == null) {
            user.setCurrentStreakDays(1);
        } else {
            long daysBetween = ChronoUnit.DAYS.between(user.getLastPracticeDate().toLocalDate(), now.toLocalDate());
            if (daysBetween == 1) {
                user.setCurrentStreakDays(user.getCurrentStreakDays() + 1);
            } else if (daysBetween > 1) {
                user.setCurrentStreakDays(1);
            }
        }
        user.setLastPracticeDate(now);
        userRepository.save(user);
    }

    @Transactional
    public void evaluateAchievements(User user) {
        Long completedLessons = userProgressRepository.countByUserAndCompletedTrue(user);

        // First Lesson Badge
        if (completedLessons >= 1) {
            awardBadgeIfNotPresent(user, "FIRST_NOTE");
        }
        // Basics Tier Explorer (3 lessons completed)
        if (completedLessons >= 3) {
            awardBadgeIfNotPresent(user, "KEYBOARD_EXPLORER");
        }
        // Basics Master (9 lessons completed)
        if (completedLessons >= 9) {
            awardBadgeIfNotPresent(user, "BASICS_GRADUATE");
        }
        // Streak Badges
        if (user.getCurrentStreakDays() >= 3) {
            awardBadgeIfNotPresent(user, "STREAK_3_DAYS");
        }
        if (user.getCurrentStreakDays() >= 7) {
            awardBadgeIfNotPresent(user, "STREAK_7_DAYS");
        }
        // XP Milestone (500 XP)
        if (user.getTotalXp() >= 500) {
            awardBadgeIfNotPresent(user, "XP_MASTER_500");
        }
    }

    @Transactional
    public void awardBadgeIfNotPresent(User user, String badgeCode) {
        badgeRepository.findByCode(badgeCode).ifPresent(badge -> {
            if (!userBadgeRepository.existsByUserAndBadge(user, badge)) {
                UserBadge userBadge = new UserBadge(user, badge);
                userBadgeRepository.save(userBadge);
                // Also award bonus XP for badge
                awardXp(user, badge.getXpBonus());
            }
        });
    }

    @Transactional(readOnly = true)
    public List<Badge> getAllBadges() {
        return badgeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<UserBadge> getUserBadges(User user) {
        return userBadgeRepository.findByUserOrderByAwardedAtDesc(user);
    }

    @Transactional(readOnly = true)
    public List<LeaderboardResponse> getLeaderboard() {
        return userRepository.findTop10ByOrderByTotalXpDesc().stream()
                .map(u -> new LeaderboardResponse(
                        u.getId(),
                        u.getUsername(),
                        u.getDisplayName(),
                        u.getTotalXp(),
                        u.getCurrentLevel(),
                        u.getCurrentStreakDays()
                ))
                .collect(Collectors.toList());
    }
}
