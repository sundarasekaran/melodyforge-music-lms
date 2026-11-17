package com.musiclms.controller;

import com.musiclms.model.entity.HistorySection;
import com.musiclms.model.entity.Instrument;
import com.musiclms.model.entity.Lesson;
import com.musiclms.model.entity.User;
import com.musiclms.service.AdminService;
import com.musiclms.service.InstrumentHistoryService;
import com.musiclms.service.InstrumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;
    private final InstrumentService instrumentService;
    private final InstrumentHistoryService historyService;

    public AdminController(AdminService adminService,
                           InstrumentService instrumentService,
                           InstrumentHistoryService historyService) {
        this.adminService = adminService;
        this.instrumentService = instrumentService;
        this.historyService = historyService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPlatformStats() {
        return ResponseEntity.ok(adminService.getPlatformStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/instruments")
    public ResponseEntity<List<Instrument>> getAllInstruments() {
        return ResponseEntity.ok(instrumentService.getAllInstrumentsForAdmin());
    }

    @PostMapping("/instruments")
    public ResponseEntity<Instrument> createOrUpdateInstrument(@RequestBody Instrument instrument) {
        return ResponseEntity.ok(adminService.saveInstrument(instrument));
    }

    @GetMapping("/instruments/{slug}/history")
    public ResponseEntity<List<HistorySection>> getInstrumentHistoryForAdmin(@PathVariable String slug) {
        return ResponseEntity.ok(historyService.getAllSectionsForAdmin(slug));
    }

    @PostMapping("/instruments/{instrumentId}/history")
    public ResponseEntity<HistorySection> addHistorySection(
            @PathVariable Long instrumentId,
            @RequestBody HistorySection section) {
        return ResponseEntity.ok(historyService.saveChapter(instrumentId, section));
    }

    @PutMapping("/history/{id}")
    public ResponseEntity<HistorySection> updateHistorySection(
            @PathVariable Long id,
            @RequestBody HistorySection section) {
        return ResponseEntity.ok(historyService.updateChapter(id, section));
    }

    @PatchMapping("/history/{id}/toggle-publish")
    public ResponseEntity<HistorySection> togglePublishStatus(@PathVariable Long id) {
        return ResponseEntity.ok(historyService.togglePublish(id));
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<Map<String, Object>> deleteHistorySection(@PathVariable Long id) {
        historyService.deleteChapter(id);
        return ResponseEntity.ok(Map.of("message", "History chapter deleted successfully", "id", id));
    }

    @PostMapping("/lessons")
    public ResponseEntity<Lesson> createOrUpdateLesson(@RequestBody Lesson lesson) {
        return ResponseEntity.ok(adminService.saveLesson(lesson));
    }
}
