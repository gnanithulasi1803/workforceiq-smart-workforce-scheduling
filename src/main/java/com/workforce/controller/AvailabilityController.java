package com.workforce.controller;

import com.workforce.entity.Availability;
import com.workforce.service.AvailabilityService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/availability")
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    public AvailabilityController(
            AvailabilityService availabilityService) {

        this.availabilityService =
                availabilityService;
    }


    // ==========================================
    // CREATE
    // ==========================================

    @PostMapping
    public ResponseEntity<Availability>
    createAvailability(
            @RequestBody Availability availability) {

        return new ResponseEntity<>(
                availabilityService
                        .createAvailability(
                                availability
                        ),
                HttpStatus.CREATED
        );
    }


    // ==========================================
    // GET ALL
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Availability>>
    getAllAvailabilities() {

        return ResponseEntity.ok(
                availabilityService
                        .getAllAvailabilities()
        );
    }


    // ==========================================
    // GET BY ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<Availability>
    getAvailabilityById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                availabilityService
                        .getAvailabilityById(id)
        );
    }


    // ==========================================
    // GET BY EMPLOYEE
    // ==========================================

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Availability>>
    getByEmployee(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                availabilityService
                        .getByEmployee(employeeId)
        );
    }


    // ==========================================
    // GET BY DATE
    // ==========================================

    @GetMapping("/date/{date}")
    public ResponseEntity<List<Availability>>
    getByDate(
            @PathVariable LocalDate date) {

        return ResponseEntity.ok(
                availabilityService
                        .getByDate(date)
        );
    }


    // ==========================================
    // GET BY STATUS
    // ==========================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Availability>>
    getByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                availabilityService
                        .getByStatus(status)
        );
    }


    // ==========================================
    // GET EMPLOYEE + DATE
    // ==========================================

    @GetMapping(
            "/employee/{employeeId}/date/{date}"
    )
    public ResponseEntity<List<Availability>>
    getByEmployeeAndDate(
            @PathVariable Long employeeId,
            @PathVariable LocalDate date) {

        return ResponseEntity.ok(
                availabilityService
                        .getByEmployeeAndDate(
                                employeeId,
                                date
                        )
        );
    }


    // ==========================================
    // UPDATE
    // ==========================================

    @PutMapping("/{id}")
    public ResponseEntity<Availability>
    updateAvailability(
            @PathVariable Long id,
            @RequestBody Availability availability) {

        return ResponseEntity.ok(
                availabilityService
                        .updateAvailability(
                                id,
                                availability
                        )
        );
    }


    // ==========================================
    // DELETE
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deleteAvailability(
            @PathVariable Long id) {

        availabilityService
                .deleteAvailability(id);

        return ResponseEntity.ok(
                "Availability deleted successfully"
        );
    }
}
