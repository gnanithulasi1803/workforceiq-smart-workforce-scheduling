package com.workforce.controller;

import com.workforce.entity.ShiftSwap;
import com.workforce.service.ShiftSwapService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/shift-swaps")
public class ShiftSwapController {

    private final ShiftSwapService shiftSwapService;

    public ShiftSwapController(
            ShiftSwapService shiftSwapService) {

        this.shiftSwapService = shiftSwapService;
    }

    // =========================================================
    // CREATE SWAP REQUEST
    // =========================================================

    @PostMapping
    public ResponseEntity<ShiftSwap> createSwapRequest(

            @RequestParam Long requesterId,

            @RequestParam Long targetEmployeeId,

            @RequestParam Long requesterShiftId,

            @RequestParam Long targetShiftId,

            @RequestParam LocalDate swapDate,

            @RequestParam(required = false) String reason) {

        ShiftSwap swap =
                shiftSwapService.createSwapRequest(
                        requesterId,
                        targetEmployeeId,
                        requesterShiftId,
                        targetShiftId,
                        swapDate,
                        reason
                );

        return new ResponseEntity<>(
                swap,
                HttpStatus.CREATED
        );
    }


    // =========================================================
    // GET ALL SWAP REQUESTS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<ShiftSwap>>
    getAllSwapRequests() {

        return ResponseEntity.ok(
                shiftSwapService.getAllSwapRequests()
        );
    }


    // =========================================================
    // GET SWAP BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<ShiftSwap>
    getSwapById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                shiftSwapService.getSwapById(id)
        );
    }


    // =========================================================
    // GET SWAPS BY REQUESTER
    // =========================================================

    @GetMapping("/requester/{employeeId}")
    public ResponseEntity<List<ShiftSwap>>
    getByRequester(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                shiftSwapService.getByRequester(
                        employeeId
                )
        );
    }


    // =========================================================
    // GET PENDING SWAP REQUESTS
    // =========================================================

    @GetMapping("/pending")
    public ResponseEntity<List<ShiftSwap>>
    getPendingRequests() {

        return ResponseEntity.ok(
                shiftSwapService.getPendingRequests()
        );
    }


    // =========================================================
    // MANAGER APPROVE
    // =========================================================

    @PutMapping("/{id}/approve")
    public ResponseEntity<ShiftSwap> approveSwap(

            @PathVariable Long id,

            @RequestParam(required = false)
            String managerComment) {

        ShiftSwap approvedSwap =
                shiftSwapService.approveSwap(
                        id,
                        managerComment
                );

        return ResponseEntity.ok(
                approvedSwap
        );
    }


    // =========================================================
    // MANAGER REJECT
    // =========================================================

    @PutMapping("/{id}/reject")
    public ResponseEntity<ShiftSwap> rejectSwap(

            @PathVariable Long id,

            @RequestParam(required = false)
            String managerComment) {

        ShiftSwap rejectedSwap =
                shiftSwapService.rejectSwap(
                        id,
                        managerComment
                );

        return ResponseEntity.ok(
                rejectedSwap
        );
    }
}
