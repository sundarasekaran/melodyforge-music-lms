package com.musiclms.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "practice_sessions")
public class PracticeSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instrument_id", nullable = false)
    private Instrument instrument;

    @Column(name = "duration_seconds", nullable = false)
    private Integer durationSeconds;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "audio_recording_url", length = 500)
    private String audioRecordingUrl;

    @Column(name = "xp_earned", nullable = false)
    private Integer xpEarned = 25;

    @Column(name = "practiced_at", nullable = false)
    private LocalDateTime practicedAt = LocalDateTime.now();

    public PracticeSession() {}

    public PracticeSession(User user, Instrument instrument, Integer durationSeconds, String notes, String audioRecordingUrl, Integer xpEarned) {
        this.user = user;
        this.instrument = instrument;
        this.durationSeconds = durationSeconds;
        this.notes = notes;
        this.audioRecordingUrl = audioRecordingUrl;
        this.xpEarned = xpEarned;
        this.practicedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Instrument getInstrument() { return instrument; }
    public void setInstrument(Instrument instrument) { this.instrument = instrument; }

    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getAudioRecordingUrl() { return audioRecordingUrl; }
    public void setAudioRecordingUrl(String audioRecordingUrl) { this.audioRecordingUrl = audioRecordingUrl; }

    public Integer getXpEarned() { return xpEarned; }
    public void setXpEarned(Integer xpEarned) { this.xpEarned = xpEarned; }

    public LocalDateTime getPracticedAt() { return practicedAt; }
    public void setPracticedAt(LocalDateTime practicedAt) { this.practicedAt = practicedAt; }
}
