package com.musiclms.repository;

import com.musiclms.model.entity.Instrument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstrumentRepository extends JpaRepository<Instrument, Long> {
    Optional<Instrument> findBySlug(String slug);
    List<Instrument> findByIsActiveTrueOrderByDisplayOrderAsc();
    List<Instrument> findAllByOrderByDisplayOrderAsc();
}
