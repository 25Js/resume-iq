package com.resumeiq.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "resume_profiles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    @JsonIgnore
    private Resume resume;

    @Column(name = "candidate_name")
    private String candidateName;

    private String email;
    private String phone;

    @Lob
    @Column(columnDefinition = "CLOB")
    @Convert(converter = ListStringConverter.class)
    private List<String> skills;

    @Lob
    @Column(columnDefinition = "CLOB")
    @Convert(converter = ListStringConverter.class)
    private List<String> education;

    @Lob
    @Column(columnDefinition = "CLOB")
    @Convert(converter = ListStringConverter.class)
    private List<String> experience;

    @Lob
    @Column(columnDefinition = "CLOB")
    @Convert(converter = ListStringConverter.class)
    private List<String> projects;

    @Lob
    @Column(columnDefinition = "CLOB")
    @Convert(converter = ListStringConverter.class)
    private List<String> certifications;
}
