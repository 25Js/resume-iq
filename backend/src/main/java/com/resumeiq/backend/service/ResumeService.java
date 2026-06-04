package com.resumeiq.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeiq.backend.dto.DashboardResponse;
import com.resumeiq.backend.dto.ResumeResponse;
import com.resumeiq.backend.entity.Resume;
import com.resumeiq.backend.entity.ResumeProfile;
import com.resumeiq.backend.entity.User;
import com.resumeiq.backend.exception.InvalidFileException;
import com.resumeiq.backend.exception.ResourceNotFoundException;
import com.resumeiq.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final ResumeProfileRepository resumeProfileRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final JobMatchRepository jobMatchRepository;
    private final UserService userService;
    private final PdfParserService pdfParserService;
    private final DocxParserService docxParserService;
    private final OpenRouterService openRouterService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @Transactional
    public ResumeResponse uploadAndParseResume(MultipartFile file) {
        User currentUser = userService.getAuthenticatedUser();

        // 1. Validation
        if (file.isEmpty()) {
            throw new InvalidFileException("Uploaded file is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidFileException("File exceeds maximum allowed size of 5MB");
        }

        String filename = file.getOriginalFilename();
        String contentType = file.getContentType();

        if (filename == null) {
            throw new InvalidFileException("Filename is missing");
        }

        String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        if (!extension.equals("pdf") && !extension.equals("docx")) {
            throw new InvalidFileException("Unsupported file type. Only PDF and DOCX files are allowed.");
        }

        // 2. Text Extraction
        String extractedText;
        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
            if (extension.equals("pdf")) {
                extractedText = pdfParserService.extractText(fileBytes);
            } else {
                extractedText = docxParserService.extractText(fileBytes);
            }
        } catch (IOException e) {
            log.error("Error reading uploaded file bytes", e);
            throw new InvalidFileException("Error reading file content: " + e.getMessage());
        }

        // 3. Save Resume basic record first (so we have a resume ID for reference if needed)
        Resume resume = Resume.builder()
                .filename(filename)
                .fileType(contentType != null ? contentType : "application/octet-stream")
                .fileData(fileBytes)
                .extractedText(extractedText)
                .user(currentUser)
                .build();

        resume = resumeRepository.save(resume);

        // 4. Parse Structured Profile using OpenRouter
        ResumeProfile profile = parseProfileWithAI(resume, extractedText);
        resume.setResumeProfile(profile);

        // Save profile
        resumeProfileRepository.save(profile);

        return mapToResumeResponse(resume);
    }

    private ResumeProfile parseProfileWithAI(Resume resume, String text) {
        String prompt = """
                You are an expert ATS (Applicant Tracking System) parsing agent.
                Analyze the following unstructured resume text and extract its structural information into a clean, complete, valid JSON structure.
                Ensure you capture the candidate's name, email, phone number, list of skills, education, experience, projects, and certifications.
                
                You MUST respond strictly with a valid JSON matching the following schema. Do NOT wrap your output in markdown codeblocks (e.g. ```json), do NOT add extra text, just raw JSON.
                
                JSON Schema:
                {
                  "candidateName": "Full Name of Candidate (or empty string if not found)",
                  "email": "Email Address (or empty string if not found)",
                  "phone": "Phone Number (or empty string if not found)",
                  "skills": ["list", "of", "skills"],
                  "education": ["list of education institutions, degrees, dates"],
                  "experience": ["list of work experiences, job titles, companies, bullet points"],
                  "projects": ["list of personal/academic projects, descriptions, techs"],
                  "certifications": ["list of certifications, licensing, training"]
                }
                
                Resume Text:
                """ + text;

        try {
            String aiResponse = openRouterService.queryOpenRouter(prompt);
            // Parse response
            Map<String, Object> map = objectMapper.readValue(aiResponse, Map.class);
            
            return ResumeProfile.builder()
                    .resume(resume)
                    .candidateName((String) map.getOrDefault("candidateName", ""))
                    .email((String) map.getOrDefault("email", ""))
                    .phone((String) map.getOrDefault("phone", ""))
                    .skills(convertToList(map.get("skills")))
                    .education(convertToList(map.get("education")))
                    .experience(convertToList(map.get("experience")))
                    .projects(convertToList(map.get("projects")))
                    .certifications(convertToList(map.get("certifications")))
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse resume profile using AI. Falling back to default empty profile.", e);
            // Fallback: create an empty profile so upload doesn't fail
            return ResumeProfile.builder()
                    .resume(resume)
                    .candidateName("Not Extracted")
                    .email("")
                    .phone("")
                    .skills(new ArrayList<>())
                    .education(new ArrayList<>())
                    .experience(new ArrayList<>())
                    .projects(new ArrayList<>())
                    .certifications(new ArrayList<>())
                    .build();
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

    public List<ResumeResponse> getResumeHistory() {
        User currentUser = userService.getAuthenticatedUser();
        List<Resume> resumes = resumeRepository.findByUserOrderByUploadDateDesc(currentUser);
        return resumes.stream()
                .map(this::mapToResumeResponse)
                .collect(Collectors.toList());
    }

    public Resume getResumeById(Long id) {
        User currentUser = userService.getAuthenticatedUser();
        return resumeRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + id));
    }

    @Transactional
    public void deleteResume(Long id) {
        User currentUser = userService.getAuthenticatedUser();
        Resume resume = resumeRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found or access denied for id: " + id));
        resumeRepository.delete(resume);
        log.info("Resume with id {} deleted successfully", id);
    }

    public DashboardResponse getDashboardData() {
        User currentUser = userService.getAuthenticatedUser();
        List<Resume> resumes = resumeRepository.findByUserOrderByUploadDateDesc(currentUser);

        long totalResumes = resumes.size();
        double avgScore = 0.0;
        int latestAtsScore = 0;
        int latestJobMatchScore = 0;

        List<DashboardResponse.ScoreHistoryItem> scoreHistory = new ArrayList<>();
        Map<String, Integer> skillCounts = new HashMap<>();

        if (totalResumes > 0) {
            double totalScore = 0;
            int countWithScore = 0;

            for (Resume res : resumes) {
                // Fetch latest analysis
                var analyses = resumeAnalysisRepository.findByResumeOrderByCreatedAtDesc(res);
                Integer score = null;
                Integer ats = null;

                if (!analyses.isEmpty()) {
                    score = analyses.get(0).getScore();
                    totalScore += score;
                    countWithScore++;
                }

                // Fetch latest job match score
                var matches = jobMatchRepository.findByResumeOrderByCreatedAtDesc(res);
                if (!matches.isEmpty()) {
                    ats = matches.get(0).getMatchScore(); // we can map job match score here as well
                    if (latestJobMatchScore == 0) {
                        latestJobMatchScore = matches.get(0).getMatchScore();
                    }
                }

                // Compile score history item
                scoreHistory.add(new DashboardResponse.ScoreHistoryItem(
                        res.getId(),
                        res.getFilename(),
                        res.getUploadDate(),
                        score != null ? score : 0,
                        ats != null ? ats : 0
                ));

                // Extract skills for distribution chart
                if (res.getResumeProfile() != null && res.getResumeProfile().getSkills() != null) {
                    for (String skill : res.getResumeProfile().getSkills()) {
                        String cleanSkill = skill.trim().toLowerCase();
                        if (!cleanSkill.isEmpty()) {
                            // Standardize some common names (e.g. js -> javascript)
                            if (cleanSkill.equals("js")) cleanSkill = "javascript";
                            if (cleanSkill.equals("ts")) cleanSkill = "typescript";
                            if (cleanSkill.equals("py")) cleanSkill = "python";
                            skillCounts.put(cleanSkill, skillCounts.getOrDefault(cleanSkill, 0) + 1);
                        }
                    }
                }
            }

            if (countWithScore > 0) {
                avgScore = totalScore / countWithScore;
            }

            // Get latest ATS score (from any analysis)
            for (Resume res : resumes) {
                var analyses = resumeAnalysisRepository.findByResumeOrderByCreatedAtDesc(res);
                if (!analyses.isEmpty()) {
                    latestAtsScore = analyses.get(0).getScore(); // Or calculate standard ATS score
                    break;
                }
            }
        }

        // Sort skill count map and get top 8 skills for the chart
        List<DashboardResponse.SkillCountItem> skillDistribution = skillCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(8)
                .map(entry -> new DashboardResponse.SkillCountItem(
                        capitalizeWord(entry.getKey()),
                        entry.getValue()
                ))
                .collect(Collectors.toList());

        // Reverse score history list so it displays oldest to newest in charts
        Collections.reverse(scoreHistory);

        return DashboardResponse.builder()
                .totalResumesUploaded(totalResumes)
                .averageResumeScore(Double.parseDouble(String.format(Locale.US, "%.1f", avgScore)))
                .latestAtsScore(latestAtsScore)
                .latestJobMatchScore(latestJobMatchScore)
                .scoreHistory(scoreHistory)
                .skillDistribution(skillDistribution)
                .build();
    }

    private String capitalizeWord(String str) {
        if (str == null || str.isEmpty()) return "";
        if (str.length() == 1) return str.toUpperCase();
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    private ResumeResponse mapToResumeResponse(Resume resume) {
        return ResumeResponse.builder()
                .id(resume.getId())
                .filename(resume.getFilename())
                .fileType(resume.getFileType())
                .uploadDate(resume.getUploadDate())
                .profile(resume.getResumeProfile())
                .build();
    }
}
