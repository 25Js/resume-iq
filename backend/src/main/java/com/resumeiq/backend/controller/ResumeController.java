package com.resumeiq.backend.controller;

import com.resumeiq.backend.dto.DashboardResponse;
import com.resumeiq.backend.dto.ResumeResponse;
import com.resumeiq.backend.service.ResumeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/resume")
@RequiredArgsConstructor
@Tag(name = "Resume Upload & Management Controller", description = "Endpoints for uploading resumes, fetching histories, deleting records, and compiling dashboard statistics")
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload and parse a PDF or DOCX resume", description = "Extracts text, invokes Gemini to construct a structured profile, and stores the records.")
    public ResponseEntity<ResumeResponse> uploadResume(@RequestParam("file") MultipartFile file) {
        return new ResponseEntity<>(resumeService.uploadAndParseResume(file), HttpStatus.CREATED);
    }

    @GetMapping("/history")
    @Operation(summary = "Get user's upload history", description = "Returns the list of all resumes uploaded by the current candidate ordered by upload date.")
    public ResponseEntity<List<ResumeResponse>> getHistory() {
        return ResponseEntity.ok(resumeService.getResumeHistory());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an uploaded resume", description = "Removes the resume file and all associated AI matching and analysis results.")
    public ResponseEntity<Void> deleteResume(@PathVariable("id") Long id) {
        resumeService.deleteResume(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Retrieve candidate statistics dashboard details", description = "Compiles resume upload counts, average scores, score trends over history, and skill distributions.")
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(resumeService.getDashboardData());
    }
}
