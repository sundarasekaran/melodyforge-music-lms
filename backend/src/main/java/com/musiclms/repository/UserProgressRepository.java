package com.musiclms.repository;

import com.musiclms.model.entity.Lesson;
import com.musiclms.model.entity.User;
import com.musiclms.model.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    Optional<UserProgress> findByUserAndLesson(User user, Lesson lesson);
    List<UserProgress> findByUser(User user);
    List<UserProgress> findByUserId(Long userId);
    Long countByUserAndCompletedTrue(User user);
}
