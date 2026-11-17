package com.musiclms.dto;

public class ExerciseEvaluationResponse {
    private Boolean correct;
    private String expectedAnswer;
    private Integer pointsAwarded;
    private String explanation;

    public ExerciseEvaluationResponse() {}

    public ExerciseEvaluationResponse(Boolean correct, String expectedAnswer, Integer pointsAwarded, String explanation) {
        this.correct = correct;
        this.expectedAnswer = expectedAnswer;
        this.pointsAwarded = pointsAwarded;
        this.explanation = explanation;
    }

    public Boolean getCorrect() { return correct; }
    public void setCorrect(Boolean correct) { this.correct = correct; }

    public String getExpectedAnswer() { return expectedAnswer; }
    public void setExpectedAnswer(String expectedAnswer) { this.expectedAnswer = expectedAnswer; }

    public Integer getPointsAwarded() { return pointsAwarded; }
    public void setPointsAwarded(Integer pointsAwarded) { this.pointsAwarded = pointsAwarded; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
