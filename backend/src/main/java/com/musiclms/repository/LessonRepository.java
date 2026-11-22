package com.musiclms.repository;

import com.musiclms.model.entity.Course;
import com.musiclms.model.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByCourseOrderByOrderIndexAsc(Course course);
    long countByCourseLevelTierInstrumentSlug(String slug);
}
