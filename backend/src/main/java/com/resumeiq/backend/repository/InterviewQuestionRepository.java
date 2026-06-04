package com.resumeiq.backend.repository;

import com.resumeiq.backend.entity.InterviewQuestion;
import com.resumeiq.backend.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {
    List<InterviewQuestion> findByResumeOrderByCreatedAtDesc(Resume resume);
}
