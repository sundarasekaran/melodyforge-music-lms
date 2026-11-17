package com.musiclms.repository;

import com.musiclms.model.entity.HistorySection;
import com.musiclms.model.entity.Instrument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorySectionRepository extends JpaRepository<HistorySection, Long> {
    List<HistorySection> findByInstrumentOrderBySectionNumberAsc(Instrument instrument);
    List<HistorySection> findByInstrumentIdOrderBySectionNumberAsc(Long instrumentId);
    List<HistorySection> findByInstrumentAndIsPublishedTrueOrderBySectionNumberAsc(Instrument instrument);
    List<HistorySection> findByInstrumentSlugAndIsPublishedTrueOrderBySectionNumberAsc(String slug);
    List<HistorySection> findByInstrumentSlugOrderBySectionNumberAsc(String slug);
}
