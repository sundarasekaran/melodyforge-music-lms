package com.musiclms.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "exercises")
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    @JsonIgnore
    private Lesson lesson;

    @Column(name = "exercise_type", nullable = false, length = 50)
    private String exerciseType; // NOTE_IDENTIFICATION, KEYBOARD_PLAY, INTERVAL_RECOGNITION, NOTATION_READING, MULTIPLE_CHOICE

    @Column(nullable = false, length = 255)
    private String prompt;

    @Column(name = "question_data", columnDefinition = "TEXT")
    private String questionData; // JSON formatted metadata: options, targetNotes, audioClips, clef, etc.

    @Column(name = "expected_answer", nullable = false, length = 100)
    private String expectedAnswer;

    @Column(name = "points", nullable = false)
    private Integer points = 25;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 1;

    public Exercise() {}

    public Exercise(Lesson lesson, String exerciseType, String prompt, String questionData, String expectedAnswer, Integer points, String explanation, Integer orderIndex) {
        this.lesson = lesson;
        this.exerciseType = exerciseType;
        this.prompt = prompt;
        this.questionData = questionData;
        this.expectedAnswer = expectedAnswer;
        this.points = points;
        this.explanation = explanation;
        this.orderIndex = orderIndex;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Lesson getLesson() { return lesson; }
    public void setLesson(Lesson lesson) { this.lesson = lesson; }

    public String getExerciseType() { return exerciseType; }
    public void setExerciseType(String exerciseType) { this.exerciseType = exerciseType; }

    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }

    public String getQuestionData() { return questionData; }
    public void setQuestionData(String questionData) { this.questionData = questionData; }

    public String getExpectedAnswer() { return expectedAnswer; }
    public void setExpectedAnswer(String expectedAnswer) { this.expectedAnswer = expectedAnswer; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
}
