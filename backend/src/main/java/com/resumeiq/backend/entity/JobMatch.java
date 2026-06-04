package com.resumeiq.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "job_matches")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    @JsonIgnore
    private Resume resume;

    @Lob
    @Column(name = "job_description", nullable = false, columnDefinition = "CLOB")
    private String jobDescription;

    @Column(name = "match_score", nullable = false)
    private Integer matchScore;

    @Lob
    @Column(columnDefinition = "CLOB")
    @Convert(converter = ListStringConverter.class)
    private List<String> extractedSkills;

    @Lob
    @Column(columnDefinition = "CLOB")
    @Convert(converter = ListStringConverter.class)
    private List<String> missingSkills;

    @Lob
    @Column(columnDefinition = "CLOB")
    @Convert(converter = ListStringConverter.class)
    private List<String> recommendedChanges;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
