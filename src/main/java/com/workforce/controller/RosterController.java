package com.workforce.controller;

import com.workforce.entity.Roster;
import com.workforce.scheduler.RosterGenerator;
import com.workforce.service.RosterService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rosters")
public class RosterController {

    private final RosterService rosterService;
    private final RosterGenerator rosterGenerator;

    public RosterController(
            RosterService rosterService,
            RosterGenerator rosterGenerator) {

        this.rosterService = rosterService;
        this.rosterGenerator = rosterGenerator;
    }

    // ==========================================
    // CREATE
    // ==========================================

    @PostMapping
    public ResponseEntity<Roster> createRoster(
            @RequestBody Roster roster) {

        return new ResponseEntity<>(
                rosterService.createRoster(roster),
                HttpStatus.CREATED
        );
    }

    // ==========================================
    // GET ALL
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Roster>> getAllRosters() {

        return ResponseEntity.ok(
                rosterService.getAllRosters()
        );
    }

    // ==========================================
    // GET BY ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<Roster> getRosterById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                rosterService.getRosterById(id)
        );
    }

    // ==========================================
    // GET BY EMPLOYEE
    // ==========================================

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Roster>> getRostersByEmployee(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                rosterService.getRostersByEmployee(employeeId)
        );
    }

    // ==========================================
    // GET BY DATE
    // ==========================================

    @GetMapping("/date/{date}")
    public ResponseEntity<List<Roster>> getRostersByDate(
            @PathVariable LocalDate date) {

        return ResponseEntity.ok(
                rosterService.getRostersByDate(date)
        );
    }

    // ==========================================
    // UPDATE
    // ==========================================

    @PutMapping("/{id}")
    public ResponseEntity<Roster> updateRoster(
            @PathVariable Long id,
            @RequestBody Roster roster) {

        return ResponseEntity.ok(
                rosterService.updateRoster(
                        id,
                        roster
                )
        );
    }

    // ==========================================
    // DELETE
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRoster(
            @PathVariable Long id) {

        rosterService.deleteRoster(id);

        return ResponseEntity.ok(
                "Roster deleted successfully"
        );
    }

    // ==========================================
    // GENERATE MONTHLY ROSTER
    // ==========================================

    @PostMapping("/generate")
    public ResponseEntity<List<Roster>> generateRoster(
            @RequestParam int year,
            @RequestParam int month) {

        List<Roster> rosters =
                rosterGenerator.generateMonthlyRoster(
                        year,
                        month
                );

        return ResponseEntity.ok(rosters);
    }
}