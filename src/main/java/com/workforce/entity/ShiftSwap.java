package com.workforce.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "shift_swaps")
public class ShiftSwap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Employee requesting the swap
    @ManyToOne
    @JoinColumn(name = "requester_id", nullable = false)
    private Employee requester;

    // Employee who will take the shift
    @ManyToOne
    @JoinColumn(name = "target_employee_id", nullable = false)
    private Employee targetEmployee;

    // Date of the shift being swapped
    @Column(nullable = false)
    private LocalDate swapDate;

    // Requester's current shift
    @ManyToOne
    @JoinColumn(name = "requester_shift_id", nullable = false)
    private Shift requesterShift;

    // Target employee's current shift
    @ManyToOne
    @JoinColumn(name = "target_shift_id", nullable = false)
    private Shift targetShift;

    // PENDING, APPROVED, REJECTED
    @Column(nullable = false)
    private String status;

    private String reason;

    private String managerComment;

    private LocalDateTime approvedAt;

    public ShiftSwap() {
    }

    public ShiftSwap(
            Employee requester,
            Employee targetEmployee,
            LocalDate swapDate,
            Shift requesterShift,
            Shift targetShift,
            String status,
            String reason) {

        this.requester = requester;
        this.targetEmployee = targetEmployee;
        this.swapDate = swapDate;
        this.requesterShift = requesterShift;
        this.targetShift = targetShift;
        this.status = status;
        this.reason = reason;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Employee getRequester() {
        return requester;
    }

    public void setRequester(Employee requester) {
        this.requester = requester;
    }

    public Employee getTargetEmployee() {
        return targetEmployee;
    }

    public void setTargetEmployee(Employee targetEmployee) {
        this.targetEmployee = targetEmployee;
    }

    public LocalDate getSwapDate() {
        return swapDate;
    }

    public void setSwapDate(LocalDate swapDate) {
        this.swapDate = swapDate;
    }

    public Shift getRequesterShift() {
        return requesterShift;
    }

    public void setRequesterShift(Shift requesterShift) {
        this.requesterShift = requesterShift;
    }

    public Shift getTargetShift() {
        return targetShift;
    }

    public void setTargetShift(Shift targetShift) {
        this.targetShift = targetShift;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getManagerComment() {
        return managerComment;
    }

    public void setManagerComment(String managerComment) {
        this.managerComment = managerComment;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }
}