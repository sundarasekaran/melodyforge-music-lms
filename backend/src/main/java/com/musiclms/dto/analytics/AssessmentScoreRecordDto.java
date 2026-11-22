package com.musiclms.dto.analytics;

public class AssessmentScoreRecordDto {
    private int level;
    private int scorePercent;
    private boolean passed;
    private int earnedPoints;
    private int totalPoints;
    private String completedAt;

    public AssessmentScoreRecordDto() {}

    public AssessmentScoreRecordDto(int level, int scorePercent, boolean passed, int earnedPoints, int totalPoints, String completedAt) {
        this.level = level;
        this.scorePercent = scorePercent;
        this.passed = passed;
        this.earnedPoints = earnedPoints;
        this.totalPoints = totalPoints;
        this.completedAt = completedAt;
    }

    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }

    public int getScorePercent() { return scorePercent; }
    public void setScorePercent(int scorePercent) { this.scorePercent = scorePercent; }

    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }

    public int getEarnedPoints() { return earnedPoints; }
    public void setEarnedPoints(int earnedPoints) { this.earnedPoints = earnedPoints; }

    public int getTotalPoints() { return totalPoints; }
    public void setTotalPoints(int totalPoints) { this.totalPoints = totalPoints; }

    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }
}
