package com.musiclms.dto.analytics;

public class AssessmentLevelMetricDto {
    private int level;
    private String title;
    private int passThresholdPercent;
    private long totalAttempts;
    private long passedCount;
    private double passRate;
    private double averageScore;

    public AssessmentLevelMetricDto() {}

    public AssessmentLevelMetricDto(int level, String title, int passThresholdPercent, long totalAttempts, long passedCount, double passRate, double averageScore) {
        this.level = level;
        this.title = title;
        this.passThresholdPercent = passThresholdPercent;
        this.totalAttempts = totalAttempts;
        this.passedCount = passedCount;
        this.passRate = passRate;
        this.averageScore = averageScore;
    }

    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public int getPassThresholdPercent() { return passThresholdPercent; }
    public void setPassThresholdPercent(int passThresholdPercent) { this.passThresholdPercent = passThresholdPercent; }

    public long getTotalAttempts() { return totalAttempts; }
    public void setTotalAttempts(long totalAttempts) { this.totalAttempts = totalAttempts; }

    public long getPassedCount() { return passedCount; }
    public void setPassedCount(long passedCount) { this.passedCount = passedCount; }

    public double getPassRate() { return passRate; }
    public void setPassRate(double passRate) { this.passRate = passRate; }

    public double getAverageScore() { return averageScore; }
    public void setAverageScore(double averageScore) { this.averageScore = averageScore; }
}
