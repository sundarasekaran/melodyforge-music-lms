package com.musiclms.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lessons")
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnore
    private Course course;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "theory_content", columnDefinition = "TEXT")
    private String theoryContent;

    @Column(name = "lesson_type", length = 50)
    private String lessonType = "THEORY"; // THEORY, PRACTICAL, LISTENING, ASSESSMENT

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes = 10;

    @Column(name = "xp_reward", nullable = false)
    private Integer xpReward = 50;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 1;

    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = true;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<Exercise> exercises = new ArrayList<>();

    public Lesson() {}

    public Lesson(Course course, String title, String description, String theoryContent, String lessonType, Integer durationMinutes, Integer xpReward, Integer orderIndex) {
        this.course = course;
        this.title = title;
        this.description = description;
        this.theoryContent = theoryContent;
        this.lessonType = lessonType;
        this.durationMinutes = durationMinutes;
        this.xpReward = xpReward;
        this.orderIndex = orderIndex;
    }

    public Lesson(Course course, String title, String theoryContent, String lessonType, Integer durationMinutes, Integer xpReward, Integer orderIndex) {
        this(course, title, title, theoryContent, lessonType, durationMinutes, xpReward, orderIndex);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTheoryContent() { return theoryContent; }
    public void setTheoryContent(String theoryContent) { this.theoryContent = theoryContent; }

    public String getLessonType() { return lessonType; }
    public void setLessonType(String lessonType) { this.lessonType = lessonType; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public Integer getXpReward() { return xpReward; }
    public void setXpReward(Integer xpReward) { this.xpReward = xpReward; }

    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }

    public Boolean getIsPublished() { return isPublished; }
    public void setIsPublished(Boolean isPublished) { this.isPublished = isPublished; }

    public List<Exercise> getExercises() { return exercises; }
    public void setExercises(List<Exercise> exercises) { this.exercises = exercises; }
}
