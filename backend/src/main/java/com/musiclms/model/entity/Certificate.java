package com.musiclms.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instrument_id", nullable = false)
    private Instrument instrument;

    @Column(name = "certificate_number", length = 100, nullable = false, unique = true)
    private String certificateNumber;

    @Column(nullable = false, length = 200)
    private String title = "Certificate of Piano Academy Completion";

    @Column(name = "recipient_name", nullable = false, length = 150)
    private String recipientName;

    @Column(name = "curriculum_title", nullable = false, length = 200)
    private String curriculumTitle = "Beginner to Early Intermediate Conservatory Piano Curriculum";

    @Column(name = "final_score_percent", nullable = false)
    private Integer finalScorePercent;

    @Column(name = "conferred_at", nullable = false)
    private LocalDateTime conferredAt = LocalDateTime.now();

    @Column(name = "verification_hash", length = 120, nullable = false)
    private String verificationHash;

    @Column(length = 30, nullable = false)
    private String status = "ACTIVE";

    public Certificate() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Instrument getInstrument() { return instrument; }
    public void setInstrument(Instrument instrument) { this.instrument = instrument; }

    public String getCertificateNumber() { return certificateNumber; }
    public void setCertificateNumber(String certificateNumber) { this.certificateNumber = certificateNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getCurriculumTitle() { return curriculumTitle; }
    public void setCurriculumTitle(String curriculumTitle) { this.curriculumTitle = curriculumTitle; }

    public Integer getFinalScorePercent() { return finalScorePercent; }
    public void setFinalScorePercent(Integer finalScorePercent) { this.finalScorePercent = finalScorePercent; }

    public LocalDateTime getConferredAt() { return conferredAt; }
    public void setConferredAt(LocalDateTime conferredAt) { this.conferredAt = conferredAt; }

    public String getVerificationHash() { return verificationHash; }
    public void setVerificationHash(String verificationHash) { this.verificationHash = verificationHash; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
