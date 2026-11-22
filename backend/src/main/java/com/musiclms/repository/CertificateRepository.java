package com.musiclms.repository;

import com.musiclms.model.entity.Certificate;
import com.musiclms.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Optional<Certificate> findByUserAndInstrumentSlug(User user, String instrumentSlug);
    Optional<Certificate> findByCertificateNumber(String certificateNumber);
    List<Certificate> findByUserOrderByConferredAtDesc(User user);
    boolean existsByUserAndInstrumentSlug(User user, String instrumentSlug);
}
