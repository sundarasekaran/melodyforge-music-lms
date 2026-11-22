package com.musiclms.dto;

import java.util.List;

public class SubmittedAnswerDto {
    private String questionId;
    private Integer selectedOptionIndex;
    private Integer selectedKeyMidi;
    private List<Integer> playedSequence;

    public SubmittedAnswerDto() {}

    public String getQuestionId() { return questionId; }
    public void setQuestionId(String questionId) { this.questionId = questionId; }

    public Integer getSelectedOptionIndex() { return selectedOptionIndex; }
    public void setSelectedOptionIndex(Integer selectedOptionIndex) { this.selectedOptionIndex = selectedOptionIndex; }

    public Integer getSelectedKeyMidi() { return selectedKeyMidi; }
    public void setSelectedKeyMidi(Integer selectedKeyMidi) { this.selectedKeyMidi = selectedKeyMidi; }

    public List<Integer> getPlayedSequence() { return playedSequence; }
    public void setPlayedSequence(List<Integer> playedSequence) { this.playedSequence = playedSequence; }
}
