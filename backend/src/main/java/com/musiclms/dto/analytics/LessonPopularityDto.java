package com.musiclms.dto.analytics;

public class LessonPopularityDto {
    private Long lessonId;
    private String title;
    private String instrumentName;
    private String tierName;
    private long completionsCount;

    public LessonPopularityDto() {}

    public LessonPopularityDto(Long lessonId, String title, String instrumentName, String tierName, long completionsCount) {
        this.lessonId = lessonId;
        this.title = title;
        this.instrumentName = instrumentName;
        this.tierName = tierName;
        this.completionsCount = completionsCount;
    }

    public Long getLessonId() { return lessonId; }
    public void setLessonId(Long lessonId) { this.lessonId = lessonId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getInstrumentName() { return instrumentName; }
    public void setInstrumentName(String instrumentName) { this.instrumentName = instrumentName; }

    public String getTierName() { return tierName; }
    public void setTierName(String tierName) { this.tierName = tierName; }

    public long getCompletionsCount() { return completionsCount; }
    public void setCompletionsCount(long completionsCount) { this.completionsCount = completionsCount; }
}
