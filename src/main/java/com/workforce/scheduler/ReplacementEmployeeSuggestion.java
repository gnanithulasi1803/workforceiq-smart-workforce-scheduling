package com.workforce.scheduler;
import com.workforce.entity.Policy;
import com.workforce.entity.Employee;
import com.workforce.entity.Roster;
import com.workforce.entity.Shift;
import com.workforce.repository.EmployeeRepository;
import com.workforce.repository.PolicyRepository;
import com.workforce.repository.RosterRepository;
import com.workforce.repository.ShiftRepository;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class ReplacementEmployeeSuggestion {

    private final EmployeeRepository employeeRepository;
    private final RosterRepository rosterRepository;
    private final ShiftRepository shiftRepository;
    private final HardConstraintValidator hardConstraintValidator;
    private final PolicyRepository policyRepository;
    public ReplacementEmployeeSuggestion(
            EmployeeRepository employeeRepository,
            RosterRepository rosterRepository,
            ShiftRepository shiftRepository,
            HardConstraintValidator hardConstraintValidator,
            PolicyRepository policyRepository) {

        this.employeeRepository = employeeRepository;
        this.rosterRepository = rosterRepository;
        this.shiftRepository = shiftRepository;
        this.hardConstraintValidator = hardConstraintValidator;
        this.policyRepository = policyRepository;
    }

    /**
     * Find suitable replacement employees
     * for an employee who is on leave.
     */
    public List<Employee> suggestReplacements(
            Long employeeId,
            LocalDate startDate,
            LocalDate endDate,
            Long shiftId) {

        List<Employee> suggestions = new ArrayList<>();

        // Find the shift that needs replacement
        Shift requiredShift = shiftRepository
                .findById(shiftId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Shift not found with id: " + shiftId
                        )
                );

        // Get all employees
        List<Employee> employees =
                employeeRepository.findAll();

        // Get existing rosters
        List<Roster> existingRosters =
                rosterRepository.findAll();

        for (Employee employee : employees) {

            // Do not suggest the employee who is on leave
            if (employee.getId().equals(employeeId)) {
                continue;
            }

            // Only ACTIVE employees
            if (!"ACTIVE".equalsIgnoreCase(
                    employee.getStatus())) {
                continue;
            }

            boolean availableForEntireLeavePeriod = true;

            LocalDate currentDate = startDate;

            while (!currentDate.isAfter(endDate)) {

                // Check whether this employee already
                // has an assignment on this date
                if (hasRosterOnDate(
                        employee,
                        currentDate,
                        existingRosters)) {

                    availableForEntireLeavePeriod = false;
                    break;
                }

                // Check hard constraints
                boolean valid = hardConstraintValidator.isValid(
                        employee,
                        requiredShift,
                        currentDate,
                        getPolicy(),
                        existingRosters
                );

                if (!valid) {
                    availableForEntireLeavePeriod = false;
                    break;
                }

                currentDate =
                        currentDate.plusDays(1);
            }

            if (availableForEntireLeavePeriod) {
                suggestions.add(employee);
            }
        }

        return suggestions;
    }

    /**
     * Check whether employee already has
     * a roster assignment on a particular date.
     */
    private boolean hasRosterOnDate(
            Employee employee,
            LocalDate date,
            List<Roster> rosters) {

        for (Roster roster : rosters) {

            if (roster.getEmployee() == null) {
                continue;
            }

            if (roster.getEmployee().getId() == null) {
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

            if ("ASSIGNED".equalsIgnoreCase(
                    roster.getStatus())) {

                return true;
            }
        }

        return false;
    }

    /**
     * Get active workforce policy.
     *
     * For now, policy ID 1 is used.
     */
    private Policy getPolicy() {

        return policyRepository.findById(1L)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Policy not found with id: 1"
                        )
                );
    }
}