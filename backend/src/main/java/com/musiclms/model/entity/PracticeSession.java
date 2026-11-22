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

    // --- Phase 3: Structured Practice Routine Fields ---
    @Column(name = "routine_id", length = 100)
    private String routineId;

    @Column(name = "routine_title", length = 200)
    private String routineTitle;

    @Column(name = "target_bpm")
    private Integer targetBpm;

    @Column(name = "time_signature", length = 10)
    private String timeSignature;

    @Column(name = "completed_exercises")
    private Integer completedExercises = 0;

    @Column(name = "total_exercises")
    private Integer totalExercises = 0;

    @Column(name = "status", length = 30)
    private String status = "COMPLETED";

    @Column(name = "started_at")
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public PracticeSession() {}

    public PracticeSession(User user, Instrument instrument, Integer durationSeconds, String notes, String audioRecordingUrl, Integer xpEarned) {
        this.user = user;
        this.instrument = instrument;
        this.durationSeconds = durationSeconds;
        this.notes = notes;
        this.audioRecordingUrl = audioRecordingUrl;
        this.xpEarned = xpEarned;
        this.practicedAt = LocalDateTime.now();
        this.startedAt = LocalDateTime.now();
        this.completedAt = LocalDateTime.now();
        this.status = "COMPLETED";
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

    public String getRoutineId() { return routineId; }
    public void setRoutineId(String routineId) { this.routineId = routineId; }

    public String getRoutineTitle() { return routineTitle; }
    public void setRoutineTitle(String routineTitle) { this.routineTitle = routineTitle; }

    public Integer getTargetBpm() { return targetBpm; }
    public void setTargetBpm(Integer targetBpm) { this.targetBpm = targetBpm; }

    public String getTimeSignature() { return timeSignature; }
    public void setTimeSignature(String timeSignature) { this.timeSignature = timeSignature; }

    public Integer getCompletedExercises() { return completedExercises; }
    public void setCompletedExercises(Integer completedExercises) { this.completedExercises = completedExercises; }

    public Integer getTotalExercises() { return totalExercises; }
    public void setTotalExercises(Integer totalExercises) { this.totalExercises = totalExercises; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
