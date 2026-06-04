package com.resumeiq.backend.dto;

import com.resumeiq.backend.entity.SkillGapItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillGapResponse {
    private List<SkillGapItem> missingSkills;
}
