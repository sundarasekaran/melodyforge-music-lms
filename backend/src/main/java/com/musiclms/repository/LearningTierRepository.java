package com.musiclms.repository;

import com.musiclms.model.entity.Instrument;
import com.musiclms.model.entity.LearningTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningTierRepository extends JpaRepository<LearningTier, Long> {
    List<LearningTier> findByInstrumentOrderByTierOrderAsc(Instrument instrument);
    List<LearningTier> findByInstrumentSlugOrderByTierOrderAsc(String slug);
}
