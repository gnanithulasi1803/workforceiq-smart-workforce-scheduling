package com.workforce.controller;

import com.workforce.entity.Leave;
import com.workforce.service.LeaveService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }


    // ==========================================
    // APPLY LEAVE
    // ==========================================

    @PostMapping
    public ResponseEntity<Leave> applyLeave(
            @RequestParam Long employeeId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @RequestParam String leaveType,
            @RequestParam(required = false) String reason) {

        Leave leave =
                leaveService.applyLeave(
                        employeeId,
                        startDate,
                        endDate,
                        leaveType,
                        reason
                );

        return ResponseEntity.ok(leave);
    }


    // ==========================================
    // GET ALL LEAVES
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Leave>> getAllLeaves() {

        return ResponseEntity.ok(
                leaveService.getAllLeaves()
        );
    }


    // ==========================================
    // GET LEAVE BY ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<Leave> getLeaveById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                leaveService.getLeaveById(id)
        );
    }


    // ==========================================
    // GET LEAVES BY EMPLOYEE
    // ==========================================

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Leave>> getEmployeeLeaves(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                leaveService.getEmployeeLeaves(employeeId)
        );
    }


    // ==========================================
    // APPROVE LEAVE
    // ==========================================

    @PutMapping("/{id}/approve")
    public ResponseEntity<Leave> approveLeave(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                leaveService.approveLeave(id)
        );
    }


    // ==========================================
    // REJECT LEAVE
    // ==========================================

    @PutMapping("/{id}/reject")
    public ResponseEntity<Leave> rejectLeave(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                leaveService.rejectLeave(id)
        );
    }


    // ==========================================
    // DELETE LEAVE
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteLeave(
            @PathVariable Long id) {

        leaveService.deleteLeave(id);

        return ResponseEntity.ok(
                "Leave deleted successfully"
        );
    }
}