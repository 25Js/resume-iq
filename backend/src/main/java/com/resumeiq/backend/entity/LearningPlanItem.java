package com.resumeiq.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearningPlanItem {
    private String timeframe;
    private List<String> topics;
    private List<String> resources;
}
