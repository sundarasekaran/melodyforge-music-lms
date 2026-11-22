package com.musiclms.dto.analytics;

public class InstrumentProgressDto {
    private String slug;
    private String name;
    private String family;
    private int completedLessons;
    private int totalLessons;
    private int completionPercent;
    private int practiceMinutes;

    public InstrumentProgressDto() {}

    public InstrumentProgressDto(String slug, String name, String family, int completedLessons, int totalLessons, int completionPercent, int practiceMinutes) {
        this.slug = slug;
        this.name = name;
        this.family = family;
        this.completedLessons = completedLessons;
        this.totalLessons = totalLessons;
        this.completionPercent = completionPercent;
        this.practiceMinutes = practiceMinutes;
    }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFamily() { return family; }
    public void setFamily(String family) { this.family = family; }

    public int getCompletedLessons() { return completedLessons; }
    public void setCompletedLessons(int completedLessons) { this.completedLessons = completedLessons; }

    public int getTotalLessons() { return totalLessons; }
    public void setTotalLessons(int totalLessons) { this.totalLessons = totalLessons; }

    public int getCompletionPercent() { return completionPercent; }
    public void setCompletionPercent(int completionPercent) { this.completionPercent = completionPercent; }

    public int getPracticeMinutes() { return practiceMinutes; }
    public void setPracticeMinutes(int practiceMinutes) { this.practiceMinutes = practiceMinutes; }
}
