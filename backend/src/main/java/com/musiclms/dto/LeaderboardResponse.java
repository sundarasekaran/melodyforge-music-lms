package com.musiclms.dto;

public class LeaderboardResponse {
    private Long id;
    private String username;
    private String displayName;
    private Integer totalXp;
    private Integer currentLevel;
    private Integer currentStreakDays;

    public LeaderboardResponse() {}

    public LeaderboardResponse(Long id, String username, String displayName, Integer totalXp, Integer currentLevel, Integer currentStreakDays) {
        this.id = id;
        this.username = username;
        this.displayName = displayName;
        this.totalXp = totalXp;
        this.currentLevel = currentLevel;
        this.currentStreakDays = currentStreakDays;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public Integer getTotalXp() { return totalXp; }
    public void setTotalXp(Integer totalXp) { this.totalXp = totalXp; }

    public Integer getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(Integer currentLevel) { this.currentLevel = currentLevel; }

    public Integer getCurrentStreakDays() { return currentStreakDays; }
    public void setCurrentStreakDays(Integer currentStreakDays) { this.currentStreakDays = currentStreakDays; }
}
