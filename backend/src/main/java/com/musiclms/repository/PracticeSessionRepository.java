package com.musiclms.repository;

import com.musiclms.model.entity.Instrument;
import com.musiclms.model.entity.PracticeSession;
import com.musiclms.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PracticeSessionRepository extends JpaRepository<PracticeSession, Long> {
    List<PracticeSession> findByUserOrderByPracticedAtDesc(User user);
    List<PracticeSession> findByUserAndInstrumentOrderByPracticedAtDesc(User user, Instrument instrument);
    List<PracticeSession> findTop10ByUserIdOrderByPracticedAtDesc(Long userId);
}
