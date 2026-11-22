package com.musiclms.dto;

public class AssessmentResponse {
    private Integer level;
    private String code;
    private String title;
    private String description;
    private Integer passingThreshold;
    private Integer totalQuestions;
    private Integer xpReward;
    private String status; // LOCKED, AVAILABLE, PASSED, FAILED
    private Integer bestScorePercent;
    private Integer attemptCount;

    public AssessmentResponse() {}

    public AssessmentResponse(Integer level, String code, String title, String description,
                              Integer passingThreshold, Integer totalQuestions, Integer xpReward,
                              String status, Integer bestScorePercent, Integer attemptCount) {
        this.level = level;
        this.code = code;
        this.title = title;
        this.description = description;
        this.passingThreshold = passingThreshold;
        this.totalQuestions = totalQuestions;
        this.xpReward = xpReward;
        this.status = status;
        this.bestScorePercent = bestScorePercent;
        this.attemptCount = attemptCount;
    }

    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getPassingThreshold() { return passingThreshold; }
    public void setPassingThreshold(Integer passingThreshold) { this.passingThreshold = passingThreshold; }

    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }

    public Integer getXpReward() { return xpReward; }
    public void setXpReward(Integer xpReward) { this.xpReward = xpReward; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getBestScorePercent() { return bestScorePercent; }
    public void setBestScorePercent(Integer bestScorePercent) { this.bestScorePercent = bestScorePercent; }

    public Integer getAttemptCount() { return attemptCount; }
    public void setAttemptCount(Integer attemptCount) { this.attemptCount = attemptCount; }
}
