package com.musiclms.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "learning_levels")
public class LearningLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tier_id", nullable = false)
    @JsonIgnore
    private LearningTier tier;

    @Column(name = "level_number", nullable = false)
    private Integer levelNumber; // 1, 2, 3

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "xp_reward", nullable = false)
    private Integer xpReward = 100;

    @OneToMany(mappedBy = "level", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<Course> courses = new ArrayList<>();

    public LearningLevel() {}

    public LearningLevel(LearningTier tier, Integer levelNumber, String title, String description, Integer xpReward) {
        this.tier = tier;
        this.levelNumber = levelNumber;
        this.title = title;
        this.description = description;
        this.xpReward = xpReward;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LearningTier getTier() { return tier; }
    public void setTier(LearningTier tier) { this.tier = tier; }

    public Integer getLevelNumber() { return levelNumber; }
    public void setLevelNumber(Integer levelNumber) { this.levelNumber = levelNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getXpReward() { return xpReward; }
    public void setXpReward(Integer xpReward) { this.xpReward = xpReward; }

    public List<Course> getCourses() { return courses; }
    public void setCourses(List<Course> courses) { this.courses = courses; }
}
