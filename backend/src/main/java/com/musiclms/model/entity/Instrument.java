package com.musiclms.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "instruments")
public class Instrument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String slug;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String family; // Keyboard, Strings, Percussion, etc.

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon_name", length = 50)
    private String iconName;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 1;

    @OneToMany(mappedBy = "instrument", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sectionNumber ASC")
    @JsonIgnore
    private List<HistorySection> historySections = new ArrayList<>();

    @OneToMany(mappedBy = "instrument", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("tierOrder ASC")
    @JsonIgnore
    private List<LearningTier> tiers = new ArrayList<>();

    public Instrument() {}

    public Instrument(String slug, String name, String family, String description, String iconName, Boolean isActive, Integer displayOrder) {
        this.slug = slug;
        this.name = name;
        this.family = family;
        this.description = description;
        this.iconName = iconName;
        this.isActive = isActive;
        this.displayOrder = displayOrder;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFamily() { return family; }
    public void setFamily(String family) { this.family = family; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIconName() { return iconName; }
    public void setIconName(String iconName) { this.iconName = iconName; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public List<HistorySection> getHistorySections() { return historySections; }
    public void setHistorySections(List<HistorySection> historySections) { this.historySections = historySections; }

    public List<LearningTier> getTiers() { return tiers; }
    public void setTiers(List<LearningTier> tiers) { this.tiers = tiers; }
}
