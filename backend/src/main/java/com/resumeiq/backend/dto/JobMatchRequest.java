package com.resumeiq.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JobMatchRequest {
    @NotBlank(message = "Job description cannot be empty")
    private String jobDescription;
}
