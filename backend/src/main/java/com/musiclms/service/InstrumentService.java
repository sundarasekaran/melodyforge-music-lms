package com.musiclms.service;

import com.musiclms.model.entity.HistorySection;
import com.musiclms.model.entity.Instrument;
import com.musiclms.repository.HistorySectionRepository;
import com.musiclms.repository.InstrumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InstrumentService {

    private final InstrumentRepository instrumentRepository;
    private final HistorySectionRepository historySectionRepository;

    public InstrumentService(InstrumentRepository instrumentRepository, HistorySectionRepository historySectionRepository) {
        this.instrumentRepository = instrumentRepository;
        this.historySectionRepository = historySectionRepository;
    }

    @Transactional(readOnly = true)
    public List<Instrument> getAllActiveInstruments() {
        return instrumentRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
    }

    @Transactional(readOnly = true)
    public List<Instrument> getAllInstrumentsForAdmin() {
        return instrumentRepository.findAllByOrderByDisplayOrderAsc();
    }

    @Transactional(readOnly = true)
    public Instrument getInstrumentBySlug(String slug) {
        return instrumentRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Instrument not found with slug: " + slug));
    }

    @Transactional(readOnly = true)
    public List<HistorySection> getHistorySectionsForInstrument(String slug) {
        Instrument instrument = getInstrumentBySlug(slug);
        return historySectionRepository.findByInstrumentOrderBySectionNumberAsc(instrument);
    }
}
