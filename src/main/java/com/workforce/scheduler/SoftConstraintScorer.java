package com.workforce.scheduler;

import com.workforce.entity.Employee;
import com.workforce.entity.Roster;
import com.workforce.entity.Shift;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Soft-constraint scoring for fair shift rotation.
 *
 * IMPORTANT:
 * Hard constraints are NOT implemented here. A shift must first pass
 * HardConstraintValidator. This class only decides which valid shift is
 * preferable.
 */
@Component
public class SoftConstraintScorer {

    // ---------------------------------------------------------
    // FAIRNESS WEIGHTS
    // ---------------------------------------------------------

    // Strongly prefer shifts that the employee has worked less often recently.
    private static final int EMPLOYEE_BALANCE_WEIGHT = 220;

    // Strongly discourage repeatedly assigning the same shift.
    private static final int RECENT_SAME_SHIFT_WEIGHT = 90;

    // Extra penalty for consecutive same-shift streaks.
    private static final int STREAK_WEIGHT = 160;

    // Balance the number of employees across shifts on the current day.
    private static final int DAILY_TEAM_BALANCE_WEIGHT = 180;

    // Balance the number of assignments across shifts in the current month.
    private static final int MONTHLY_BALANCE_WEIGHT = 120;

    // Small reward for avoiding unnecessary daily shift changes.
    private static final int PREVIOUS_DAY_CONTINUITY_BONUS = 35;

    // If a shift is already used heavily by the team today, penalize it.
    private static final int DAILY_LOAD_WEIGHT = 250;

    // Lookback period for individual shift fairness.
    private static final int FAIRNESS_WINDOW_DAYS = 21;

    // Recent period used to discourage long repeated shift runs.
    private static final int RECENT_WINDOW_DAYS = 7;

    public int calculateScore(
            Employee employee,
            Shift candidateShift,
            LocalDate date,
            List<Roster> existingRosters,
            List<Shift> allShifts,
            List<Employee> allEmployees) {

        if (employee == null
                || candidateShift == null
                || candidateShift.getId() == null
                || date == null
                || existingRosters == null
                || allShifts == null
                || allShifts.isEmpty()) {
            return Integer.MIN_VALUE;
        }

        int score = 0;

        // =====================================================
        // 1. EMPLOYEE SHIFT BALANCE
        // =====================================================
        score += calculateEmployeeShiftBalance(
                employee,
                candidateShift,
                date,
                existingRosters,
                allShifts
        );

        // =====================================================
        // 2. RECENT SAME-SHIFT PENALTY
        // =====================================================
        score += calculateRecentSameShiftPenalty(
                employee,
                candidateShift,
                date,
                existingRosters
        );

        // =====================================================
        // 3. CONSECUTIVE SAME-SHIFT STREAK
        // =====================================================
        score += calculateSameShiftStreakPenalty(
                employee,
                candidateShift,
                date,
                existingRosters
        );

        // =====================================================
        // 4. DAILY TEAM BALANCE
        // =====================================================
        score += calculateDailyTeamBalance(
                candidateShift,
                date,
                existingRosters,
                allShifts,
                allEmployees
        );

        // =====================================================
        // 5. MONTHLY SHIFT BALANCE
        // =====================================================
        score += calculateMonthlyBalance(
                candidateShift,
                date,
                existingRosters,
                allShifts
        );

        // =====================================================
        // 6. DAILY LOAD
        // =====================================================
        long dailyCount = countShiftAssignmentsForDate(
                candidateShift,
                date,
                existingRosters
        );

        score -= (int) dailyCount * DAILY_LOAD_WEIGHT;

        // =====================================================
        // 7. PREVIOUS DAY CONTINUITY
        // =====================================================
        Roster previousRoster = findRoster(
                employee,
                date.minusDays(1),
                existingRosters
        );

        if (previousRoster != null
                && previousRoster.getShift() != null
                && sameShift(previousRoster.getShift(), candidateShift)) {
            score += PREVIOUS_DAY_CONTINUITY_BONUS;
        }

        return score;
    }

    // =========================================================
    // EMPLOYEE SHIFT BALANCE
    // =========================================================

    private int calculateEmployeeShiftBalance(
            Employee employee,
            Shift candidateShift,
            LocalDate date,
            List<Roster> existingRosters,
            List<Shift> allShifts) {

        LocalDate windowStart = date.minusDays(FAIRNESS_WINDOW_DAYS);

        Map<Long, Long> counts = existingRosters.stream()
                .filter(r -> isEmployeeRoster(employee, r))
                .filter(r -> isAssigned(r))
                .filter(r -> r.getRosterDate() != null)
                .filter(r -> !r.getRosterDate().isBefore(windowStart))
                .filter(r -> r.getRosterDate().isBefore(date))
                .filter(r -> r.getShift() != null && r.getShift().getId() != null)
                .collect(Collectors.groupingBy(
                        r -> r.getShift().getId(),
                        Collectors.counting()
                ));

        long candidateCount = counts.getOrDefault(candidateShift.getId(), 0L);

        long minimumCount = allShifts.stream()
                .filter(s -> s != null && s.getId() != null)
                .mapToLong(s -> counts.getOrDefault(s.getId(), 0L))
                .min()
                .orElse(0L);

        long difference = candidateCount - minimumCount;

        return -(int) difference * EMPLOYEE_BALANCE_WEIGHT;
    }

    // =========================================================
    // RECENT SAME SHIFT
    // =========================================================

    private int calculateRecentSameShiftPenalty(
            Employee employee,
            Shift candidateShift,
            LocalDate date,
            List<Roster> existingRosters) {

        LocalDate start = date.minusDays(RECENT_WINDOW_DAYS);

        long count = existingRosters.stream()
                .filter(r -> isEmployeeRoster(employee, r))
                .filter(r -> isAssigned(r))
                .filter(r -> r.getRosterDate() != null)
                .filter(r -> !r.getRosterDate().isBefore(start))
                .filter(r -> r.getRosterDate().isBefore(date))
                .filter(r -> r.getShift() != null)
                .filter(r -> sameShift(r.getShift(), candidateShift))
                .count();

        return -(int) count * RECENT_SAME_SHIFT_WEIGHT;
    }

    // =========================================================
    // SAME SHIFT STREAK
    // =========================================================

    private int calculateSameShiftStreakPenalty(
            Employee employee,
            Shift candidateShift,
            LocalDate date,
            List<Roster> existingRosters) {

        int streak = 0;
        LocalDate currentDate = date.minusDays(1);

        while (streak < 7) {
            Roster roster = findRoster(employee, currentDate, existingRosters);

            if (roster == null
                    || roster.getShift() == null
                    || !sameShift(roster.getShift(), candidateShift)) {
                break;
            }

            streak++;
            currentDate = currentDate.minusDays(1);
        }

        if (streak == 0) {
            return 0;
        }

        return -streak * STREAK_WEIGHT;
    }

    // =========================================================
    // DAILY TEAM BALANCE
    // =========================================================

    private int calculateDailyTeamBalance(
            Shift candidateShift,
            LocalDate date,
            List<Roster> existingRosters,
            List<Shift> allShifts,
            List<Employee> allEmployees) {

        if (allShifts == null || allShifts.isEmpty()) {
            return 0;
        }

        long activeEmployees = allEmployees == null
                ? 0
                : allEmployees.stream()
                .filter(e -> e != null)
                .filter(e -> "ACTIVE".equalsIgnoreCase(e.getStatus()))
                .count();

        if (activeEmployees == 0) {
            return 0;
        }

        // Expected daily share. This is deliberately used as a soft target;
        // hard restrictions can legitimately make a shift smaller.
        double target = (double) activeEmployees / allShifts.size();

        long currentCount = countUniqueEmployeesOnShiftForDate(
                candidateShift,
                date,
                existingRosters
        );

        double deviation = currentCount - target;

        return (int) Math.round(-deviation * DAILY_TEAM_BALANCE_WEIGHT);
    }

    // =========================================================
    // MONTHLY BALANCE
    // =========================================================

    private int calculateMonthlyBalance(
            Shift candidateShift,
            LocalDate date,
            List<Roster> existingRosters,
            List<Shift> allShifts) {

        LocalDate monthStart = date.withDayOfMonth(1);

        Map<Long, Long> counts = existingRosters.stream()
                .filter(r -> isAssigned(r))
                .filter(r -> r.getRosterDate() != null)
                .filter(r -> !r.getRosterDate().isBefore(monthStart))
                .filter(r -> r.getRosterDate().isBefore(date))
                .filter(r -> r.getShift() != null && r.getShift().getId() != null)
                .collect(Collectors.groupingBy(
                        r -> r.getShift().getId(),
                        Collectors.counting()
                ));

        long candidateCount = counts.getOrDefault(candidateShift.getId(), 0L);

        long minimumCount = allShifts.stream()
                .filter(s -> s != null && s.getId() != null)
                .mapToLong(s -> counts.getOrDefault(s.getId(), 0L))
                .min()
                .orElse(0L);

        return -(int) (candidateCount - minimumCount) * MONTHLY_BALANCE_WEIGHT;
    }

    // =========================================================
    // SHIFT COUNT FOR A DAY
    // =========================================================

    private long countShiftAssignmentsForDate(
            Shift shift,
            LocalDate date,
            List<Roster> existingRosters) {

        if (shift == null || shift.getId() == null) {
            return 0;
        }

        return existingRosters.stream()
                .filter(r -> isAssigned(r))
                .filter(r -> r.getRosterDate() != null)
                .filter(r -> date.equals(r.getRosterDate()))
                .filter(r -> r.getShift() != null)
                .filter(r -> sameShift(r.getShift(), shift))
                .count();
    }

    // =========================================================
    // UNIQUE EMPLOYEE COUNT FOR A DAY
    // =========================================================

    private long countUniqueEmployeesOnShiftForDate(
            Shift shift,
            LocalDate date,
            List<Roster> existingRosters) {

        if (shift == null || shift.getId() == null) {
            return 0;
        }

        return existingRosters.stream()
                .filter(r -> isAssigned(r))
                .filter(r -> r.getRosterDate() != null)
                .filter(r -> date.equals(r.getRosterDate()))
                .filter(r -> r.getShift() != null)
                .filter(r -> sameShift(r.getShift(), shift))
                .filter(r -> r.getEmployee() != null && r.getEmployee().getId() != null)
                .map(r -> r.getEmployee().getId())
                .distinct()
                .count();
    }

    // =========================================================
    // FIND EMPLOYEE/DAY ROSTER
    // =========================================================

    private Roster findRoster(
            Employee employee,
            LocalDate date,
            List<Roster> existingRosters) {

        for (Roster roster : existingRosters) {
            if (!isEmployeeRoster(employee, roster)) {
                continue;
            }

            if (!isAssigned(roster) || roster.getRosterDate() == null) {
                continue;
            }

            if (date.equals(roster.getRosterDate())) {
                return roster;
            }
        }

        return null;
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private boolean isAssigned(Roster roster) {
        return roster != null
                && "ASSIGNED".equalsIgnoreCase(roster.getStatus());
    }

    private boolean isEmployeeRoster(Employee employee, Roster roster) {
        return employee != null
                && employee.getId() != null
                && roster != null
                && roster.getEmployee() != null
                && roster.getEmployee().getId() != null
                && employee.getId().equals(roster.getEmployee().getId());
    }

    private boolean sameShift(Shift first, Shift second) {
        return first != null
                && second != null
                && first.getId() != null
                && second.getId() != null
                && first.getId().equals(second.getId());
    }
}
