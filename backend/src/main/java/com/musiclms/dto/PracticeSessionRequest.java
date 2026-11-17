package com.musiclms.dto;

public class PracticeSessionRequest {
    private String instrumentSlug = "piano";
    private Integer durationSeconds;
    private String notes;
    private String audioRecordingUrl;

    public PracticeSessionRequest() {}

    public String getInstrumentSlug() { return instrumentSlug; }
    public void setInstrumentSlug(String instrumentSlug) { this.instrumentSlug = instrumentSlug; }

    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getAudioRecordingUrl() { return audioRecordingUrl; }
    public void setAudioRecordingUrl(String audioRecordingUrl) { this.audioRecordingUrl = audioRecordingUrl; }
}
