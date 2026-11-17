package com.musiclms.dto;

import com.musiclms.model.entity.Role;

public class AuthResponse {
    private String token;
    private Long id;
    private String username;
    private String email;
    private String displayName;
    private Role role;
    private Integer totalXp;
    private Integer currentLevel;
    private Integer currentStreakDays;

    public AuthResponse() {}

    public AuthResponse(String token, Long id, String username, String email, String displayName, Role role, Integer totalXp, Integer currentLevel, Integer currentStreakDays) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.displayName = displayName;
        this.role = role;
        this.totalXp = totalXp;
        this.currentLevel = currentLevel;
        this.currentStreakDays = currentStreakDays;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Integer getTotalXp() { return totalXp; }
    public void setTotalXp(Integer totalXp) { this.totalXp = totalXp; }

    public Integer getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(Integer currentLevel) { this.currentLevel = currentLevel; }

    public Integer getCurrentStreakDays() { return currentStreakDays; }
    public void setCurrentStreakDays(Integer currentStreakDays) { this.currentStreakDays = currentStreakDays; }
}
