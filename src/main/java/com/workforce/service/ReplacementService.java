package com.workforce.service;

import com.workforce.dto.ReplacementSuggestion;
import com.workforce.entity.Availability;
import com.workforce.entity.Employee;
import com.workforce.entity.Leave;
import com.workforce.entity.Roster;
import com.workforce.entity.Shift;
import com.workforce.entity.Policy;
import com.workforce.repository.AvailabilityRepository;
import com.workforce.repository.EmployeeRepository;
import com.workforce.repository.LeaveRepository;
import com.workforce.repository.PolicyRepository;
import com.workforce.repository.RosterRepository;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class ReplacementService {

    private final EmployeeRepository employeeRepository;
    private final RosterRepository rosterRepository;
    private final LeaveRepository leaveRepository;
    private final AvailabilityRepository availabilityRepository;
    private final PolicyRepository policyRepository;

    public ReplacementService(
            EmployeeRepository employeeRepository,
            RosterRepository rosterRepository,
            LeaveRepository leaveRepository,
            AvailabilityRepository availabilityRepository,
            PolicyRepository policyRepository) {

        this.employeeRepository = employeeRepository;
        this.rosterRepository = rosterRepository;
        this.leaveRepository = leaveRepository;
        this.availabilityRepository = availabilityRepository;
        this.policyRepository = policyRepository;
    }

    // ============================================================
    // FIND REPLACEMENT SUGGESTIONS
    // ============================================================

    public List<ReplacementSuggestion> findSuggestions(
            Long employeeId,
            LocalDate date) {

        if (employeeId == null) {
            throw new IllegalArgumentException(
                    "Employee ID is required");
        }

        if (date == null) {
            throw new IllegalArgumentException(
                    "Date is required");
        }

        // --------------------------------------------------------
        // FIND ORIGINAL EMPLOYEE
        // --------------------------------------------------------

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found with id: "
                                        + employeeId));

        // --------------------------------------------------------
        // FIND ORIGINAL ROSTER
        // --------------------------------------------------------

        Roster originalRoster =
                rosterRepository.findByEmployeeIdAndRosterDate(
                        employeeId,
                        date
                ).orElseThrow(() ->
                        new RuntimeException(
                                "No roster assignment found for employee "
                                        + employeeId
                                        + " on "
                                        + date));

        if (!"ASSIGNED".equalsIgnoreCase(
                originalRoster.getStatus())) {

            throw new IllegalArgumentException(
                    "Employee does not have an active roster assignment on "
                            + date);
        }

        Shift requiredShift = originalRoster.getShift();

        if (requiredShift == null) {
            throw new RuntimeException(
                    "Original roster does not have a shift");
        }

        // --------------------------------------------------------
        // LOAD POLICY
        // --------------------------------------------------------

        Policy policy = policyRepository.findById(1L)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Policy not found with id: 1"));

        // --------------------------------------------------------
        // FIND ACTIVE EMPLOYEES
        // --------------------------------------------------------

        List<Employee> employees =
                employeeRepository.findAll();

        List<ReplacementSuggestion> suggestions =
                new ArrayList<>();

        for (Employee candidate : employees) {

            if (candidate == null ||
                    candidate.getId() == null) {
                continue;
            }

            // Do not suggest the employee who is taking leave
            if (candidate.getId().equals(employeeId)) {
                continue;
            }

            if (!"ACTIVE".equalsIgnoreCase(
                    candidate.getStatus())) {
                continue;
            }

            String reason =
                    checkEligibility(
                            candidate,
                            requiredShift,
                            date,
                            policy
                    );

            boolean eligible =
                    "All policy checks passed".equals(reason);

            if (eligible) {

                suggestions.add(
                        new ReplacementSuggestion(
                                candidate.getId(),
                                candidate.getEmployeeCode(),
                                candidate.getName(),
                                requiredShift.getShiftName(),
                                true,
                                reason
                        )
                );
            }
        }

        // --------------------------------------------------------
        // SORT SUGGESTIONS
        // --------------------------------------------------------

        suggestions.sort(
                Comparator.comparing(
                        ReplacementSuggestion::getEmployeeCode,
                        Comparator.nullsLast(String::compareTo)
                )
        );

        return suggestions;
    }

    // ============================================================
    // CHECK CANDIDATE ELIGIBILITY
    // ============================================================

    private String checkEligibility(
            Employee candidate,
            Shift requiredShift,
            LocalDate date,
            Policy policy) {

        // --------------------------------------------------------
        // 1. NIGHT SHIFT RESTRICTION
        // --------------------------------------------------------

        if ("Night".equalsIgnoreCase(
                requiredShift.getShiftName())) {

            if (!candidate.isNightShiftAllowed()) {
                return "Night shift is not allowed for this employee";
            }
        }

        // --------------------------------------------------------
// 2. EXISTING ASSIGNED ROSTER ON SAME DATE
// --------------------------------------------------------

        Roster existingRoster =
                rosterRepository
                        .findByEmployeeIdAndRosterDate(
                                candidate.getId(),
                                date)
                        .orElse(null);

// OFF roster is available for replacement.
// Only an ASSIGNED roster should disqualify the employee.
        if (existingRoster != null
                && "ASSIGNED".equalsIgnoreCase(
                existingRoster.getStatus())) {

            return "Employee already has a roster assignment on this date";
        }

        // --------------------------------------------------------
        // 3. LEAVE CHECK
        // --------------------------------------------------------

        List<Leave> leaves =
                leaveRepository
                        .findByStartDateLessThanEqualAndEndDateGreaterThanEqual(
                                date,
                                date
                        );

        for (Leave leave : leaves) {

            if (!candidate.getId()
                    .equals(leave.getEmployeeId())) {
                continue;
            }

            if ("REJECTED".equalsIgnoreCase(
                    leave.getStatus())) {
                continue;
            }

            return "Employee is on leave on this date";
        }

        // --------------------------------------------------------
        // 4. AVAILABILITY CHECK
        // --------------------------------------------------------

        List<Availability> availabilityList =
                availabilityRepository
                        .findByEmployeeIdAndDate(
                                candidate.getId(),
                                date
                        );

        for (Availability availability : availabilityList) {

            if (availability.getAvailabilityStatus() == null) {
                continue;
            }

            String status =
                    availability.getAvailabilityStatus()
                            .trim();

            if ("UNAVAILABLE".equalsIgnoreCase(status)
                    || "NOT_AVAILABLE".equalsIgnoreCase(status)
                    || "NO".equalsIgnoreCase(status)) {

                return "Employee is unavailable on this date";
            }
        }

        // --------------------------------------------------------
        // 5. WEEKLY 48-HOUR LIMIT
        // --------------------------------------------------------

        if (exceedsWeeklyHours(
                candidate,
                date,
                policy)) {

            return "Employee would exceed maximum weekly hours";
        }

        // --------------------------------------------------------
        // 6. MAXIMUM 6 CONSECUTIVE DAYS
        // --------------------------------------------------------

        if (exceedsConsecutiveDays(
                candidate,
                date,
                policy)) {

            return "Employee would exceed maximum consecutive working days";
        }

        // --------------------------------------------------------
        // 7. MINIMUM 12-HOUR REST
        // --------------------------------------------------------

        if (!hasMinimumRest(
                candidate,
                requiredShift,
                date,
                policy)) {

            return "Employee would violate minimum rest hours";
        }

        return "All policy checks passed";
    }

    // ============================================================
    // WEEKLY HOURS CHECK
    // ============================================================

    private boolean exceedsWeeklyHours(
            Employee employee,
            LocalDate date,
            Policy policy) {

        LocalDate weekStart =
                date.with(DayOfWeek.MONDAY);

        LocalDate weekEnd =
                date.with(DayOfWeek.SUNDAY);

        List<Roster> rosters =
                rosterRepository.findByEmployeeId(
                        employee.getId());

        double currentHours = 0;

        for (Roster roster : rosters) {

            if (!"ASSIGNED".equalsIgnoreCase(
                    roster.getStatus())) {
                continue;
            }

            LocalDate rosterDate =
                    roster.getRosterDate();

            if (rosterDate == null) {
                continue;
            }

            if (!rosterDate.isBefore(weekStart)
                    && !rosterDate.isAfter(weekEnd)) {

                if (roster.getShift() != null
                        && roster.getShift().getDuration() != null) {

                    currentHours +=
                            roster.getShift().getDuration();
                }
            }
        }

        double newHours =
                currentHours +
                        getShiftDurationForReplacement(
                                employee,
                                date);

        return newHours > policy.getMaxWeeklyHours();
    }

    private double getShiftDurationForReplacement(
            Employee employee,
            LocalDate date) {

        // All current shifts in your project are 8 hours.
        return 8.0;
    }

    // ============================================================
    // MAX 6 CONSECUTIVE DAYS
    // ============================================================

    private boolean exceedsConsecutiveDays(
            Employee employee,
            LocalDate targetDate,
            Policy policy) {

        int maxDays =
                policy.getMaxConsecutiveDays();

        List<Roster> rosters =
                rosterRepository.findByEmployeeId(
                        employee.getId());

        int before = 0;

        LocalDate date =
                targetDate.minusDays(1);

        while (isAssignedOnDate(rosters, date)) {

            before++;
            date = date.minusDays(1);

            if (before >= maxDays) {
                return true;
            }
        }

        int after = 0;

        date = targetDate.plusDays(1);

        while (isAssignedOnDate(rosters, date)) {

            after++;
            date = date.plusDays(1);

            if (after >= maxDays) {
                return true;
            }
        }

        return before + 1 + after > maxDays;
    }

    private boolean isAssignedOnDate(
            List<Roster> rosters,
            LocalDate date) {

        return rosters.stream()
                .anyMatch(r ->
                        r.getRosterDate() != null
                                && r.getRosterDate().equals(date)
                                && "ASSIGNED".equalsIgnoreCase(
                                r.getStatus()));
    }

    // ============================================================
    // 12-HOUR REST CHECK
    // ============================================================

    private boolean hasMinimumRest(
            Employee employee,
            Shift replacementShift,
            LocalDate targetDate,
            Policy policy) {

        List<Roster> rosters =
                rosterRepository.findByEmployeeId(
                        employee.getId());

        // --------------------------------------------------------
        // PREVIOUS ROSTER
        // --------------------------------------------------------

        Roster previousRoster =
                rosters.stream()
                        .filter(r ->
                                "ASSIGNED".equalsIgnoreCase(
                                        r.getStatus()))
                        .filter(r ->
                                r.getRosterDate() != null)
                        .filter(r ->
                                r.getRosterDate()
                                        .isBefore(targetDate))
                        .max(Comparator.comparing(
                                Roster::getRosterDate))
                        .orElse(null);

        if (previousRoster != null) {

            LocalDateTime previousEnd =
                    getShiftEndDateTime(
                            previousRoster);

            LocalDateTime replacementStart =
                    getShiftStartDateTime(
                            targetDate,
                            replacementShift);

            long restHours =
                    Duration.between(
                                    previousEnd,
                                    replacementStart)
                            .toHours();

            if (restHours <
                    policy.getMinRestHours()) {

                return false;
            }
        }

        // --------------------------------------------------------
        // NEXT ROSTER
        // --------------------------------------------------------

        Roster nextRoster =
                rosters.stream()
                        .filter(r ->
                                "ASSIGNED".equalsIgnoreCase(
                                        r.getStatus()))
                        .filter(r ->
                                r.getRosterDate() != null)
                        .filter(r ->
                                r.getRosterDate()
                                        .isAfter(targetDate))
                        .min(Comparator.comparing(
                                Roster::getRosterDate))
                        .orElse(null);

        if (nextRoster != null) {

            LocalDateTime replacementEnd =
                    getShiftEndDateTime(
                            targetDate,
                            replacementShift);

            LocalDateTime nextStart =
                    getShiftStartDateTime(
                            nextRoster);

            long restHours =
                    Duration.between(
                                    replacementEnd,
                                    nextStart)
                            .toHours();

            if (restHours <
                    policy.getMinRestHours()) {

                return false;
            }
        }

        return true;
    }

    // ============================================================
    // SHIFT TIME HELPERS
    // ============================================================

    private LocalDateTime getShiftStartDateTime(
            Roster roster) {

        return getShiftStartDateTime(
                roster.getRosterDate(),
                roster.getShift());
    }

    private LocalDateTime getShiftStartDateTime(
            LocalDate date,
            Shift shift) {

        return LocalDateTime.of(
                date,
                shift.getStartTime());
    }

    private LocalDateTime getShiftEndDateTime(
            Roster roster) {

        return getShiftEndDateTime(
                roster.getRosterDate(),
                roster.getShift());
    }

    private LocalDateTime getShiftEndDateTime(
            LocalDate date,
            Shift shift) {

        LocalTime start =
                shift.getStartTime();

        LocalTime end =
                shift.getEndTime();

        LocalDate endDate = date;

        // Night shift crosses midnight
        if (end.isBefore(start)) {
            endDate = date.plusDays(1);
        }

        return LocalDateTime.of(
                endDate,
                end);
    }

    // ============================================================
    // REPLACE ROSTER
    // ============================================================

    @Transactional
    public Roster replaceRoster(
            Long employeeId,
            Long replacementEmployeeId,
            LocalDate date) {

        Roster originalRoster =
                rosterRepository
                        .findByEmployeeIdAndRosterDate(
                                employeeId,
                                date)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Original roster not found"));

        Employee replacement =
                employeeRepository
                        .findById(replacementEmployeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Replacement employee not found"));

        String eligibility =
                checkEligibility(
                        replacement,
                        originalRoster.getShift(),
                        date,
                        policyRepository.findById(1L)
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Policy not found"))
                );

        if (!"All policy checks passed"
                .equals(eligibility)) {

            throw new IllegalArgumentException(
                    "Replacement employee is not eligible: "
                            + eligibility);
        }
        // Remove the replacement employee's existing OFF roster
// for this date to avoid duplicate roster entries.
        Roster replacementRoster =
                rosterRepository
                        .findByEmployeeIdAndRosterDate(
                                replacementEmployeeId,
                                date)
                        .orElse(null);

        if (replacementRoster != null
                && replacementRoster.getId() != originalRoster.getId()
                && "OFF".equalsIgnoreCase(replacementRoster.getStatus())) {

            rosterRepository.delete(replacementRoster);
            rosterRepository.flush();
        }

// Assign the replacement employee to the original roster
        originalRoster.setEmployee(replacement);

        originalRoster.setNotes(
                "Replacement assigned for employee "
                        + employeeId
                        + " due to leave"
        );

        return rosterRepository.save(originalRoster);

    }
}