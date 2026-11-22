package com.musiclms.dto.analytics;

public class StudentSummaryDto {
    private Long id;
    private String username;
    private String displayName;
    private String email;
    private String role;
    private int totalXp;
    private int currentLevel;
    private int currentStreakDays;
    private long completedLessons;
    private long totalPracticeMinutes;

    public StudentSummaryDto() {}

    public StudentSummaryDto(Long id, String username, String displayName, String email, String role, int totalXp, int currentLevel, int currentStreakDays, long completedLessons, long totalPracticeMinutes) {
        this.id = id;
        this.username = username;
        this.displayName = displayName;
        this.email = email;
        this.role = role;
        this.totalXp = totalXp;
        this.currentLevel = currentLevel;
        this.currentStreakDays = currentStreakDays;
        this.completedLessons = completedLessons;
        this.totalPracticeMinutes = totalPracticeMinutes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public int getTotalXp() { return totalXp; }
    public void setTotalXp(int totalXp) { this.totalXp = totalXp; }

    public int getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(int currentLevel) { this.currentLevel = currentLevel; }

    public int getCurrentStreakDays() { return currentStreakDays; }
    public void setCurrentStreakDays(int currentStreakDays) { this.currentStreakDays = currentStreakDays; }

    public long getCompletedLessons() { return completedLessons; }
    public void setCompletedLessons(long completedLessons) { this.completedLessons = completedLessons; }

    public long getTotalPracticeMinutes() { return totalPracticeMinutes; }
    public void setTotalPracticeMinutes(long totalPracticeMinutes) { this.totalPracticeMinutes = totalPracticeMinutes; }
}
