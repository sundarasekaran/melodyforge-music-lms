package com.musiclms.controller;

import com.musiclms.dto.*;
import com.musiclms.model.entity.AssessmentAttempt;
import com.musiclms.model.entity.User;
import com.musiclms.service.AssessmentService;
import com.musiclms.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assessments")
public class AssessmentController {

    private final AssessmentService assessmentService;
    private final AuthService authService;

    public AssessmentController(AssessmentService assessmentService, AuthService authService) {
        this.assessmentService = assessmentService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<AssessmentResponse>> getAssessmentsOverview() {
        User user = authService.getAuthenticatedUser();
        return ResponseEntity.ok(assessmentService.getAssessmentsOverview(user));
    }

    @GetMapping("/{level}")
    public ResponseEntity<List<AssessmentQuestionDto>> getAssessmentQuestions(@PathVariable("level") Integer level) {
        return ResponseEntity.ok(assessmentService.getAssessmentQuestions(level));
    }

    @PostMapping("/{level}/start")
    public ResponseEntity<AssessmentAttempt> startAttempt(@PathVariable("level") Integer level) {
        User user = authService.getAuthenticatedUser();
        return ResponseEntity.ok(assessmentService.startAttempt(user, level));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public ResponseEntity<AssessmentResultResponse> submitAttempt(
            @PathVariable("attemptId") Long attemptId,
            @RequestBody SubmitAssessmentRequest request) {
        User user = authService.getAuthenticatedUser();
        return ResponseEntity.ok(assessmentService.submitAttempt(user, attemptId, request));
    }

    @GetMapping("/attempts")
    public ResponseEntity<List<AssessmentAttempt>> getUserAttemptHistory() {
        User user = authService.getAuthenticatedUser();
        return ResponseEntity.ok(assessmentService.getUserAttemptHistory(user));
    }

    @GetMapping("/graduation/status")
    public ResponseEntity<GraduationStatusResponse> getGraduationStatus() {
        User user = authService.getAuthenticatedUser();
        return ResponseEntity.ok(assessmentService.getGraduationStatus(user));
    }

    @PostMapping("/graduation/certificate")
    public ResponseEntity<CertificateResponse> claimCertificate(@RequestBody(required = false) ClaimCertificateRequest request) {
        User user = authService.getAuthenticatedUser();
        ClaimCertificateRequest req = request != null ? request : new ClaimCertificateRequest();
        return ResponseEntity.ok(assessmentService.claimCertificate(user, req));
    }

    @GetMapping("/graduation/certificate")
    public ResponseEntity<CertificateResponse> getCertificate() {
        User user = authService.getAuthenticatedUser();
        return ResponseEntity.ok(assessmentService.getCertificate(user));
    }

    @GetMapping("/verify/{certificateNumber}")
    public ResponseEntity<CertificateResponse> verifyCertificate(@PathVariable("certificateNumber") String certificateNumber) {
        return ResponseEntity.ok(assessmentService.verifyCertificate(certificateNumber));
    }

    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminAssessmentStatsResponse> getAdminAssessmentStats() {
        return ResponseEntity.ok(assessmentService.getAdminStats());
    }
}
