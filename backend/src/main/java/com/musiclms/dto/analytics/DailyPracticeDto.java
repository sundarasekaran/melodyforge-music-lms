package com.musiclms.dto.analytics;

public class DailyPracticeDto {
    private String dayName;
    private String date;
    private int durationMinutes;
    private int sessionCount;

    public DailyPracticeDto() {}

    public DailyPracticeDto(String dayName, String date, int durationMinutes, int sessionCount) {
        this.dayName = dayName;
        this.date = date;
        this.durationMinutes = durationMinutes;
        this.sessionCount = sessionCount;
    }

    public String getDayName() { return dayName; }
    public void setDayName(String dayName) { this.dayName = dayName; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public int getSessionCount() { return sessionCount; }
    public void setSessionCount(int sessionCount) { this.sessionCount = sessionCount; }
}
