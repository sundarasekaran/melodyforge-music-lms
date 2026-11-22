package com.musiclms.controller;

import com.musiclms.dto.analytics.AdminPlatformAnalyticsResponse;
import com.musiclms.dto.analytics.StudentAnalyticsResponse;
import com.musiclms.dto.analytics.StudentSummaryPageResponse;
import com.musiclms.model.entity.User;
import com.musiclms.service.AnalyticsService;
import com.musiclms.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final AuthService authService;

    public AnalyticsController(AnalyticsService analyticsService, AuthService authService) {
        this.analyticsService = analyticsService;
        this.authService = authService;
    }

    @GetMapping("/student")
    public ResponseEntity<StudentAnalyticsResponse> getStudentAnalytics(
            @RequestParam(value = "instrument", required = false) String instrument,
            @RequestParam(value = "range", required = false) String range) {
        User user = authService.getAuthenticatedUser();
        return ResponseEntity.ok(analyticsService.getStudentAnalytics(user, instrument, range));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<AdminPlatformAnalyticsResponse> getAdminAnalytics() {
        return ResponseEntity.ok(analyticsService.getAdminPlatformAnalytics());
    }

    @GetMapping("/admin/students")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<StudentSummaryPageResponse> getPaginatedStudents(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(analyticsService.getPaginatedStudents(search, Math.max(0, page), Math.min(100, Math.max(1, size))));
    }
}
