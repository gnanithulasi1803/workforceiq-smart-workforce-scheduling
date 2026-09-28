package com.workforce.scheduler;

import com.workforce.entity.Leave;
import com.workforce.entity.Roster;
import com.workforce.repository.RosterRepository;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class LeaveConflictDetector {

    private final RosterRepository rosterRepository;

    public LeaveConflictDetector(
            RosterRepository rosterRepository) {

        this.rosterRepository = rosterRepository;
    }

    // ==========================================
    // CHECK LEAVE CONFLICT
    // ==========================================

    public boolean hasConflict(Leave leave) {

        List<Roster> rosters =
                rosterRepository.findAll();

        for (Roster roster : rosters) {

            if (roster.getEmployee() == null) {
                continue;
            }

            if (!roster.getEmployee()
                    .getId()
                    .equals(leave.getEmployeeId())) {
                continue;
            }

            if (roster.getRosterDate() == null) {
                continue;
            }

            // Check whether roster date
            // falls inside leave period

            LocalDate rosterDate =
                    roster.getRosterDate();

            if (!rosterDate.isBefore(
                    leave.getStartDate())
                    &&
                    !rosterDate.isAfter(
                            leave.getEndDate())) {

                if ("ASSIGNED".equalsIgnoreCase(
                        roster.getStatus())) {

                    return true;
                }
            }
        }

        return false;
    }

    // ==========================================
    // GET CONFLICTING ROSTERS
    // ==========================================

    public List<Roster> getConflictingRosters(
            Leave leave) {

        List<Roster> rosters =
                rosterRepository.findAll();

        return rosters.stream()
                .filter(roster ->
                        roster.getEmployee() != null
                )
                .filter(roster ->
                        roster.getEmployee()
                                .getId()
                                .equals(
                                        leave.getEmployeeId()
                                )
                )
                .filter(roster ->
                        roster.getRosterDate() != null
                )
                .filter(roster ->
                        !roster.getRosterDate()
                                .isBefore(
                                        leave.getStartDate()
                                )
                                &&
                                !roster.getRosterDate()
                                        .isAfter(
                                                leave.getEndDate()
                                        )
                )
                .filter(roster ->
                        "ASSIGNED".equalsIgnoreCase(
                                roster.getStatus()
                        )
                )
                .toList();
    }
}