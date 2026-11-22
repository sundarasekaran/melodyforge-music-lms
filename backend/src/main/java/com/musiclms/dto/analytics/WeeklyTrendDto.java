package com.musiclms.dto.analytics;

public class WeeklyTrendDto {
    private String date;
    private String dayName;
    private long practiceSessionCount;
    private long lessonsCompletedCount;

    public WeeklyTrendDto() {}

    public WeeklyTrendDto(String date, String dayName, long practiceSessionCount, long lessonsCompletedCount) {
        this.date = date;
        this.dayName = dayName;
        this.practiceSessionCount = practiceSessionCount;
        this.lessonsCompletedCount = lessonsCompletedCount;
    }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getDayName() { return dayName; }
    public void setDayName(String dayName) { this.dayName = dayName; }

    public long getPracticeSessionCount() { return practiceSessionCount; }
    public void setPracticeSessionCount(long practiceSessionCount) { this.practiceSessionCount = practiceSessionCount; }

    public long getLessonsCompletedCount() { return lessonsCompletedCount; }
    public void setLessonsCompletedCount(long lessonsCompletedCount) { this.lessonsCompletedCount = lessonsCompletedCount; }
}
