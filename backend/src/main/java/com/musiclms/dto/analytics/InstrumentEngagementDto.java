package com.musiclms.dto.analytics;

public class InstrumentEngagementDto {
    private String slug;
    private String name;
    private String family;
    private long activeLearners;
    private long completedLessons;
    private long practiceSessionsCount;
    private long totalPracticeMinutes;

    public InstrumentEngagementDto() {}

    public InstrumentEngagementDto(String slug, String name, String family, long activeLearners, long completedLessons, long practiceSessionsCount, long totalPracticeMinutes) {
        this.slug = slug;
        this.name = name;
        this.family = family;
        this.activeLearners = activeLearners;
        this.completedLessons = completedLessons;
        this.practiceSessionsCount = practiceSessionsCount;
        this.totalPracticeMinutes = totalPracticeMinutes;
    }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFamily() { return family; }
    public void setFamily(String family) { this.family = family; }

    public long getActiveLearners() { return activeLearners; }
    public void setActiveLearners(long activeLearners) { this.activeLearners = activeLearners; }

    public long getCompletedLessons() { return completedLessons; }
    public void setCompletedLessons(long completedLessons) { this.completedLessons = completedLessons; }

    public long getPracticeSessionsCount() { return practiceSessionsCount; }
    public void setPracticeSessionsCount(long practiceSessionsCount) { this.practiceSessionsCount = practiceSessionsCount; }

    public long getTotalPracticeMinutes() { return totalPracticeMinutes; }
    public void setTotalPracticeMinutes(long totalPracticeMinutes) { this.totalPracticeMinutes = totalPracticeMinutes; }
}
