package com.musiclms.dto.analytics;

import java.util.List;

public class StudentAnalyticsResponse {
    private int totalLearningMinutes;
    private int totalPracticeSeconds;
    private int totalPracticeMinutes;
    private int completedLessonsCount;
    private int completedRoutinesCount;
    private int assessmentAttemptsCount;
    private int assessmentPassedCount;
    private double assessmentPassRate;
    private int bestAssessmentScore;
    private int currentXp;
    private int totalXp;
    private int currentLevel;
    private int currentStreakDays;
    private int earnedBadgesCount;

    private List<InstrumentProgressDto> instrumentProgress;
    private List<DailyPracticeDto> weeklyPractice;
    private List<AssessmentScoreRecordDto> scoreHistory;
    private List<RecentActivityDto> recentActivities;

    public StudentAnalyticsResponse() {}

    // Getters and Setters
    public int getTotalLearningMinutes() { return totalLearningMinutes; }
    public void setTotalLearningMinutes(int totalLearningMinutes) { this.totalLearningMinutes = totalLearningMinutes; }

    public int getTotalPracticeSeconds() { return totalPracticeSeconds; }
    public void setTotalPracticeSeconds(int totalPracticeSeconds) { this.totalPracticeSeconds = totalPracticeSeconds; }

    public int getTotalPracticeMinutes() { return totalPracticeMinutes; }
    public void setTotalPracticeMinutes(int totalPracticeMinutes) { this.totalPracticeMinutes = totalPracticeMinutes; }

    public int getCompletedLessonsCount() { return completedLessonsCount; }
    public void setCompletedLessonsCount(int completedLessonsCount) { this.completedLessonsCount = completedLessonsCount; }

    public int getCompletedRoutinesCount() { return completedRoutinesCount; }
    public void setCompletedRoutinesCount(int completedRoutinesCount) { this.completedRoutinesCount = completedRoutinesCount; }

    public int getAssessmentAttemptsCount() { return assessmentAttemptsCount; }
    public void setAssessmentAttemptsCount(int assessmentAttemptsCount) { this.assessmentAttemptsCount = assessmentAttemptsCount; }

    public int getAssessmentPassedCount() { return assessmentPassedCount; }
    public void setAssessmentPassedCount(int assessmentPassedCount) { this.assessmentPassedCount = assessmentPassedCount; }

    public double getAssessmentPassRate() { return assessmentPassRate; }
    public void setAssessmentPassRate(double assessmentPassRate) { this.assessmentPassRate = assessmentPassRate; }

    public int getBestAssessmentScore() { return bestAssessmentScore; }
    public void setBestAssessmentScore(int bestAssessmentScore) { this.bestAssessmentScore = bestAssessmentScore; }

    public int getCurrentXp() { return currentXp; }
    public void setCurrentXp(int currentXp) { this.currentXp = currentXp; }

    public int getTotalXp() { return totalXp; }
    public void setTotalXp(int totalXp) { this.totalXp = totalXp; }

    public int getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(int currentLevel) { this.currentLevel = currentLevel; }

    public int getCurrentStreakDays() { return currentStreakDays; }
    public void setCurrentStreakDays(int currentStreakDays) { this.currentStreakDays = currentStreakDays; }

    public int getEarnedBadgesCount() { return earnedBadgesCount; }
    public void setEarnedBadgesCount(int earnedBadgesCount) { this.earnedBadgesCount = earnedBadgesCount; }

    public List<InstrumentProgressDto> getInstrumentProgress() { return instrumentProgress; }
    public void setInstrumentProgress(List<InstrumentProgressDto> instrumentProgress) { this.instrumentProgress = instrumentProgress; }

    public List<DailyPracticeDto> getWeeklyPractice() { return weeklyPractice; }
    public void setWeeklyPractice(List<DailyPracticeDto> weeklyPractice) { this.weeklyPractice = weeklyPractice; }

    public List<AssessmentScoreRecordDto> getScoreHistory() { return scoreHistory; }
    public void setScoreHistory(List<AssessmentScoreRecordDto> scoreHistory) { this.scoreHistory = scoreHistory; }

    public List<RecentActivityDto> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<RecentActivityDto> recentActivities) { this.recentActivities = recentActivities; }
}
