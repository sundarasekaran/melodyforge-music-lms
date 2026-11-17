package com.musiclms.controller;

import com.musiclms.dto.LeaderboardResponse;
import com.musiclms.model.entity.Badge;
import com.musiclms.model.entity.User;
import com.musiclms.model.entity.UserBadge;
import com.musiclms.service.AuthService;
import com.musiclms.service.GamificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/gamification")
public class GamificationController {

    private final GamificationService gamificationService;
    private final AuthService authService;

    public GamificationController(GamificationService gamificationService, AuthService authService) {
        this.gamificationService = gamificationService;
        this.authService = authService;
    }

    @GetMapping("/badges")
    public ResponseEntity<List<Badge>> getAllBadges() {
        return ResponseEntity.ok(gamificationService.getAllBadges());
    }

    @GetMapping("/badges/me")
    public ResponseEntity<List<UserBadge>> getMyBadges() {
        User user = authService.getAuthenticatedUser();
        return ResponseEntity.ok(gamificationService.getUserBadges(user));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardResponse>> getLeaderboard() {
        return ResponseEntity.ok(gamificationService.getLeaderboard());
    }
}
