package com.musiclms.dto;

import java.util.List;

public class SubmitAssessmentRequest {
    private List<SubmittedAnswerDto> answers;

    public SubmitAssessmentRequest() {}

    public List<SubmittedAnswerDto> getAnswers() { return answers; }
    public void setAnswers(List<SubmittedAnswerDto> answers) { this.answers = answers; }
}
