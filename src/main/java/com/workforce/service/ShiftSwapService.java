package com.workforce.service;

import com.workforce.entity.Employee;
import com.workforce.entity.Roster;
import com.workforce.entity.Shift;
import com.workforce.entity.ShiftSwap;

import com.workforce.repository.EmployeeRepository;
import com.workforce.repository.RosterRepository;
import com.workforce.repository.ShiftRepository;
import com.workforce.repository.ShiftSwapRepository;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ShiftSwapService {

    private final ShiftSwapRepository shiftSwapRepository;
    private final EmployeeRepository employeeRepository;
    private final ShiftRepository shiftRepository;
    private final RosterRepository rosterRepository;

    public ShiftSwapService(
            ShiftSwapRepository shiftSwapRepository,
            EmployeeRepository employeeRepository,
            ShiftRepository shiftRepository,
            RosterRepository rosterRepository) {

        this.shiftSwapRepository = shiftSwapRepository;
        this.employeeRepository = employeeRepository;
        this.shiftRepository = shiftRepository;
        this.rosterRepository = rosterRepository;
    }


    // =========================================================
    // CREATE SHIFT SWAP REQUEST
    // =========================================================

    public ShiftSwap createSwapRequest(
            Long requesterId,
            Long targetEmployeeId,
            Long requesterShiftId,
            Long targetShiftId,
            LocalDate swapDate,
            String reason) {

        // Find requester
        Employee requester = employeeRepository
                .findById(requesterId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Requester employee not found with id: "
                                        + requesterId
                        )
                );

        // Find target employee
        Employee targetEmployee = employeeRepository
                .findById(targetEmployeeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Target employee not found with id: "
                                        + targetEmployeeId
                        )
                );

        // Find requester shift
        Shift requesterShift = shiftRepository
                .findById(requesterShiftId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Requester shift not found with id: "
                                        + requesterShiftId
                        )
                );

        // Find target shift
        Shift targetShift = shiftRepository
                .findById(targetShiftId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Target shift not found with id: "
                                        + targetShiftId
                        )
                );

        // Requester and target cannot be same
        if (requesterId.equals(targetEmployeeId)) {

            throw new RuntimeException(
                    "Requester and target employee cannot be the same"
            );
        }

        // Check requester roster
        boolean requesterHasRoster =
                hasRosterForShift(
                        requesterId,
                        swapDate,
                        requesterShiftId
                );

        if (!requesterHasRoster) {

            throw new RuntimeException(
                    "Requester does not have the specified shift on "
                            + swapDate
            );
        }

        // Check target employee roster
        boolean targetHasRoster =
                hasRosterForShift(
                        targetEmployeeId,
                        swapDate,
                        targetShiftId
                );

        if (!targetHasRoster) {

            throw new RuntimeException(
                    "Target employee does not have the specified shift on "
                            + swapDate
            );
        }

        // Create swap request
        ShiftSwap shiftSwap = new ShiftSwap();

        shiftSwap.setRequester(requester);
        shiftSwap.setTargetEmployee(targetEmployee);
        shiftSwap.setSwapDate(swapDate);
        shiftSwap.setRequesterShift(requesterShift);
        shiftSwap.setTargetShift(targetShift);
        shiftSwap.setStatus("PENDING");
        shiftSwap.setReason(reason);

        return shiftSwapRepository.save(shiftSwap);
    }


    // =========================================================
    // GET ALL SWAP REQUESTS
    // =========================================================

    public List<ShiftSwap> getAllSwapRequests() {

        return shiftSwapRepository.findAll();
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    public ShiftSwap getSwapById(Long id) {

        return shiftSwapRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Shift swap not found with id: " + id
                        )
                );
    }


    // =========================================================
    // GET BY REQUESTER
    // =========================================================

    public List<ShiftSwap> getByRequester(
            Long employeeId) {

        return shiftSwapRepository
                .findByRequesterId(employeeId);
    }


    // =========================================================
    // GET PENDING REQUESTS
    // =========================================================

    public List<ShiftSwap> getPendingRequests() {

        return shiftSwapRepository
                .findByStatus("PENDING");
    }


    // =========================================================
    // MANAGER APPROVE SWAP
    // =========================================================

    @Transactional
    public ShiftSwap approveSwap(
            Long id,
            String managerComment) {

        // Find swap request
        ShiftSwap swap = shiftSwapRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Shift swap not found with id: " + id
                        )
                );

        // Only PENDING requests can be approved
        if (!"PENDING".equalsIgnoreCase(
                swap.getStatus())) {

            throw new RuntimeException(
                    "Only PENDING shift swaps can be approved"
            );
        }

        // Get requester
        Employee requester =
                swap.getRequester();

        // Get target employee
        Employee targetEmployee =
                swap.getTargetEmployee();

        // Get swap date
        LocalDate swapDate =
                swap.getSwapDate();

        // Find requester's roster
        Roster requesterRoster =
                findRoster(
                        requester.getId(),
                        swapDate
                );

        // Find target employee's roster
        Roster targetRoster =
                findRoster(
                        targetEmployee.getId(),
                        swapDate
                );

        // Make sure both rosters exist
        if (requesterRoster == null) {

            throw new RuntimeException(
                    "Requester roster not found for "
                            + swapDate
            );
        }

        if (targetRoster == null) {

            throw new RuntimeException(
                    "Target employee roster not found for "
                            + swapDate
            );
        }

        // Store original shifts
        Shift requesterShift =
                requesterRoster.getShift();

        Shift targetShift =
                targetRoster.getShift();

        // =====================================================
        // SWAP SHIFTS
        // =====================================================

        requesterRoster.setShift(targetShift);

        targetRoster.setShift(requesterShift);

        // Save updated rosters
        rosterRepository.save(requesterRoster);

        rosterRepository.save(targetRoster);

        // =====================================================
        // UPDATE SWAP REQUEST
        // =====================================================

        swap.setStatus("APPROVED");

        swap.setManagerComment(
                managerComment
        );

        swap.setApprovedAt(
                LocalDateTime.now()
        );

        return shiftSwapRepository.save(swap);
    }


    // =========================================================
    // MANAGER REJECT SWAP
    // =========================================================

    @Transactional
    public ShiftSwap rejectSwap(
            Long id,
            String managerComment) {

        // Find swap request
        ShiftSwap swap = shiftSwapRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Shift swap not found with id: " + id
                        )
                );

        // Only PENDING requests can be rejected
        if (!"PENDING".equalsIgnoreCase(
                swap.getStatus())) {

            throw new RuntimeException(
                    "Only PENDING shift swaps can be rejected"
            );
        }

        // Change status
        swap.setStatus("REJECTED");

        // Store manager comment
        swap.setManagerComment(
                managerComment
        );

        // Store approval/review time
        swap.setApprovedAt(
                LocalDateTime.now()
        );

        // IMPORTANT:
        // Do NOT modify roster when rejected

        return shiftSwapRepository.save(swap);
    }


    // =========================================================
    // FIND ROSTER
    // =========================================================

    private Roster findRoster(
            Long employeeId,
            LocalDate date) {

        List<Roster> rosters =
                rosterRepository.findAll();

        for (Roster roster : rosters) {

            if (roster.getEmployee() == null) {
                continue;
            }

            if (roster.getEmployee().getId() == null) {
                continue;
            }

            if (!employeeId.equals(
                    roster.getEmployee().getId())) {

                continue;
            }

            if (roster.getRosterDate() == null) {
                continue;
            }

            if (!date.equals(
                    roster.getRosterDate())) {

                continue;
            }

            if (!"ASSIGNED".equalsIgnoreCase(
                    roster.getStatus())) {

                continue;
            }

            return roster;
        }

        return null;
    }


    // =========================================================
    // CHECK ROSTER HAS SPECIFIC SHIFT
    // =========================================================

    private boolean hasRosterForShift(
            Long employeeId,
            LocalDate date,
            Long shiftId) {

        List<Roster> rosters =
                rosterRepository.findAll();

        for (Roster roster : rosters) {

            if (roster.getEmployee() == null) {
                continue;
            }

            if (roster.getShift() == null) {
                continue;
            }

            if (roster.getEmployee().getId() == null) {
                continue;
            }

            if (roster.getShift().getId() == null) {
                continue;
            }

            if (!employeeId.equals(
                    roster.getEmployee().getId())) {

                continue;
            }

            if (!shiftId.equals(
                    roster.getShift().getId())) {

                continue;
            }

            if (!date.equals(
                    roster.getRosterDate())) {

                continue;
            }

            if ("ASSIGNED".equalsIgnoreCase(
                    roster.getStatus())) {

                return true;
            }
        }

        return false;
    }
}