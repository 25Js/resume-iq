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
public class InterviewQuestionsResponse {
    private List<String> hrQuestions;
    private List<String> technicalQuestions;
    private List<String> projectQuestions;
    private List<String> behavioralQuestions;
}
