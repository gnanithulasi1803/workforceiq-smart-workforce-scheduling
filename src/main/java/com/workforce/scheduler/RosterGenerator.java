package com.workforce.scheduler;

import com.workforce.entity.Employee;
import com.workforce.entity.Policy;
import com.workforce.entity.Roster;
import com.workforce.entity.Shift;
import com.workforce.repository.EmployeeRepository;
import com.workforce.repository.PolicyRepository;
import com.workforce.repository.RosterRepository;
import com.workforce.repository.ShiftRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
public class RosterGenerator {

    private final EmployeeRepository employeeRepository;
    private final ShiftRepository shiftRepository;
    private final RosterRepository rosterRepository;
    private final RosterOptimizer rosterOptimizer;
    private final PolicyRepository policyRepository;

    public RosterGenerator(
            EmployeeRepository employeeRepository,
            ShiftRepository shiftRepository,
            RosterRepository rosterRepository,
            RosterOptimizer rosterOptimizer,
            PolicyRepository policyRepository) {

        this.employeeRepository = employeeRepository;
        this.shiftRepository = shiftRepository;
        this.rosterRepository = rosterRepository;
        this.rosterOptimizer = rosterOptimizer;
        this.policyRepository = policyRepository;
    }

    /**
     * Generates a monthly roster day by day.
     *
     * Features:
     * 1. Smart shift selection using RosterOptimizer
     * 2. Maximum consecutive working day rule
     * 3. Automatic OFF days
     * 4. Existing hard constraints remain active
     * 5. New joiner rules remain active
     * 6. Night shift restrictions remain active
     * 7. Minimum rest rules remain active
     */
    public List<Roster> generateMonthlyRoster(int year, int month) {

        YearMonth yearMonth = YearMonth.of(year, month);

        LocalDate monthStart = yearMonth.atDay(1);
        LocalDate monthEnd = yearMonth.atEndOfMonth();

        // ============================================================
        // GET EMPLOYEES
        // ============================================================

        List<Employee> employees = employeeRepository.findAll();

        if (employees == null || employees.isEmpty()) {
            throw new RuntimeException("No employees found");
        }

        // ============================================================
        // GET SHIFTS
        // ============================================================

        List<Shift> shifts = shiftRepository.findAll();

        if (shifts == null || shifts.isEmpty()) {
            throw new RuntimeException("No shifts found");
        }

        // ============================================================
        // GET POLICY
        // ============================================================

        Policy policy = policyRepository.findById(1L)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Policy not found with id: 1"
                        )
                );

        // ============================================================
        // ACTIVE EMPLOYEES
        // ============================================================

        List<Employee> activeEmployees = employees.stream()
                .filter(e -> e != null)
                .filter(e ->
                        "ACTIVE".equalsIgnoreCase(e.getStatus())
                )
                .sorted(
                        Comparator.comparing(
                                Employee::getId,
                                Comparator.nullsLast(Long::compareTo)
                        )
                )
                .toList();

        if (activeEmployees.isEmpty()) {
            throw new RuntimeException(
                    "No active employees found"
            );
        }

        // ============================================================
        // FIND OFF SHIFT
        // ============================================================

        Shift offShift = shifts.stream()
                .filter(s -> s != null)
                .filter(s ->
                        s.getShiftName() != null
                                && "OFF".equalsIgnoreCase(
                                s.getShiftName()
                        )
                )
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException(
                                "OFF shift not found. " +
                                        "Please add OFF shift to the database."
                        )
                );

        // ============================================================
        // NORMAL WORKING SHIFTS ONLY
        //
        // OFF must NOT be sent to RosterOptimizer as a normal shift.
        // ============================================================

        List<Shift> workingShifts = shifts.stream()
                .filter(s -> s != null)
                .filter(s -> s.getId() != null)
                .filter(s ->
                        s.getShiftName() != null
                                && !"OFF".equalsIgnoreCase(
                                s.getShiftName()
                        )
                )
                .sorted(
                        Comparator.comparing(
                                Shift::getId
                        )
                )
                .toList();

        if (workingShifts.isEmpty()) {
            throw new RuntimeException(
                    "No working shifts found"
            );
        }

        // ============================================================
        // GENERATED ROSTERS
        // ============================================================

        List<Roster> generatedRosters =
                new ArrayList<>();

        LocalDate currentDate = monthStart;

        // ============================================================
        // DAY-BY-DAY GENERATION
        // ============================================================

        while (!currentDate.isAfter(monthEnd)) {

            /*
             * Refresh database state at the beginning of every day.
             *
             * This allows the optimizer to see assignments that were
             * already created for previous days.
             */
            List<Roster> existingRosters =
                    new ArrayList<>(
                            rosterRepository.findAll()
                    );

            for (Employee employee : activeEmployees) {
                // ====================================================
// DO NOT REGENERATE EXISTING EMPLOYEE/DAY
// ====================================================

                final LocalDate rosterDate = currentDate;

                boolean alreadyExists =
                        existingRosters.stream()
                                .anyMatch(r ->
                                        r.getEmployee() != null
                                                && r.getEmployee().getId() != null
                                                && r.getEmployee().getId()
                                                .equals(employee.getId())
                                                && r.getRosterDate() != null
                                                && rosterDate.equals(r.getRosterDate())
                                );

                if (alreadyExists) {
                    continue;
                }


                // ====================================================
// CHECK CONSECUTIVE WORKING DAYS + STAGGERED OFF DAY
// ====================================================

                int consecutiveWorkingDays =
                        getConsecutiveWorkingDays(
                                employee.getId(),
                                currentDate,
                                existingRosters
                        );

                /*
                 * Stagger OFF days between employees.
                 *
                 * This prevents all employees from getting OFF
                 * on the same date.
                 *
                 * Example:
                 * EMP001 -> Wednesday
                 * EMP002 -> Thursday
                 * EMP003 -> Friday
                 * EMP004 -> Saturday
                 * ...
                 *
                 * The maximum consecutive working-day rule
                 * is still checked first.
                 */

// Get employee position in active employee list
                int employeeIndex =
                        activeEmployees.indexOf(employee);

// Create different OFF-day rotation for each employee
                int offRotation =
                        Math.floorMod(employeeIndex, 7);

// Calculate day number
                int dayOfMonth =
                        currentDate.getDayOfMonth();

// Stagger OFF days across employees
                boolean staggeredOffDay =
                        Math.floorMod(
                                dayOfMonth + offRotation,
                                7
                        ) == 4;

                /*
                 * Maximum consecutive working days has higher priority.
                 *
                 * If employee already worked 6 consecutive days,
                 * force OFF regardless of the rotation.
                 */
                boolean maximumConsecutiveReached =
                        consecutiveWorkingDays
                                >= policy.getMaxConsecutiveDays();

                /*
                 * Create OFF if:
                 *
                 * 1. Maximum consecutive working days reached
                 * OR
                 * 2. Employee's staggered OFF day arrives
                 */
                if (maximumConsecutiveReached || staggeredOffDay) {

                    Roster offRoster =
                            createOffRoster(
                                    employee,
                                    currentDate,
                                    offShift
                            );

                    Roster savedOffRoster =
                            rosterRepository.save(
                                    offRoster
                            );

                    generatedRosters.add(
                            savedOffRoster
                    );

                    existingRosters.add(
                            savedOffRoster
                    );

                    String reason =
                            maximumConsecutiveReached
                                    ? "Maximum consecutive working days reached"
                                    : "Staggered weekly OFF day";

                    System.out.println(
                            "[ROSTER] OFF DAY - "
                                    + employee.getEmployeeCode()
                                    + " date="
                                    + currentDate
                                    + " reason="
                                    + reason
                    );

                    continue;
                }
                // ====================================================
                // FIND BEST WORKING SHIFT
                // ====================================================

                Shift bestShift =
                        rosterOptimizer.findBestShift(
                                employee,
                                workingShifts,
                                currentDate,
                                existingRosters,
                                policy,
                                activeEmployees
                        );

                // ====================================================
                // NO VALID SHIFT
                // ====================================================

                if (bestShift == null) {

                    /*
                     * Instead of simply skipping the employee,
                     * create an OFF day.
                     *
                     * This prevents missing roster dates.
                     */
                    Roster offRoster =
                            createOffRoster(
                                    employee,
                                    currentDate,
                                    offShift
                            );

                    Roster savedOffRoster =
                            rosterRepository.save(
                                    offRoster
                            );

                    generatedRosters.add(
                            savedOffRoster
                    );

                    existingRosters.add(
                            savedOffRoster
                    );

                    System.out.println(
                            "[ROSTER] OFF DAY - "
                                    + employee.getEmployeeCode()
                                    + " date="
                                    + currentDate
                                    + " reason=No valid shift found"
                    );

                    continue;
                }

                // ====================================================
                // HARD CONSTRAINT VALIDATION
                // ====================================================

                boolean valid =
                        rosterOptimizer.isShiftValid(
                                employee,
                                bestShift,
                                currentDate,
                                existingRosters,
                                policy
                        );

                if (!valid) {

                    /*
                     * If the optimizer selected a shift but the
                     * hard constraints reject it, create OFF instead
                     * of leaving the employee without a roster entry.
                     */
                    Roster offRoster =
                            createOffRoster(
                                    employee,
                                    currentDate,
                                    offShift
                            );

                    Roster savedOffRoster =
                            rosterRepository.save(
                                    offRoster
                            );

                    generatedRosters.add(
                            savedOffRoster
                    );

                    existingRosters.add(
                            savedOffRoster
                    );

                    System.out.println(
                            "[ROSTER] OFF DAY - "
                                    + employee.getEmployeeCode()
                                    + " date="
                                    + currentDate
                                    + " reason=Hard constraint blocked "
                                    + bestShift.getShiftName()
                    );

                    continue;
                }

                // ====================================================
                // CREATE ASSIGNED ROSTER
                // ====================================================

                Roster roster = new Roster();

                roster.setEmployee(employee);
                roster.setShift(bestShift);
                roster.setRosterDate(currentDate);
                roster.setStatus("ASSIGNED");

                roster.setNotes(
                        "Smart optimization - "
                                + bestShift.getShiftName()
                );

                Roster savedRoster =
                        rosterRepository.save(roster);

                generatedRosters.add(
                        savedRoster
                );

                /*
                 * Make the newly created assignment immediately
                 * visible to the next employee.
                 */
                existingRosters.add(
                        savedRoster
                );

                System.out.println(
                        "[ROSTER] ASSIGNED - "
                                + employee.getEmployeeCode()
                                + " date="
                                + currentDate
                                + " shift="
                                + bestShift.getShiftName()
                );
            }

            currentDate =
                    currentDate.plusDays(1);
        }

        return generatedRosters;
    }

    // ================================================================
    // COUNT CONSECUTIVE WORKING DAYS
    // ================================================================

    private int getConsecutiveWorkingDays(
            Long employeeId,
            LocalDate currentDate,
            List<Roster> rosters) {

        int consecutiveDays = 0;

        LocalDate checkDate =
                currentDate.minusDays(1);

        while (true) {

            LocalDate finalCheckDate =
                    checkDate;

            boolean workingDay =
                    rosters.stream()
                            .anyMatch(r ->
                                    r.getEmployee() != null
                                            && r.getEmployee()
                                            .getId()
                                            .equals(employeeId)

                                            && r.getRosterDate()
                                            .equals(finalCheckDate)

                                            && "ASSIGNED"
                                            .equalsIgnoreCase(
                                                    r.getStatus()
                                            )
                            );

            if (!workingDay) {
                break;
            }

            consecutiveDays++;

            checkDate =
                    checkDate.minusDays(1);
        }

        return consecutiveDays;
    }

    // ================================================================
    // CREATE OFF ROSTER
    // ================================================================

    private Roster createOffRoster(
            Employee employee,
            LocalDate date,
            Shift offShift) {

        Roster roster = new Roster();

        roster.setEmployee(employee);
        roster.setShift(offShift);
        roster.setRosterDate(date);
        roster.setStatus("OFF");

        roster.setNotes(
                "Scheduled OFF day"
        );

        return roster;
    }
}