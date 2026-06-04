package com.resumeiq.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "resume_analysis")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    @JsonIgnore
    private Resume resume;

    @Column(nullable = false)
    private Integer score;

    @Lob
    @Column(columnDefinition = "CLOB")
    @Convert(converter = ListStringConverter.class)
    private List<String> strengths;

    @Lob
    @Column(columnDefinition = "CLOB")
    @Convert(converter = ListStringConverter.class)
    private List<String> weaknesses;

    @Lob
    @Column(columnDefinition = "CLOB")
    @Convert(converter = ListStringConverter.class)
    private List<String> missingSections;

    @Lob
    @Column(columnDefinition = "CLOB")
    @Convert(converter = ListStringConverter.class)
    private List<String> formattingSuggestions;

    @Lob
    @Column(columnDefinition = "CLOB")
    @Convert(converter = ListStringConverter.class)
    private List<String> atsRecommendations;

    @Lob
    @Column(columnDefinition = "CLOB")
    @Convert(converter = ListStringConverter.class)
    private List<String> improvementTips;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
