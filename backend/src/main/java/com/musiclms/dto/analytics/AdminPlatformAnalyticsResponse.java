package com.musiclms.dto.analytics;

import java.util.List;

public class AdminPlatformAnalyticsResponse {
    private long totalRegisteredStudents;
    private long activeStudentsCount;
    private long totalCompletedLessons;
    private long totalPracticeSessions;
    private long totalPracticeDurationMinutes;
    private long totalAssessmentAttempts;
    private long totalCertificatesIssued;
    private double assessmentPassRate;

    private List<InstrumentEngagementDto> instrumentPopularity;
    private List<LessonPopularityDto> mostCompletedLessons;
    private List<AssessmentLevelMetricDto> assessmentLevelBreakdown;
    private List<WeeklyTrendDto> weeklyActivityTrend;

    public AdminPlatformAnalyticsResponse() {}

    public long getTotalRegisteredStudents() { return totalRegisteredStudents; }
    public void setTotalRegisteredStudents(long totalRegisteredStudents) { this.totalRegisteredStudents = totalRegisteredStudents; }

    public long getActiveStudentsCount() { return activeStudentsCount; }
    public void setActiveStudentsCount(long activeStudentsCount) { this.activeStudentsCount = activeStudentsCount; }

    public long getTotalCompletedLessons() { return totalCompletedLessons; }
    public void setTotalCompletedLessons(long totalCompletedLessons) { this.totalCompletedLessons = totalCompletedLessons; }

    public long getTotalPracticeSessions() { return totalPracticeSessions; }
    public void setTotalPracticeSessions(long totalPracticeSessions) { this.totalPracticeSessions = totalPracticeSessions; }

    public long getTotalPracticeDurationMinutes() { return totalPracticeDurationMinutes; }
    public void setTotalPracticeDurationMinutes(long totalPracticeDurationMinutes) { this.totalPracticeDurationMinutes = totalPracticeDurationMinutes; }

    public long getTotalAssessmentAttempts() { return totalAssessmentAttempts; }
    public void setTotalAssessmentAttempts(long totalAssessmentAttempts) { this.totalAssessmentAttempts = totalAssessmentAttempts; }

    public long getTotalCertificatesIssued() { return totalCertificatesIssued; }
    public void setTotalCertificatesIssued(long totalCertificatesIssued) { this.totalCertificatesIssued = totalCertificatesIssued; }

    public double getAssessmentPassRate() { return assessmentPassRate; }
    public void setAssessmentPassRate(double assessmentPassRate) { this.assessmentPassRate = assessmentPassRate; }

    public List<InstrumentEngagementDto> getInstrumentPopularity() { return instrumentPopularity; }
    public void setInstrumentPopularity(List<InstrumentEngagementDto> instrumentPopularity) { this.instrumentPopularity = instrumentPopularity; }

    public List<LessonPopularityDto> getMostCompletedLessons() { return mostCompletedLessons; }
    public void setMostCompletedLessons(List<LessonPopularityDto> mostCompletedLessons) { this.mostCompletedLessons = mostCompletedLessons; }

    public List<AssessmentLevelMetricDto> getAssessmentLevelBreakdown() { return assessmentLevelBreakdown; }
    public void setAssessmentLevelBreakdown(List<AssessmentLevelMetricDto> assessmentLevelBreakdown) { this.assessmentLevelBreakdown = assessmentLevelBreakdown; }

    public List<WeeklyTrendDto> getWeeklyActivityTrend() { return weeklyActivityTrend; }
    public void setWeeklyActivityTrend(List<WeeklyTrendDto> weeklyActivityTrend) { this.weeklyActivityTrend = weeklyActivityTrend; }
}
