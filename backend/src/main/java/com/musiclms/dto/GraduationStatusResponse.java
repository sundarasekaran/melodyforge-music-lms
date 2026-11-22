package com.musiclms.dto;

public class GraduationStatusResponse {
    private boolean level1Passed;
    private boolean level2Passed;
    private boolean level3Passed;
    private Integer level1BestScore;
    private Integer level2BestScore;
    private Integer level3BestScore;
    private boolean eligibleForGraduation;
    private boolean certificateConferred;
    private String certificateNumber;

    public GraduationStatusResponse() {}

    public boolean isLevel1Passed() { return level1Passed; }
    public void setLevel1Passed(boolean level1Passed) { this.level1Passed = level1Passed; }

    public boolean isLevel2Passed() { return level2Passed; }
    public void setLevel2Passed(boolean level2Passed) { this.level2Passed = level2Passed; }

    public boolean isLevel3Passed() { return level3Passed; }
    public void setLevel3Passed(boolean level3Passed) { this.level3Passed = level3Passed; }

    public Integer getLevel1BestScore() { return level1BestScore; }
    public void setLevel1BestScore(Integer level1BestScore) { this.level1BestScore = level1BestScore; }

    public Integer getLevel2BestScore() { return level2BestScore; }
    public void setLevel2BestScore(Integer level2BestScore) { this.level2BestScore = level2BestScore; }

    public Integer getLevel3BestScore() { return level3BestScore; }
    public void setLevel3BestScore(Integer level3BestScore) { this.level3BestScore = level3BestScore; }

    public boolean isEligibleForGraduation() { return eligibleForGraduation; }
    public void setEligibleForGraduation(boolean eligibleForGraduation) { this.eligibleForGraduation = eligibleForGraduation; }

    public boolean isCertificateConferred() { return certificateConferred; }
    public void setCertificateConferred(boolean certificateConferred) { this.certificateConferred = certificateConferred; }

    public String getCertificateNumber() { return certificateNumber; }
    public void setCertificateNumber(String certificateNumber) { this.certificateNumber = certificateNumber; }
}
