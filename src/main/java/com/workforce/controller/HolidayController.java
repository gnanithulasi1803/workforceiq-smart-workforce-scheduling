package com.workforce.controller;

import com.workforce.entity.Holiday;
import com.workforce.service.HolidayService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/holidays")
public class HolidayController {

    private final HolidayService holidayService;

    public HolidayController(
            HolidayService holidayService) {

        this.holidayService = holidayService;
    }


    // ==========================================
    // CREATE
    // ==========================================

    @PostMapping
    public ResponseEntity<Holiday> createHoliday(
            @RequestBody Holiday holiday) {

        return new ResponseEntity<>(
                holidayService.createHoliday(holiday),
                HttpStatus.CREATED
        );
    }


    // ==========================================
    // GET ALL
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Holiday>>
    getAllHolidays() {

        return ResponseEntity.ok(
                holidayService.getAllHolidays()
        );
    }


    // ==========================================
    // GET BY ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<Holiday>
    getHolidayById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                holidayService.getHolidayById(id)
        );
    }


    // ==========================================
    // GET BY DATE
    // ==========================================

    @GetMapping("/date/{date}")
    public ResponseEntity<Holiday>
    getHolidayByDate(
            @PathVariable LocalDate date) {

        return ResponseEntity.ok(
                holidayService.getHolidayByDate(date)
        );
    }


    // ==========================================
    // GET OPTIONAL / MANDATORY
    // ==========================================

    @GetMapping("/optional/{optional}")
    public ResponseEntity<List<Holiday>>
    getHolidaysByOptional(
            @PathVariable boolean optional) {

        return ResponseEntity.ok(
                holidayService
                        .getHolidaysByOptional(optional)
        );
    }


    // ==========================================
    // GET BY DATE RANGE
    // ==========================================

    @GetMapping("/between")
    public ResponseEntity<List<Holiday>>
    getHolidaysBetween(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {

        return ResponseEntity.ok(
                holidayService
                        .getHolidaysBetween(
                                startDate,
                                endDate
                        )
        );
    }


    // ==========================================
    // UPDATE
    // ==========================================

    @PutMapping("/{id}")
    public ResponseEntity<Holiday>
    updateHoliday(
            @PathVariable Long id,
            @RequestBody Holiday holiday) {

        return ResponseEntity.ok(
                holidayService.updateHoliday(
                        id,
                        holiday
                )
        );
    }


    // ==========================================
    // DELETE
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deleteHoliday(
            @PathVariable Long id) {

        holidayService.deleteHoliday(id);

        return ResponseEntity.ok(
                "Holiday deleted successfully"
        );
    }
}