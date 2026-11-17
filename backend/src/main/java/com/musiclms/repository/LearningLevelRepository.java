package com.musiclms.repository;

import com.musiclms.model.entity.LearningLevel;
import com.musiclms.model.entity.LearningTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningLevelRepository extends JpaRepository<LearningLevel, Long> {
    List<LearningLevel> findByTierOrderByLevelNumberAsc(LearningTier tier);
}
