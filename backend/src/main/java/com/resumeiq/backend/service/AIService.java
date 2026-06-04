package com.resumeiq.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeiq.backend.dto.*;
import com.resumeiq.backend.entity.*;
import com.resumeiq.backend.exception.OpenRouterException;
import com.resumeiq.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final ResumeService resumeService;
    private final OpenRouterService openRouterService;
    
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final JobMatchRepository jobMatchRepository;
    private final SkillGapRepository skillGapRepository;
    private final InterviewQuestionRepository interviewQuestionRepository;
    private final CareerAdviceRepository careerAdviceRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public ResumeAnalysis analyzeResume(Long resumeId) {
        Resume resume = resumeService.getResumeById(resumeId);
        
        String prompt = """
                You are an elite corporate recruiter and resume critic. Analyze the following resume text and provide a detailed analysis.
                Generate a resume score between 0 and 100, lists of strengths, weaknesses, missing sections, formatting suggestions, ATS recommendations, and actionable improvement tips.
                
                You MUST respond strictly with a valid JSON matching the following schema. Do NOT wrap your output in markdown codeblocks (e.g. ```json), do NOT add extra text, just raw JSON.
                
                JSON Schema:
                {
                  "score": 85,
                  "strengths": ["Strong Java foundations and REST API development", "Good educational background"],
                  "weaknesses": ["No quantified metrics in experience bullet points", "Lack of cloud or DevOps experience"],
                  "missingSections": ["Certifications", "Summary Statement"],
                  "formattingSuggestions": ["Ensure consistent spacing between job sections", "Use standard fonts"],
                  "atsRecommendations": ["Ensure keywords like Spring Boot, REST are highlighted", "Avoid multi-column tables"],
                  "improvementTips": ["Quantify results (e.g., improved load times by 20%)", "Add a certifications section"]
                }
                
                Resume Text:
                """ + resume.getExtractedText();

        try {
            String aiResponse = openRouterService.queryOpenRouter(prompt);
            Map<String, Object> map = objectMapper.readValue(aiResponse, Map.class);
            
            ResumeAnalysis analysis = ResumeAnalysis.builder()
                    .resume(resume)
                    .score((Integer) map.getOrDefault("score", 70))
                    .strengths(convertToList(map.get("strengths")))
                    .weaknesses(convertToList(map.get("weaknesses")))
                    .missingSections(convertToList(map.get("missingSections")))
                    .formattingSuggestions(convertToList(map.get("formattingSuggestions")))
                    .atsRecommendations(convertToList(map.get("atsRecommendations")))
                    .improvementTips(convertToList(map.get("improvementTips")))
                    .build();
            
            return resumeAnalysisRepository.save(analysis);
        } catch (Exception e) {
            log.error("Resume analysis failed", e);
            throw new OpenRouterException("Failed to analyze resume: " + e.getMessage());
        }
    }

    @Transactional
    public AtsCheckResponse atsCheck(Long resumeId) {
        Resume resume = resumeService.getResumeById(resumeId);
        
        String prompt = """
                You are an expert ATS (Applicant Tracking System) parser and optimization specialist. Evaluate the following resume text.
                Determine a total ATS compatibility score (0-100) and specific scores for: structureScore, keywordScore, completenessScore, readabilityScore. Provide a list of constructive feedback bullet points.
                
                You MUST respond strictly with a valid JSON matching the following schema. Do NOT wrap your output in markdown codeblocks (e.g. ```json), do NOT add extra text, just raw JSON.
                
                JSON Schema:
                {
                  "atsScore": 82,
                  "structureScore": 85,
                  "keywordScore": 75,
                  "completenessScore": 90,
                  "readabilityScore": 80,
                  "feedback": ["Structure is clean and parses well", "Keywords are moderate; add more database and cloud-specific keywords", "Completeness is high; standard sections exist", "Readability is good but paragraphs should be split into bullet points"]
                }
                
                Resume Text:
                """ + resume.getExtractedText();

        try {
            String aiResponse = openRouterService.queryOpenRouter(prompt);
            Map<String, Object> map = objectMapper.readValue(aiResponse, Map.class);
            
            // Save analysis under score (this doubles as the ATS score for dashboard analytics)
            ResumeAnalysis analysis = ResumeAnalysis.builder()
                    .resume(resume)
                    .score((Integer) map.getOrDefault("atsScore", 70))
                    .strengths(List.of("ATS Keywords checked"))
                    .weaknesses(convertToList(map.get("feedback")))
                    .missingSections(new ArrayList<>())
                    .formattingSuggestions(new ArrayList<>())
                    .atsRecommendations(convertToList(map.get("feedback")))
                    .improvementTips(new ArrayList<>())
                    .build();
            resumeAnalysisRepository.save(analysis);

            return AtsCheckResponse.builder()
                    .atsScore((Integer) map.getOrDefault("atsScore", 70))
                    .structureScore((Integer) map.getOrDefault("structureScore", 70))
                    .keywordScore((Integer) map.getOrDefault("keywordScore", 70))
                    .completenessScore((Integer) map.getOrDefault("completenessScore", 70))
                    .readabilityScore((Integer) map.getOrDefault("readabilityScore", 70))
                    .feedback(convertToList(map.get("feedback")))
                    .build();
        } catch (Exception e) {
            log.error("ATS checking failed", e);
            throw new OpenRouterException("Failed to run ATS check: " + e.getMessage());
        }
    }

    @Transactional
    public JobMatchResponse jobMatch(Long resumeId, String jobDescription) {
        Resume resume = resumeService.getResumeById(resumeId);
        
        String prompt = """
                You are an AI-powered Technical Recruiter. Compare the following resume text against the job description.
                Calculate a match score (0-100%), extract required skills from the job description, identify missing skills from the resume, and suggest recommended changes.
                
                You MUST respond strictly with a valid JSON matching the following schema. Do NOT wrap your output in markdown codeblocks (e.g. ```json), do NOT add extra text, just raw JSON.
                
                JSON Schema:
                {
                  "matchScore": 78,
                  "extractedSkills": ["Java", "Spring Boot", "Docker", "Kubernetes", "Redis"],
                  "missingSkills": ["Docker", "Kubernetes", "Redis"],
                  "recommendedChanges": ["Highlight backend architecture projects", "Include cloud deployment experience in experience section"]
                }
                
                Resume Text:
                """ + resume.getExtractedText() + "\n\nJob Description:\n" + jobDescription;

        try {
            String aiResponse = openRouterService.queryOpenRouter(prompt);
            Map<String, Object> map = objectMapper.readValue(aiResponse, Map.class);
            
            JobMatch match = JobMatch.builder()
                    .resume(resume)
                    .jobDescription(jobDescription)
                    .matchScore((Integer) map.getOrDefault("matchScore", 50))
                    .extractedSkills(convertToList(map.get("extractedSkills")))
                    .missingSkills(convertToList(map.get("missingSkills")))
                    .recommendedChanges(convertToList(map.get("recommendedChanges")))
                    .build();
            
            jobMatchRepository.save(match);
            
            return JobMatchResponse.builder()
                    .matchScore(match.getMatchScore())
                    .extractedSkills(match.getExtractedSkills())
                    .missingSkills(match.getMissingSkills())
                    .recommendedChanges(match.getRecommendedChanges())
                    .build();
        } catch (Exception e) {
            log.error("Job match failed", e);
            throw new OpenRouterException("Failed to calculate job match: " + e.getMessage());
        }
    }

    @Transactional
    public InterviewQuestionsResponse generateInterviewQuestions(Long resumeId, String jobDescription) {
        Resume resume = resumeService.getResumeById(resumeId);
        
        String prompt = """
                You are a senior technical hiring manager. Based on the candidate's resume and the target job description, generate personalized mock interview questions.
                Categorize them into HR Questions, Technical Questions, Project-Based Questions (referencing their specific resume projects), and Behavioral Questions.
                
                You MUST respond strictly with a valid JSON matching the following schema. Do NOT wrap your output in markdown codeblocks (e.g. ```json), do NOT add extra text, just raw JSON.
                
                JSON Schema:
                {
                  "hrQuestions": ["Why do you want to join our company?", "Explain your notice period."],
                  "technicalQuestions": ["Explain how you would implement a REST API in Spring Boot.", "Why did you use MongoDB over PostgreSQL?"],
                  "projectQuestions": ["Explain the architecture of your Blood Donation platform mentioned in projects.", "How did you optimize MongoDB queries?"],
                  "behavioralQuestions": ["Describe a time when you solved a complex bug.", "How do you handle project timeline changes?"]
                }
                
                Resume Text:
                """ + resume.getExtractedText() + "\n\nJob Description:\n" + jobDescription;

        try {
            String aiResponse = openRouterService.queryOpenRouter(prompt);
            Map<String, Object> map = objectMapper.readValue(aiResponse, Map.class);
            
            InterviewQuestion q = InterviewQuestion.builder()
                    .resume(resume)
                    .jobDescription(jobDescription)
                    .hrQuestions(convertToList(map.get("hrQuestions")))
                    .technicalQuestions(convertToList(map.get("technicalQuestions")))
                    .projectQuestions(convertToList(map.get("projectQuestions")))
                    .behavioralQuestions(convertToList(map.get("behavioralQuestions")))
                    .build();
            
            interviewQuestionRepository.save(q);
            
            return InterviewQuestionsResponse.builder()
                    .hrQuestions(q.getHrQuestions())
                    .technicalQuestions(q.getTechnicalQuestions())
                    .projectQuestions(q.getProjectQuestions())
                    .behavioralQuestions(q.getBehavioralQuestions())
                    .build();
        } catch (Exception e) {
            log.error("Interview questions generation failed", e);
            throw new OpenRouterException("Failed to generate interview questions: " + e.getMessage());
        }
    }

    @Transactional
    public SkillGapResponse analyzeSkillGap(Long resumeId, String jobDescription) {
        Resume resume = resumeService.getResumeById(resumeId);
        
        String prompt = """
                You are a career development coach and technical validator. Analyze the candidate's resume skills against the target job description.
                Identify missing skills and categorize them with a priority order (HIGH, MEDIUM, LOW) and provide a learning roadmap/resources for each missing skill.
                
                You MUST respond strictly with a valid JSON matching the following schema. Do NOT wrap your output in markdown codeblocks (e.g. ```json), do NOT add extra text, just raw JSON.
                
                JSON Schema:
                {
                  "missingSkills": [
                    {
                      "skill": "Docker",
                      "priority": "HIGH",
                      "learningRoadmap": "Learn basic containers, run images, build Dockerfiles. Resources: Docker documentation & freeCodeCamp YouTube tutorials."
                    },
                    {
                      "skill": "Kubernetes",
                      "priority": "MEDIUM",
                      "learningRoadmap": "Understand Pods, Services, Deployments. Resources: K8s official interactive tutorials."
                    }
                  ]
                }
                
                Resume Text:
                """ + resume.getExtractedText() + "\n\nJob Description:\n" + jobDescription;

        try {
            String aiResponse = openRouterService.queryOpenRouter(prompt);
            
            // Parse custom SkillGap structure
            Map<String, Object> root = objectMapper.readValue(aiResponse, Map.class);
            List<?> missingSkillsList = (List<?>) root.get("missingSkills");
            List<SkillGapItem> items = new ArrayList<>();
            
            if (missingSkillsList != null) {
                for (Object o : missingSkillsList) {
                    SkillGapItem item = objectMapper.convertValue(o, SkillGapItem.class);
                    items.add(item);
                }
            }
            
            SkillGap gap = SkillGap.builder()
                    .resume(resume)
                    .jobDescription(jobDescription)
                    .missingSkills(items)
                    .build();
            
            skillGapRepository.save(gap);
            
            return SkillGapResponse.builder()
                    .missingSkills(gap.getMissingSkills())
                    .build();
        } catch (Exception e) {
            log.error("Skill gap analysis failed", e);
            throw new OpenRouterException("Failed to calculate skill gap: " + e.getMessage());
        }
    }

    @Transactional
    public CareerAdviceResponse generateCareerAdvice(Long resumeId) {
        Resume resume = resumeService.getResumeById(resumeId);
        
        String prompt = """
                You are an AI career advisor. Based on the candidate's resume, recommend suitable job roles, career suggestions, and a structured learning plan.
                The learning plan should be grouped by timeframe (e.g. Month 1: Spring Boot Fundamentals, Month 2: DevOps) with specific topics and learning resources.
                
                You MUST respond strictly with a valid JSON matching the following schema. Do NOT wrap your output in markdown codeblocks (e.g. ```json), do NOT add extra text, just raw JSON.
                
                JSON Schema:
                {
                  "suitableRoles": ["Software Development Engineer", "Backend Developer", "Full Stack Developer"],
                  "careerSuggestions": ["Focus on building complete microservices to stand out", "Work on standardizing design patterns in Github repos"],
                  "learningPlan": [
                    {
                      "timeframe": "Month 1: Spring Boot & Databases",
                      "topics": ["REST APIs", "Spring Security", "JPA & H2/PostgreSQL"],
                      "resources": ["Spring official guides", "Baeldung Spring Boot guides"]
                    },
                    {
                      "timeframe": "Month 2: DevOps & Containers",
                      "topics": ["Docker containers", "CI/CD basics using Github Actions"],
                      "resources": ["Docker official docs", "GitHub Actions documentation"]
                    }
                  ]
                }
                
                Resume Text:
                """ + resume.getExtractedText();

        try {
            String aiResponse = openRouterService.queryOpenRouter(prompt);
            
            Map<String, Object> root = objectMapper.readValue(aiResponse, Map.class);
            List<?> planList = (List<?>) root.get("learningPlan");
            List<LearningPlanItem> items = new ArrayList<>();
            
            if (planList != null) {
                for (Object o : planList) {
                    LearningPlanItem item = objectMapper.convertValue(o, LearningPlanItem.class);
                    items.add(item);
                }
            }
            
            CareerAdvice advice = CareerAdvice.builder()
                    .resume(resume)
                    .suitableRoles(convertToList(root.get("suitableRoles")))
                    .careerSuggestions(convertToList(root.get("careerSuggestions")))
                    .learningPlan(items)
                    .build();
            
            careerAdviceRepository.save(advice);
            
            return CareerAdviceResponse.builder()
                    .suitableRoles(advice.getSuitableRoles())
                    .careerSuggestions(advice.getCareerSuggestions())
                    .learningPlan(advice.getLearningPlan())
                    .build();
        } catch (Exception e) {
            log.error("Career advice generation failed", e);
            throw new OpenRouterException("Failed to generate career advice: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> convertToList(Object obj) {
        if (obj instanceof List) {
            List<?> rawList = (List<?>) obj;
            return rawList.stream()
                    .map(o -> o != null ? o.toString() : "")
                    .collect(Collectors.toList());
        }
        return new ArrayList<>();
    }
}
