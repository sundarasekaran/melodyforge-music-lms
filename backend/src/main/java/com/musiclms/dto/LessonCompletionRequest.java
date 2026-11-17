package com.musiclms.dto;

public class LessonCompletionRequest {
    private Integer scorePercent = 100;

    public LessonCompletionRequest() {}
    public LessonCompletionRequest(Integer scorePercent) { this.scorePercent = scorePercent; }

    public Integer getScorePercent() { return scorePercent; }
    public void setScorePercent(Integer scorePercent) { this.scorePercent = scorePercent; }
}
