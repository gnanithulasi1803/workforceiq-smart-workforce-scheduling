package com.workforce.service;

import com.workforce.entity.Leave;
import com.workforce.repository.LeaveRepository;
import com.workforce.scheduler.LeaveConflictDetector;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final LeaveConflictDetector leaveConflictDetector;

    public LeaveService(
            LeaveRepository leaveRepository,
            LeaveConflictDetector leaveConflictDetector) {

        this.leaveRepository = leaveRepository;
        this.leaveConflictDetector = leaveConflictDetector;
    }


    // ==========================================
    // APPLY LEAVE
    // ==========================================

    public Leave applyLeave(
            Long employeeId,
            LocalDate startDate,
            LocalDate endDate,
            String leaveType,
            String reason) {

        // ------------------------------------------
        // VALIDATE EMPLOYEE
        // ------------------------------------------

        if (employeeId == null) {
            throw new IllegalArgumentException(
                    "Employee ID is required"
            );
        }


        // ------------------------------------------
        // VALIDATE DATES
        // ------------------------------------------

        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }


        // ------------------------------------------
        // VALIDATE LEAVE TYPE
        // ------------------------------------------

        if (leaveType == null || leaveType.isBlank()) {
            throw new IllegalArgumentException(
                    "Leave type is required"
            );
        }


        // ------------------------------------------
        // CHECK EXISTING LEAVE OVERLAP
        // ------------------------------------------

        List<Leave> existingLeaves =
                leaveRepository.findByEmployeeId(employeeId);

        for (Leave existingLeave : existingLeaves) {

            // Ignore rejected leaves
            if ("REJECTED".equalsIgnoreCase(
                    existingLeave.getStatus())) {
                continue;
            }

            LocalDate existingStart =
                    existingLeave.getStartDate();

            LocalDate existingEnd =
                    existingLeave.getEndDate();

            if (existingStart == null ||
                    existingEnd == null) {
                continue;
            }

            boolean overlapping =
                    !startDate.isAfter(existingEnd)
                            &&
                            !endDate.isBefore(existingStart);

            if (overlapping) {
                throw new IllegalArgumentException(
                        "Employee already has leave during the requested period."
                );
            }
        }


        // ------------------------------------------
        // CREATE LEAVE OBJECT
        // ------------------------------------------

        Leave leave = new Leave();

        leave.setEmployeeId(employeeId);
        leave.setLeaveType(leaveType);
        leave.setStartDate(startDate);
        leave.setEndDate(endDate);
        leave.setReason(reason);

        // New leave starts as PENDING
        leave.setStatus("PENDING");


        // ------------------------------------------
        // CHECK ROSTER CONFLICT
        // ------------------------------------------

        boolean conflict =
                leaveConflictDetector.hasConflict(leave);

        if (conflict) {

            throw new IllegalArgumentException(
                    "Leave conflict detected. Employee "
                            + employeeId
                            + " already has roster assignment "
                            + "during the requested leave period."
            );
        }


        // ------------------------------------------
        // SAVE LEAVE
        // ------------------------------------------

        return leaveRepository.save(leave);
    }


    // ==========================================
    // CREATE LEAVE
    // ==========================================

    public Leave createLeave(Leave leave) {

        if (leave == null) {
            throw new IllegalArgumentException(
                    "Leave data is required"
            );
        }

        if (leave.getEmployeeId() == null) {
            throw new IllegalArgumentException(
                    "Employee ID is required"
            );
        }

        if (leave.getStartDate() == null ||
                leave.getEndDate() == null) {

            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (leave.getEndDate()
                .isBefore(leave.getStartDate())) {

            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }

        if (leave.getLeaveType() == null ||
                leave.getLeaveType().isBlank()) {

            throw new IllegalArgumentException(
                    "Leave type is required"
            );
        }


        // ------------------------------------------
        // CHECK EXISTING LEAVE OVERLAP
        // ------------------------------------------

        List<Leave> existingLeaves =
                leaveRepository.findByEmployeeId(
                        leave.getEmployeeId()
                );

        for (Leave existingLeave : existingLeaves) {

            if (existingLeave.getId() != null &&
                    existingLeave.getId()
                            .equals(leave.getId())) {
                continue;
            }

            if ("REJECTED".equalsIgnoreCase(
                    existingLeave.getStatus())) {
                continue;
            }

            if (existingLeave.getStartDate() == null ||
                    existingLeave.getEndDate() == null) {
                continue;
            }

            boolean overlapping =
                    !leave.getStartDate()
                            .isAfter(existingLeave.getEndDate())
                            &&
                            !leave.getEndDate()
                                    .isBefore(existingLeave.getStartDate());

            if (overlapping) {
                throw new IllegalArgumentException(
                        "Employee already has leave during the requested period."
                );
            }
        }


        // ------------------------------------------
        // CHECK ROSTER CONFLICT
        // ------------------------------------------

        boolean conflict =
                leaveConflictDetector.hasConflict(leave);

        if (conflict) {

            throw new IllegalArgumentException(
                    "Leave conflict detected. Employee "
                            + leave.getEmployeeId()
                            + " already has roster assignment "
                            + "during the requested leave period."
            );
        }


        // ------------------------------------------
        // DEFAULT STATUS
        // ------------------------------------------

        if (leave.getStatus() == null ||
                leave.getStatus().isBlank()) {

            leave.setStatus("PENDING");
        }


        return leaveRepository.save(leave);
    }


    // ==========================================
    // GET ALL LEAVES
    // ==========================================

    public List<Leave> getAllLeaves() {

        return leaveRepository.findAll();
    }


    // ==========================================
    // GET LEAVE BY ID
    // ==========================================

    public Leave getLeaveById(Long id) {

        return leaveRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Leave not found with id: " + id
                        )
                );
    }


    // ==========================================
    // GET LEAVES BY EMPLOYEE
    // ==========================================

    public List<Leave> getEmployeeLeaves(
            Long employeeId) {

        if (employeeId == null) {
            throw new IllegalArgumentException(
                    "Employee ID is required"
            );
        }

        return leaveRepository
                .findByEmployeeId(employeeId);
    }


    // ==========================================
    // BACKWARD COMPATIBILITY
    // ==========================================

    public List<Leave> getLeavesByEmployee(
            Long employeeId) {

        return getEmployeeLeaves(employeeId);
    }


    // ==========================================
    // UPDATE LEAVE
    // ==========================================

    public Leave updateLeave(
            Long id,
            Leave updatedLeave) {

        if (updatedLeave == null) {
            throw new IllegalArgumentException(
                    "Leave data is required"
            );
        }

        Leave existingLeave =
                getLeaveById(id);


        if (updatedLeave.getEmployeeId() != null) {

            existingLeave.setEmployeeId(
                    updatedLeave.getEmployeeId()
            );
        }

        if (updatedLeave.getLeaveType() != null &&
                !updatedLeave.getLeaveType().isBlank()) {

            existingLeave.setLeaveType(
                    updatedLeave.getLeaveType()
            );
        }

        if (updatedLeave.getStartDate() != null) {

            existingLeave.setStartDate(
                    updatedLeave.getStartDate()
            );
        }

        if (updatedLeave.getEndDate() != null) {

            existingLeave.setEndDate(
                    updatedLeave.getEndDate()
            );
        }

        if (updatedLeave.getReason() != null) {

            existingLeave.setReason(
                    updatedLeave.getReason()
            );
        }

        if (updatedLeave.getStatus() != null) {

            existingLeave.setStatus(
                    updatedLeave.getStatus()
            );
        }


        // ------------------------------------------
        // VALIDATE UPDATED DATES
        // ------------------------------------------

        if (existingLeave.getStartDate() == null ||
                existingLeave.getEndDate() == null) {

            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (existingLeave.getEndDate()
                .isBefore(existingLeave.getStartDate())) {

            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }


        return leaveRepository.save(existingLeave);
    }


    // ==========================================
    // APPROVE LEAVE
    // ==========================================

    public Leave approveLeave(Long id) {

        Leave leave =
                getLeaveById(id);

        leave.setStatus("APPROVED");

        return leaveRepository.save(leave);
    }


    // ==========================================
    // REJECT LEAVE
    // ==========================================

    public Leave rejectLeave(Long id) {

        Leave leave =
                getLeaveById(id);

        leave.setStatus("REJECTED");

        return leaveRepository.save(leave);
    }


    // ==========================================
    // DELETE LEAVE
    // ==========================================

    public void deleteLeave(Long id) {

        Leave leave =
                getLeaveById(id);

        leaveRepository.delete(leave);
    }
}