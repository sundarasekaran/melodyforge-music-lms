package com.musiclms.dto;

import java.util.Map;

public class AdminAssessmentStatsResponse {
    private long totalAttempts;
    private long level1Attempts;
    private long level2Attempts;
    private long level3Attempts;
    private long level1Passed;
    private long level2Passed;
    private long level3Passed;
    private long totalCertificatesIssued;

    public AdminAssessmentStatsResponse() {}

    public AdminAssessmentStatsResponse(long totalAttempts, long level1Attempts, long level2Attempts, long level3Attempts,
                                       long level1Passed, long level2Passed, long level3Passed, long totalCertificatesIssued) {
        this.totalAttempts = totalAttempts;
        this.level1Attempts = level1Attempts;
        this.level2Attempts = level2Attempts;
        this.level3Attempts = level3Attempts;
        this.level1Passed = level1Passed;
        this.level2Passed = level2Passed;
        this.level3Passed = level3Passed;
        this.totalCertificatesIssued = totalCertificatesIssued;
    }

    public long getTotalAttempts() { return totalAttempts; }
    public void setTotalAttempts(long totalAttempts) { this.totalAttempts = totalAttempts; }

    public long getLevel1Attempts() { return level1Attempts; }
    public void setLevel1Attempts(long level1Attempts) { this.level1Attempts = level1Attempts; }

    public long getLevel2Attempts() { return level2Attempts; }
    public void setLevel2Attempts(long level2Attempts) { this.level2Attempts = level2Attempts; }

    public long getLevel3Attempts() { return level3Attempts; }
    public void setLevel3Attempts(long level3Attempts) { this.level3Attempts = level3Attempts; }

    public long getLevel1Passed() { return level1Passed; }
    public void setLevel1Passed(long level1Passed) { this.level1Passed = level1Passed; }

    public long getLevel2Passed() { return level2Passed; }
    public void setLevel2Passed(long level2Passed) { this.level2Passed = level2Passed; }

    public long getLevel3Passed() { return level3Passed; }
    public void setLevel3Passed(long level3Passed) { this.level3Passed = level3Passed; }

    public long getTotalCertificatesIssued() { return totalCertificatesIssued; }
    public void setTotalCertificatesIssued(long totalCertificatesIssued) { this.totalCertificatesIssued = totalCertificatesIssued; }
}
