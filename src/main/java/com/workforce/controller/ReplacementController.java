package com.workforce.controller;

import com.workforce.dto.ReplacementSuggestion;
import com.workforce.entity.Roster;
import com.workforce.service.ReplacementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/replacements")
public class ReplacementController {

    private final ReplacementService replacementService;

    public ReplacementController(ReplacementService replacementService) {
        this.replacementService = replacementService;
    }

    // ============================================================
    // FIND REPLACEMENT SUGGESTIONS
    // ============================================================

    @GetMapping("/suggestions")
    public ResponseEntity<List<ReplacementSuggestion>> getSuggestions(
            @RequestParam Long employeeId,
            @RequestParam LocalDate date) {

        List<ReplacementSuggestion> suggestions =
                replacementService.findSuggestions(
                        employeeId,
                        date
                );

        return ResponseEntity.ok(suggestions);
    }

    // ============================================================
    // REPLACE EMPLOYEE IN ROSTER
    // ============================================================

    @PutMapping("/replace")
    public ResponseEntity<Roster> replaceRoster(
            @RequestParam Long employeeId,
            @RequestParam Long replacementEmployeeId,
            @RequestParam LocalDate date) {

        Roster updatedRoster =
                replacementService.replaceRoster(
                        employeeId,
                        replacementEmployeeId,
                        date
                );

        return ResponseEntity.ok(updatedRoster);
    }
}
