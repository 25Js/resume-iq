package com.resumeiq.backend.repository;

import com.resumeiq.backend.entity.Resume;
import com.resumeiq.backend.entity.ResumeProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResumeProfileRepository extends JpaRepository<ResumeProfile, Long> {
    Optional<ResumeProfile> findByResume(Resume resume);
}
