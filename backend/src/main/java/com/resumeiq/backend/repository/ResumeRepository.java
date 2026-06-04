package com.resumeiq.backend.repository;

import com.resumeiq.backend.entity.Resume;
import com.resumeiq.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUserOrderByUploadDateDesc(User user);
    Optional<Resume> findByIdAndUser(Long id, User user);
}
