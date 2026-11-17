package com.musiclms.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "history_sections")
public class HistorySection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instrument_id", nullable = false)
    @JsonIgnore
    private Instrument instrument;

    @Column(name = "section_number", nullable = false)
    private Integer sectionNumber;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 100)
    private String era; // e.g., "Origin (1700)", "Classical Era (1750-1820)"

    @Column(columnDefinition = "TEXT")
    private String introduction;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "key_takeaway", columnDefinition = "TEXT")
    private String keyTakeaway;

    @Column(name = "image_caption", length = 255)
    private String imageCaption;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "timeline_json", columnDefinition = "TEXT")
    private String timelineJson;

    @Column(name = "facts_json", columnDefinition = "TEXT")
    private String factsJson;

    @Column(name = "gallery_json", columnDefinition = "TEXT")
    private String galleryJson;

    @Column(name = "audio_note", length = 50)
    private String audioNote;

    @Column(name = "audio_description", length = 255)
    private String audioDescription;

    @Column(name = "quiz_json", columnDefinition = "TEXT")
    private String quizJson;

    @Column(name = "xp_reward", nullable = false)
    private Integer xpReward = 50;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes = 10;

    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = true;

    public HistorySection() {}

    public HistorySection(Instrument instrument, Integer sectionNumber, String title, String era, String content, String keyTakeaway, String imageCaption) {
        this.instrument = instrument;
        this.sectionNumber = sectionNumber;
        this.title = title;
        this.era = era;
        this.content = content;
        this.keyTakeaway = keyTakeaway;
        this.imageCaption = imageCaption;
        this.isPublished = true;
        this.xpReward = 50;
        this.durationMinutes = 10;
    }

    public HistorySection(Instrument instrument, Integer sectionNumber, String title, String era, String introduction,
                          String content, String keyTakeaway, String imageCaption, String imageUrl,
                          String timelineJson, String factsJson, String galleryJson,
                          String audioNote, String audioDescription, String quizJson,
                          Integer xpReward, Integer durationMinutes, Boolean isPublished) {
        this.instrument = instrument;
        this.sectionNumber = sectionNumber;
        this.title = title;
        this.era = era;
        this.introduction = introduction;
        this.content = content;
        this.keyTakeaway = keyTakeaway;
        this.imageCaption = imageCaption;
        this.imageUrl = imageUrl;
        this.timelineJson = timelineJson;
        this.factsJson = factsJson;
        this.galleryJson = galleryJson;
        this.audioNote = audioNote;
        this.audioDescription = audioDescription;
        this.quizJson = quizJson;
        this.xpReward = xpReward != null ? xpReward : 50;
        this.durationMinutes = durationMinutes != null ? durationMinutes : 10;
        this.isPublished = isPublished != null ? isPublished : true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Instrument getInstrument() { return instrument; }
    public void setInstrument(Instrument instrument) { this.instrument = instrument; }

    public Integer getSectionNumber() { return sectionNumber; }
    public void setSectionNumber(Integer sectionNumber) { this.sectionNumber = sectionNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getEra() { return era; }
    public void setEra(String era) { this.era = era; }

    public String getIntroduction() { return introduction; }
    public void setIntroduction(String introduction) { this.introduction = introduction; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getKeyTakeaway() { return keyTakeaway; }
    public void setKeyTakeaway(String keyTakeaway) { this.keyTakeaway = keyTakeaway; }

    public String getImageCaption() { return imageCaption; }
    public void setImageCaption(String imageCaption) { this.imageCaption = imageCaption; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getTimelineJson() { return timelineJson; }
    public void setTimelineJson(String timelineJson) { this.timelineJson = timelineJson; }

    public String getFactsJson() { return factsJson; }
    public void setFactsJson(String factsJson) { this.factsJson = factsJson; }

    public String getGalleryJson() { return galleryJson; }
    public void setGalleryJson(String galleryJson) { this.galleryJson = galleryJson; }

    public String getAudioNote() { return audioNote; }
    public void setAudioNote(String audioNote) { this.audioNote = audioNote; }

    public String getAudioDescription() { return audioDescription; }
    public void setAudioDescription(String audioDescription) { this.audioDescription = audioDescription; }

    public String getQuizJson() { return quizJson; }
    public void setQuizJson(String quizJson) { this.quizJson = quizJson; }

    public Integer getXpReward() { return xpReward; }
    public void setXpReward(Integer xpReward) { this.xpReward = xpReward; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public Boolean getIsPublished() { return isPublished; }
    public void setIsPublished(Boolean isPublished) { this.isPublished = isPublished; }
}
