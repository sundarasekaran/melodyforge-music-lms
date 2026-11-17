package com.musiclms.controller;

import com.musiclms.model.entity.Instrument;
import com.musiclms.model.entity.LearningTier;
import com.musiclms.model.entity.User;
import com.musiclms.service.AuthService;
import com.musiclms.service.CurriculumService;
import com.musiclms.service.InstrumentHistoryService;
import com.musiclms.service.InstrumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/instruments")
public class InstrumentController {

    private final InstrumentService instrumentService;
    private final CurriculumService curriculumService;
    private final InstrumentHistoryService historyService;
    private final AuthService authService;

    public InstrumentController(InstrumentService instrumentService,
                                CurriculumService curriculumService,
                                InstrumentHistoryService historyService,
                                AuthService authService) {
        this.instrumentService = instrumentService;
        this.curriculumService = curriculumService;
        this.historyService = historyService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<Instrument>> getAllActiveInstruments() {
        return ResponseEntity.ok(instrumentService.getAllActiveInstruments());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Instrument> getInstrumentBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(instrumentService.getInstrumentBySlug(slug));
    }

    @GetMapping("/{slug}/history")
    public ResponseEntity<List<Map<String, Object>>> getInstrumentHistory(@PathVariable String slug) {
        Optional<User> user = authService.getAuthenticatedUserOptional();
        return ResponseEntity.ok(historyService.getHistoryWithProgress(slug, user.orElse(null)));
    }

    @PostMapping("/{slug}/history/{chapterId}/complete")
    public ResponseEntity<Map<String, Object>> completeHistoryChapter(
            @PathVariable String slug,
            @PathVariable Long chapterId,
            @RequestBody(required = false) Map<String, Object> body) {
        User user = authService.getAuthenticatedUser();
        Integer scorePercent = 100;
        if (body != null && body.containsKey("scorePercent") && body.get("scorePercent") instanceof Number) {
            scorePercent = ((Number) body.get("scorePercent")).intValue();
        }
        return ResponseEntity.ok(historyService.completeChapter(slug, chapterId, user, scorePercent));
    }

    @GetMapping("/{slug}/tiers")
    public ResponseEntity<List<LearningTier>> getInstrumentTiers(@PathVariable String slug) {
        return ResponseEntity.ok(curriculumService.getTiersForInstrument(slug));
    }
}
