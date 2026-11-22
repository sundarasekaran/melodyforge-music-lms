package com.musiclms.dto;

public class CompleteRoutineRequest {
    private Integer durationSeconds;
    private Integer completedExercises;
    private String notes;
    private String audioRecordingUrl;

    public CompleteRoutineRequest() {}

    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }

    public Integer getCompletedExercises() { return completedExercises; }
    public void setCompletedExercises(Integer completedExercises) { this.completedExercises = completedExercises; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getAudioRecordingUrl() { return audioRecordingUrl; }
    public void setAudioRecordingUrl(String audioRecordingUrl) { this.audioRecordingUrl = audioRecordingUrl; }
}
