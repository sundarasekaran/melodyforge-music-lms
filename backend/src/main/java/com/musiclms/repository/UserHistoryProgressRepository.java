package com.musiclms.repository;

import com.musiclms.model.entity.HistorySection;
import com.musiclms.model.entity.Instrument;
import com.musiclms.model.entity.User;
import com.musiclms.model.entity.UserHistoryProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserHistoryProgressRepository extends JpaRepository<UserHistoryProgress, Long> {
    Optional<UserHistoryProgress> findByUserAndHistorySection(User user, HistorySection historySection);
    List<UserHistoryProgress> findByUser(User user);
    List<UserHistoryProgress> findByUserAndHistorySectionInstrument(User user, Instrument instrument);
    List<UserHistoryProgress> findByUserAndHistorySectionInstrumentSlug(User user, String slug);
}
