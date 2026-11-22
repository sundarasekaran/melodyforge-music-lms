package com.musiclms.repository;

import com.musiclms.model.entity.Instrument;
import com.musiclms.model.entity.PracticeSession;
import com.musiclms.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PracticeSessionRepository extends JpaRepository<PracticeSession, Long> {
    List<PracticeSession> findByUserOrderByPracticedAtDesc(User user);
    List<PracticeSession> findByUserAndInstrumentOrderByPracticedAtDesc(User user, Instrument instrument);
    List<PracticeSession> findTop10ByUserIdOrderByPracticedAtDesc(Long userId);
    List<PracticeSession> findByUserAndStatusOrderByPracticedAtDesc(User user, String status);
    long countByUser(User user);
    long countByUserAndStatus(User user, String status);
    long countByUserAndRoutineIdNotNull(User user);
    long countByInstrument(Instrument instrument);
    List<PracticeSession> findByPracticedAtAfter(LocalDateTime dateTime);
}
