package com.workforce.scheduler;

import com.workforce.entity.Employee;
import com.workforce.entity.Policy;
import com.workforce.entity.Roster;
import com.workforce.entity.Shift;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class RosterOptimizer {

    private static final Logger log = LoggerFactory.getLogger(RosterOptimizer.class);

    private final HardConstraintValidator hardConstraintValidator;
    private final SoftConstraintScorer softConstraintScorer;

    public RosterOptimizer(
            HardConstraintValidator hardConstraintValidator,
            SoftConstraintScorer softConstraintScorer) {
        this.hardConstraintValidator = hardConstraintValidator;
        this.softConstraintScorer = softConstraintScorer;
    }

    /**
     * Finds the highest-scoring VALID shift for one employee on one day.
     * Hard constraints always run before soft scoring.
     */
    public Shift findBestShift(
            Employee employee,
            List<Shift> shifts,
            LocalDate date,
            List<Roster> existingRosters,
            Policy policy,
            List<Employee> allEmployees) {

        if (employee == null || shifts == null || shifts.isEmpty()
                || date == null || existingRosters == null || policy == null) {
            return null;
        }

        List<Shift> sortedShifts = shifts.stream()
                .filter(shift -> shift != null && shift.getId() != null)
                .sorted(Comparator.comparing(Shift::getId))
                .collect(Collectors.toList());

        Shift bestShift = null;
        int bestScore = Integer.MIN_VALUE;

        for (Shift candidate : sortedShifts) {

            boolean valid = hardConstraintValidator.isValid(
                    employee,
                    candidate,
                    date,
                    policy,
                    existingRosters
            );

            if (!valid) {
                log.debug(
                        "[ROSTER] HARD REJECT employee={} shift={} date={}",
                        employee.getEmployeeCode(),
                        candidate.getShiftName(),
                        date
                );
                continue;
            }

            int score = softConstraintScorer.calculateScore(
                    employee,
                    candidate,
                    date,
                    existingRosters,
                    sortedShifts,
                    allEmployees
            );

            // Deterministic tie-breaker only. Fairness score remains dominant.
            if (bestShift == null
                    || score > bestScore
                    || (score == bestScore
                    && candidate.getId().compareTo(bestShift.getId()) < 0)) {

                bestShift = candidate;
                bestScore = score;
            }

            log.debug(
                    "[ROSTER] employee={} shift={} date={} score={}",
                    employee.getEmployeeCode(),
                    candidate.getShiftName(),
                    date,
                    score
            );
        }

        if (bestShift != null) {
            log.info(
                    "[ROSTER] BEST SHIFT employee={} date={} -> {} score={}",
                    employee.getEmployeeCode(),
                    date,
                    bestShift.getShiftName(),
                    bestScore
            );
        }

        return bestShift;
    }

    public boolean isShiftValid(
            Employee employee,
            Shift shift,
            LocalDate date,
            List<Roster> existingRosters,
            Policy policy) {

        if (employee == null || shift == null || date == null
                || existingRosters == null || policy == null) {
            return false;
        }

        return hardConstraintValidator.isValid(
                employee,
                shift,
                date,
                policy,
                existingRosters
        );
    }
}

