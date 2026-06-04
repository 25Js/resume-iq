package com.resumeiq.backend.repository;

import com.resumeiq.backend.entity.JobMatch;
import com.resumeiq.backend.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobMatchRepository extends JpaRepository<JobMatch, Long> {
    List<JobMatch> findByResumeOrderByCreatedAtDesc(Resume resume);
}
