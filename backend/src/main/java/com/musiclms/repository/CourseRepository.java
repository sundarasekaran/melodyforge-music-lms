package com.musiclms.repository;

import com.musiclms.model.entity.Course;
import com.musiclms.model.entity.LearningLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByLevelOrderByOrderIndexAsc(LearningLevel level);
}
