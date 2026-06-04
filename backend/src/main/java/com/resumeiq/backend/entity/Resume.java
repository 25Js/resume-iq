package com.resumeiq.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "resumes")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String filename;

    @Column(name = "file_type", nullable = false)
    private String fileType; // application/pdf or application/vnd.openxmlformats-officedocument.wordprocessingml.document

    @Lob
    @Column(name = "file_data", nullable = false, length = 10000000) // Support up to 10MB binary
    @JsonIgnore
    private byte[] fileData;

    @Lob
    @Column(name = "extracted_text", nullable = false, length = 1000000) // Support up to 1MB text
    @JsonIgnore
    private String extractedText;

    @CreationTimestamp
    @Column(name = "upload_date", nullable = false, updatable = false)
    private LocalDateTime uploadDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @OneToOne(mappedBy = "resume", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private ResumeProfile resumeProfile;
}
