package com.workforce.scheduler;

import com.workforce.entity.Employee;
import com.workforce.entity.Policy;
import com.workforce.entity.Roster;
import com.workforce.entity.Shift;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class HardConstraintValidator {

    /**
     * Main validation method.
     */
    public boolean isValid(
            Employee employee,
            Shift shift,
            LocalDate date,
            Policy policy,
            List<Roster> existingRosters) {

        // 1. Employee must be ACTIVE
        if (!isActiveEmployee(employee)) {
            return false;
        }

        // 2. New joiner morning-only rule
        if (!checkNewJoinerRule(
                employee,
                shift,
                date,
                policy)) {

            return false;
        }

        // 3. Night shift restriction
        if (!checkNightShiftRule(
                employee,
                shift,
                policy)) {

            return false;
        }

        // 4. Maximum weekly hours
        if (!checkWeeklyHours(
                employee,
                shift,
                date,
                policy,
                existingRosters)) {

            return false;
        }

        // 5. Maximum consecutive working days
        if (!checkConsecutiveDays(
                employee,
                date,
                policy,
                existingRosters)) {

            return false;
        }

        // 6. Minimum rest hours
        if (!checkMinimumRest(
                employee,
                shift,
                date,
                policy,
                existingRosters)) {

            return false;
        }

        return true;
    }


    // =========================================================
    // 1. Employee ACTIVE check
    // =========================================================

    private boolean isActiveEmployee(Employee employee) {

        return employee.getStatus() != null
                && employee.getStatus()
                .equalsIgnoreCase("ACTIVE");
    }


    // =========================================================
    // 2. New Joiner Morning Rule
    // =========================================================

    private boolean checkNewJoinerRule(
            Employee employee,
            Shift shift,
            LocalDate date,
            Policy policy) {

        if (!policy.isNewJoinerMorningOnly()) {
            return true;
        }

        if (employee.getJoiningDate() == null) {
            return true;
        }

        long months = ChronoUnit.MONTHS.between(
                employee.getJoiningDate(),
                date
        );

        boolean isNewJoiner =
                months < policy.getNewJoinerMonths();

        if (!isNewJoiner) {
            return true;
        }

        return shift.getShiftName() != null
                && shift.getShiftName()
                .equalsIgnoreCase("MORNING");
    }

    // =========================================================
// 3. Night Shift Restriction
// =========================================================
    private boolean checkNightShiftRule(
            Employee employee,
            Shift shift,
            Policy policy) {

        // If night restriction is disabled,
        // everyone can work night shift
        if (!policy.isNightShiftRestriction()) {
            return true;
        }

        // If this is not a night shift,
        // no restriction applies
        if (shift.getShiftName() == null
                || !shift.getShiftName()
                .equalsIgnoreCase("NIGHT")) {

            return true;
        }

        // If policy allows restricted employees
        // to work night shift
        if (policy.isAllowNightShiftForRestrictedEmployees()) {
            return true;
        }

        // Night shift is restricted.
        // Employee must be explicitly allowed.
        return employee.isNightShiftAllowed();
    }


    // =========================================================
    // 4. Maximum Weekly Hours
    // =========================================================

    private boolean checkWeeklyHours(
            Employee employee,
            Shift newShift,
            LocalDate date,
            Policy policy,
            List<Roster> existingRosters) {

        double currentWeeklyHours = 0;

        LocalDate weekStart =
                date.minusDays(
                        date.getDayOfWeek().getValue() - 1
                );

        LocalDate weekEnd =
                weekStart.plusDays(6);

        for (Roster roster : existingRosters) {

            if (roster.getEmployee() == null) {
                continue;
            }

            if (!roster.getEmployee()
                    .getId()
                    .equals(employee.getId())) {

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
                        && roster.getShift()
                        .getDuration() != null) {

                    currentWeeklyHours +=
                            roster.getShift()
                                    .getDuration();
                }
            }
        }

        double newTotal =
                currentWeeklyHours
                        + newShift.getDuration();

        return newTotal <=
                policy.getMaxWeeklyHours();
    }


    // =========================================================
    // 5. Maximum Consecutive Working Days
    // =========================================================

    private boolean checkConsecutiveDays(
            Employee employee,
            LocalDate date,
            Policy policy,
            List<Roster> existingRosters) {

        int consecutiveDays = 0;

        LocalDate checkDate =
                date.minusDays(1);

        while (true) {

            boolean worked =
                    hasWorkedOnDate(
                            employee,
                            checkDate,
                            existingRosters
                    );

            if (!worked) {
                break;
            }

            consecutiveDays++;

            checkDate =
                    checkDate.minusDays(1);
        }

        return consecutiveDays <
                policy.getMaxConsecutiveDays();
    }


    // =========================================================
    // 6. Minimum Rest Hours
    // =========================================================

    private boolean checkMinimumRest(
            Employee employee,
            Shift newShift,
            LocalDate date,
            Policy policy,
            List<Roster> existingRosters) {

        Roster previousRoster = null;

        for (Roster roster : existingRosters) {

            if (roster.getEmployee() == null
                    || roster.getEmployee().getId() == null) {

                continue;
            }

            if (!roster.getEmployee()
                    .getId()
                    .equals(employee.getId())) {

                continue;
            }

            if (roster.getRosterDate() == null) {
                continue;
            }

            if (roster.getRosterDate()
                    .isBefore(date)) {

                if (previousRoster == null
                        || roster.getRosterDate()
                        .isAfter(
                                previousRoster.getRosterDate()
                        )) {

                    previousRoster = roster;
                }
            }
        }

        // No previous roster = enough rest
        if (previousRoster == null) {
            return true;
        }

        if (previousRoster.getShift() == null) {
            return true;
        }

        LocalDate previousDate =
                previousRoster.getRosterDate();

        Shift previousShift =
                previousRoster.getShift();

        LocalDateTime previousEnd =
                LocalDateTime.of(
                        previousDate,
                        previousShift.getEndTime()
                );

        /*
         * If the shift crosses midnight,
         * its end time belongs to the next day.
         */
        if (previousShift.getEndTime()
                .isBefore(
                        previousShift.getStartTime()
                )) {

            previousEnd =
                    previousEnd.plusDays(1);
        }

        LocalDateTime newStart =
                LocalDateTime.of(
                        date,
                        newShift.getStartTime()
                );

        long restHours =
                Duration.between(
                        previousEnd,
                        newStart
                ).toHours();

        return restHours >=
                policy.getMinRestHours();
    }


    // =========================================================
    // Helper
    // =========================================================

    private boolean hasWorkedOnDate(
            Employee employee,
            LocalDate date,
            List<Roster> existingRosters) {

        for (Roster roster : existingRosters) {

            if (roster.getEmployee() == null) {
                continue;
            }

            if (!roster.getEmployee()
                    .getId()
                    .equals(employee.getId())) {

                continue;
            }

            if (!date.equals(
                    roster.getRosterDate())) {

                continue;
            }

            String status =
                    roster.getStatus();

            if (status == null) {
                continue;
            }

            if (status.equalsIgnoreCase("ASSIGNED")) {
                return true;
            }
        }

        return false;
    }
}