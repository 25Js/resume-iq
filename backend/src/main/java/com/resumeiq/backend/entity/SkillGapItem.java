package com.resumeiq.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillGapItem {
    private String skill;
    private String priority; // HIGH, MEDIUM, LOW
    private String learningRoadmap;
}
