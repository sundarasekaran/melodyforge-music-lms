package com.musiclms.dto;

public class ExerciseEvaluationRequest {
    private String answer;

    public ExerciseEvaluationRequest() {}
    public ExerciseEvaluationRequest(String answer) { this.answer = answer; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
}
