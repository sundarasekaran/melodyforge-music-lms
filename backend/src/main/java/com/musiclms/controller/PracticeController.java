package com.musiclms.controller;

import com.musiclms.dto.*;
import com.musiclms.model.entity.PracticeSession;
import com.musiclms.model.entity.User;
import com.musiclms.service.AuthService;
import com.musiclms.service.PracticeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/practice")
public class PracticeController {

    private final PracticeService practiceService;
    private final AuthService authService;

    public PracticeController(PracticeService practiceService, AuthService authService) {
        this.practiceService = practiceService;
        this.authService = authService;
    }

    @PostMapping("/sessions")
    public ResponseEntity<PracticeSession> logPracticeSession(@RequestBody PracticeSessionRequest request) {
        User user = authService.getAuthenticatedUser();
        return ResponseEntity.ok(practiceService.logPracticeSession(user, request));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<PracticeSession>> getMyPracticeSessions() {
        User user = authService.getAuthenticatedUser();
        return ResponseEntity.ok(practiceService.getUserPracticeHistory(user));
    }

    // --- Phase 3: Structured Practice Routines Endpoints ---

    @PostMapping("/routines/start")
    public ResponseEntity<PracticeSession> startRoutineSession(@RequestBody StartRoutineRequest request) {
        User user = authService.getAuthenticatedUser();
        return ResponseEntity.ok(practiceService.startRoutineSession(user, request));
    }

    @PutMapping("/routines/{id}/progress")
    public ResponseEntity<PracticeSession> updateRoutineProgress(
            @PathVariable("id") Long id,
            @RequestBody UpdateRoutineProgressRequest request) {
        User user = authService.getAuthenticatedUser();
        return ResponseEntity.ok(practiceService.updateRoutineProgress(user, id, request));
    }

    @PostMapping("/routines/{id}/complete")
    public ResponseEntity<PracticeSession> completeRoutineSession(
            @PathVariable("id") Long id,
            @RequestBody CompleteRoutineRequest request) {
        User user = authService.getAuthenticatedUser();
        return ResponseEntity.ok(practiceService.completeRoutineSession(user, id, request));
    }

    @GetMapping("/routines/stats")
    public ResponseEntity<PracticeStatsResponse> getPracticeStats() {
        User user = authService.getAuthenticatedUser();
        return ResponseEntity.ok(practiceService.getPracticeStats(user));
    }
}
