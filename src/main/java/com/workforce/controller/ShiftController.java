package com.workforce.controller;

import com.workforce.entity.Shift;
import com.workforce.service.ShiftService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shifts")
public class ShiftController {

    private final ShiftService shiftService;

    public ShiftController(ShiftService shiftService) {
        this.shiftService = shiftService;
    }

    // CREATE
    @PostMapping
    public ResponseEntity<Shift> createShift(
            @RequestBody Shift shift) {

        return new ResponseEntity<>(
                shiftService.createShift(shift),
                HttpStatus.CREATED
        );
    }

    // READ ALL
    @GetMapping
    public ResponseEntity<List<Shift>> getAllShifts() {

        return ResponseEntity.ok(
                shiftService.getAllShifts()
        );
    }

    // READ BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Shift> getShiftById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                shiftService.getShiftById(id)
        );
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Shift> updateShift(
            @PathVariable Long id,
            @RequestBody Shift shift) {

        return ResponseEntity.ok(
                shiftService.updateShift(
                        id,
                        shift
                )
        );
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteShift(
            @PathVariable Long id) {

        shiftService.deleteShift(id);

        return ResponseEntity.ok(
                "Shift deleted successfully"
        );
    }
}