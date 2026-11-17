package com.musiclms.repository;

import com.musiclms.model.entity.Exercise;
import com.musiclms.model.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    List<Exercise> findByLessonOrderByOrderIndexAsc(Lesson lesson);
    List<Exercise> findByLessonIdOrderByOrderIndexAsc(Long lessonId);
}
