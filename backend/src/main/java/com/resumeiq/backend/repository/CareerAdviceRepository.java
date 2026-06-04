package com.resumeiq.backend.repository;

import com.resumeiq.backend.entity.CareerAdvice;
import com.resumeiq.backend.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareerAdviceRepository extends JpaRepository<CareerAdvice, Long> {
    List<CareerAdvice> findByResumeOrderByCreatedAtDesc(Resume resume);
}
