package com.musiclms.service;

import com.musiclms.dto.ExerciseEvaluationRequest;
import com.musiclms.dto.ExerciseEvaluationResponse;
import com.musiclms.model.entity.Exercise;
import com.musiclms.model.entity.User;
import com.musiclms.repository.ExerciseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final GamificationService gamificationService;

    public ExerciseService(ExerciseRepository exerciseRepository, GamificationService gamificationService) {
        this.exerciseRepository = exerciseRepository;
        this.gamificationService = gamificationService;
    }

    @Transactional
    public ExerciseEvaluationResponse evaluateExercise(Long exerciseId, User user, ExerciseEvaluationRequest request) {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found with id: " + exerciseId));

        String submitted = request.getAnswer() != null ? request.getAnswer().trim() : "";
        String expected = exercise.getExpectedAnswer() != null ? exercise.getExpectedAnswer().trim() : "";

        boolean isCorrect = submitted.equalsIgnoreCase(expected);
        int pointsAwarded = isCorrect ? exercise.getPoints() : 0;

        if (isCorrect && pointsAwarded > 0) {
            gamificationService.awardXp(user, pointsAwarded);
        }

        return new ExerciseEvaluationResponse(
                isCorrect,
                exercise.getExpectedAnswer(),
                pointsAwarded,
                exercise.getExplanation()
        );
    }
}
