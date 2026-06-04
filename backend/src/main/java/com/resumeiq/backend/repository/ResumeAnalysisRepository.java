package com.resumeiq.backend.repository;

import com.resumeiq.backend.entity.Resume;
import com.resumeiq.backend.entity.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, Long> {
    List<ResumeAnalysis> findByResumeOrderByCreatedAtDesc(Resume resume);
}
