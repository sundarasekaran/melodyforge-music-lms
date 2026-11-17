package com.musiclms.repository;

import com.musiclms.model.entity.Badge;
import com.musiclms.model.entity.User;
import com.musiclms.model.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    List<UserBadge> findByUserOrderByAwardedAtDesc(User user);
    List<UserBadge> findByUserIdOrderByAwardedAtDesc(Long userId);
    Optional<UserBadge> findByUserAndBadge(User user, Badge badge);
    Boolean existsByUserAndBadge(User user, Badge badge);
}
