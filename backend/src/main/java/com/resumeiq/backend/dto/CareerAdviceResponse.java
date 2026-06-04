package com.resumeiq.backend.dto;

import com.resumeiq.backend.entity.LearningPlanItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareerAdviceResponse {
    private List<String> suitableRoles;
    private List<String> careerSuggestions;
    private List<LearningPlanItem> learningPlan;
}
