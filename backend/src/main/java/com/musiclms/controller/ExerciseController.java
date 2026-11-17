package com.musiclms.controller;

import com.musiclms.dto.ExerciseEvaluationRequest;
import com.musiclms.dto.ExerciseEvaluationResponse;
import com.musiclms.model.entity.User;
import com.musiclms.service.AuthService;
import com.musiclms.service.ExerciseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;
    private final AuthService authService;

    public ExerciseController(ExerciseService exerciseService, AuthService authService) {
        this.exerciseService = exerciseService;
        this.authService = authService;
    }

    @PostMapping("/{id}/evaluate")
    public ResponseEntity<ExerciseEvaluationResponse> evaluateExercise(
            @PathVariable Long id,
            @RequestBody ExerciseEvaluationRequest request) {
        User user = authService.getAuthenticatedUser();
        return ResponseEntity.ok(exerciseService.evaluateExercise(id, user, request));
    }
}
