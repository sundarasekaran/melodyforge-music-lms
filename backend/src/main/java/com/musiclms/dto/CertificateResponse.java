package com.musiclms.dto;

import java.time.LocalDateTime;

public class CertificateResponse {
    private Long id;
    private String certificateNumber;
    private String title;
    private String recipientName;
    private String instrumentName;
    private String curriculumTitle;
    private Integer finalScorePercent;
    private LocalDateTime conferredAt;
    private String verificationHash;
    private String status;

    public CertificateResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCertificateNumber() { return certificateNumber; }
    public void setCertificateNumber(String certificateNumber) { this.certificateNumber = certificateNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getInstrumentName() { return instrumentName; }
    public void setInstrumentName(String instrumentName) { this.instrumentName = instrumentName; }

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
