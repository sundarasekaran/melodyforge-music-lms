package com.musiclms.controller;

import com.musiclms.dto.LessonCompletionRequest;
import com.musiclms.model.entity.Lesson;
import com.musiclms.model.entity.User;
import com.musiclms.model.entity.UserProgress;
import com.musiclms.service.AuthService;
import com.musiclms.service.CurriculumService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/lessons")
public class CurriculumController {

    private final CurriculumService curriculumService;
    private final AuthService authService;

    public CurriculumController(CurriculumService curriculumService, AuthService authService) {
        this.curriculumService = curriculumService;
        this.authService = authService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getLessonDetails(@PathVariable Long id) {
        User user = authService.getAuthenticatedUser();
        return ResponseEntity.ok(curriculumService.getLessonDetailsWithProgress(id, user));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Map<String, Object>> completeLesson(
            @PathVariable Long id,
            @RequestBody(required = false) LessonCompletionRequest request) {
        User user = authService.getAuthenticatedUser();
        LessonCompletionRequest req = request != null ? request : new LessonCompletionRequest(100);
        return ResponseEntity.ok(curriculumService.completeLesson(id, user, req));
    }

    @GetMapping("/progress/me")
    public ResponseEntity<List<UserProgress>> getMyProgress() {
        User user = authService.getAuthenticatedUser();
        return ResponseEntity.ok(curriculumService.getUserProgress(user));
    }
}
