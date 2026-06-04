package com.resumeiq.backend.dto;

import com.resumeiq.backend.entity.ResumeProfile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeResponse {
    private Long id;
    private String filename;
    private String fileType;
    private LocalDateTime uploadDate;
    private ResumeProfile profile;
}
