package com.resumeiq.backend.controller;

import com.resumeiq.backend.dto.*;
import com.resumeiq.backend.entity.ResumeAnalysis;
import com.resumeiq.backend.service.AIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Tag(name = "AI Resume Optimization Controller", description = "AI endpoints utilizing Gemini for checking score, ATS compatibility, job matching, interview questions, skill gaps, and career advising")
public class AIController {

    private final AIService aiService;

    @PostMapping("/analyze-resume")
    @Operation(summary = "Perform deep AI analysis on an uploaded resume", description = "Computes score, strengths, weaknesses, formatting and ATS improvement suggestions.")
    public ResponseEntity<ResumeAnalysis> analyzeResume(@RequestParam("resumeId") Long resumeId) {
        return ResponseEntity.ok(aiService.analyzeResume(resumeId));
    }

    @PostMapping("/ats-check")
    @Operation(summary = "Evaluate resume ATS compatibility metrics", description = "Calculates individual category scores (readability, structure, keywords, completeness) and reports detailed feedback.")
    public ResponseEntity<AtsCheckResponse> atsCheck(@RequestParam("resumeId") Long resumeId) {
        return ResponseEntity.ok(aiService.atsCheck(resumeId));
    }

    @PostMapping("/job-match")
    @Operation(summary = "Compare resume skills against a target Job Description", description = "Computes a match score percentage, lists matching and missing skills, and suggests target updates.")
    public ResponseEntity<JobMatchResponse> jobMatch(
            @RequestParam("resumeId") Long resumeId,
            @Valid @RequestBody JobMatchRequest request
    ) {
        return ResponseEntity.ok(aiService.jobMatch(resumeId, request.getJobDescription()));
    }

    @PostMapping("/interview-questions")
    @Operation(summary = "Generate custom interview prep questions", description = "Creates personalized HR, Technical, project-specific, and behavioral questions based on the resume and Job Description.")
    public ResponseEntity<InterviewQuestionsResponse> generateInterviewQuestions(
            @RequestParam("resumeId") Long resumeId,
            @Valid @RequestBody JobMatchRequest request
    ) {
        return ResponseEntity.ok(aiService.generateInterviewQuestions(resumeId, request.getJobDescription()));
    }

    @PostMapping("/skill-gap")
    @Operation(summary = "Run prioritised skill gap roadmap analysis", description = "Identifies missing skills from the job description and builds priority recommendations (HIGH, MEDIUM, LOW) with learning paths.")
    public ResponseEntity<SkillGapResponse> analyzeSkillGap(
            @RequestParam("resumeId") Long resumeId,
            @Valid @RequestBody JobMatchRequest request
    ) {
        return ResponseEntity.ok(aiService.analyzeSkillGap(resumeId, request.getJobDescription()));
    }

    @PostMapping("/career-advice")
    @Operation(summary = "Obtain general AI Career advising suggestions", description = "Generates suitable job roles, career milestones, and a monthly learning timeline.")
    public ResponseEntity<CareerAdviceResponse> generateCareerAdvice(@RequestParam("resumeId") Long resumeId) {
        return ResponseEntity.ok(aiService.generateCareerAdvice(resumeId));
    }
}
