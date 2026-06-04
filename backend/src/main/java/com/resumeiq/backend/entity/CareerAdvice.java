package com.resumeiq.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "career_advice")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareerAdvice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    @JsonIgnore
    private Resume resume;

    @Lob
    @Column(columnDefinition = "CLOB")
    @Convert(converter = ListStringConverter.class)
    private List<String> suitableRoles;

    @Lob
    @Column(columnDefinition = "CLOB")
    @Convert(converter = ListStringConverter.class)
    private List<String> careerSuggestions;

    @Lob
    @Column(columnDefinition = "CLOB")
    @Convert(converter = LearningPlanConverter.class)
    private List<LearningPlanItem> learningPlan;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
