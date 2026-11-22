package com.musiclms.repository;

import com.musiclms.model.entity.AssessmentAttempt;
import com.musiclms.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttempt, Long> {
    List<AssessmentAttempt> findByUserOrderByStartedAtDesc(User user);
    List<AssessmentAttempt> findByUserAndLevelOrderByStartedAtDesc(User user, Integer level);
    Optional<AssessmentAttempt> findTopByUserAndLevelAndPassedTrueOrderByScorePercentDesc(User user, Integer level);
    Optional<AssessmentAttempt> findTopByUserAndLevelOrderByAttemptNumberDesc(User user, Integer level);
    boolean existsByUserAndLevelAndPassedTrue(User user, Integer level);
    long countByUserAndPassedTrue(User user);
    long countByLevel(Integer level);
    long countByLevelAndPassedTrue(Integer level);
}
