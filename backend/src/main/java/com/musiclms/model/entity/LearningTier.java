package com.musiclms.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "learning_tiers")
public class LearningTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instrument_id", nullable = false)
    @JsonIgnore
    private Instrument instrument;

    @Column(name = "tier_name", nullable = false, length = 50)
    private String tierName; // BASICS, INTERMEDIATE, PRO, EXPERT

    @Column(name = "tier_order", nullable = false)
    private Integer tierOrder; // 1, 2, 3, 4

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "required_xp", nullable = false)
    private Integer requiredXp = 0;

    @OneToMany(mappedBy = "tier", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("levelNumber ASC")
    private List<LearningLevel> levels = new ArrayList<>();

    public LearningTier() {}

    public LearningTier(Instrument instrument, String tierName, Integer tierOrder, String description, Integer requiredXp) {
        this.instrument = instrument;
        this.tierName = tierName;
        this.tierOrder = tierOrder;
        this.description = description;
        this.requiredXp = requiredXp;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Instrument getInstrument() { return instrument; }
    public void setInstrument(Instrument instrument) { this.instrument = instrument; }

    public String getTierName() { return tierName; }
    public void setTierName(String tierName) { this.tierName = tierName; }

    public Integer getTierOrder() { return tierOrder; }
    public void setTierOrder(Integer tierOrder) { this.tierOrder = tierOrder; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getRequiredXp() { return requiredXp; }
    public void setRequiredXp(Integer requiredXp) { this.requiredXp = requiredXp; }

    public List<LearningLevel> getLevels() { return levels; }
    public void setLevels(List<LearningLevel> levels) { this.levels = levels; }
}
