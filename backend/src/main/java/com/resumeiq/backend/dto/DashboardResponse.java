package com.resumeiq.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private Long totalResumesUploaded;
    private Double averageResumeScore;
    private Integer latestAtsScore;
    private Integer latestJobMatchScore;
    private List<ScoreHistoryItem> scoreHistory;
    private List<SkillCountItem> skillDistribution;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreHistoryItem {
        private Long resumeId;
        private String filename;
        private LocalDateTime uploadDate;
        private Integer resumeScore;
        private Integer atsScore;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillCountItem {
        private String skillName;
        private Integer count;
    }
}
