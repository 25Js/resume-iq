package com.resumeiq.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsCheckResponse {
    private Integer atsScore;
    private List<String> feedback;
    private Integer structureScore;
    private Integer keywordScore;
    private Integer completenessScore;
    private Integer readabilityScore;
}
