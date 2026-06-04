package com.resumeiq.backend.repository;

import com.resumeiq.backend.entity.Resume;
import com.resumeiq.backend.entity.SkillGap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillGapRepository extends JpaRepository<SkillGap, Long> {
    List<SkillGap> findByResumeOrderByCreatedAtDesc(Resume resume);
}
