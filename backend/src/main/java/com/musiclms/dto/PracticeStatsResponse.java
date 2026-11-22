package com.musiclms.dto;

public class PracticeStatsResponse {
    private long totalPracticeSeconds;
    private long totalSessionsCompleted;
    private long routinesCompletedCount;
    private int currentStreakDays;
    private int totalPracticeXp;

    public PracticeStatsResponse() {}

    public PracticeStatsResponse(long totalPracticeSeconds, long totalSessionsCompleted, long routinesCompletedCount, int currentStreakDays, int totalPracticeXp) {
        this.totalPracticeSeconds = totalPracticeSeconds;
        this.totalSessionsCompleted = totalSessionsCompleted;
        this.routinesCompletedCount = routinesCompletedCount;
        this.currentStreakDays = currentStreakDays;
        this.totalPracticeXp = totalPracticeXp;
    }

    public long getTotalPracticeSeconds() { return totalPracticeSeconds; }
    public void setTotalPracticeSeconds(long totalPracticeSeconds) { this.totalPracticeSeconds = totalPracticeSeconds; }

    public long getTotalSessionsCompleted() { return totalSessionsCompleted; }
    public void setTotalSessionsCompleted(long totalSessionsCompleted) { this.totalSessionsCompleted = totalSessionsCompleted; }

    public long getRoutinesCompletedCount() { return routinesCompletedCount; }
    public void setRoutinesCompletedCount(long routinesCompletedCount) { this.routinesCompletedCount = routinesCompletedCount; }

    public int getCurrentStreakDays() { return currentStreakDays; }
    public void setCurrentStreakDays(int currentStreakDays) { this.currentStreakDays = currentStreakDays; }

    public int getTotalPracticeXp() { return totalPracticeXp; }
    public void setTotalPracticeXp(int totalPracticeXp) { this.totalPracticeXp = totalPracticeXp; }
}
