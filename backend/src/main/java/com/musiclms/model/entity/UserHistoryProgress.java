package com.musiclms.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_history_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "history_section_id"})
})
public class UserHistoryProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "history_section_id", nullable = false)
    private HistorySection historySection;

    @Column(nullable = false)
    private Boolean completed = false;

    @Column(name = "quiz_passed")
    private Boolean quizPassed = false;

    @Column(name = "score_percent")
    private Integer scorePercent;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public UserHistoryProgress() {}

    public UserHistoryProgress(User user, HistorySection historySection, Boolean completed, Boolean quizPassed, Integer scorePercent, LocalDateTime completedAt) {
        this.user = user;
        this.historySection = historySection;
        this.completed = completed;
        this.quizPassed = quizPassed;
        this.scorePercent = scorePercent;
        this.completedAt = completedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public HistorySection getHistorySection() { return historySection; }
    public void setHistorySection(HistorySection historySection) { this.historySection = historySection; }

    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }

    public Boolean getQuizPassed() { return quizPassed; }
    public void setQuizPassed(Boolean quizPassed) { this.quizPassed = quizPassed; }

    public Integer getScorePercent() { return scorePercent; }
    public void setScorePercent(Integer scorePercent) { this.scorePercent = scorePercent; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
