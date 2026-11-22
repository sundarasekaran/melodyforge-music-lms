package com.musiclms.dto;

public class UpdateRoutineProgressRequest {
    private Integer durationSeconds;
    private Integer completedExercises;
    private String notes;

    public UpdateRoutineProgressRequest() {}

    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }

    public Integer getCompletedExercises() { return completedExercises; }
    public void setCompletedExercises(Integer completedExercises) { this.completedExercises = completedExercises; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
