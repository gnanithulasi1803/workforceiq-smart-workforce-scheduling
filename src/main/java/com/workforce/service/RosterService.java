package com.workforce.service;

import com.workforce.entity.Employee;
import com.workforce.entity.Roster;
import com.workforce.entity.Shift;
import com.workforce.repository.EmployeeRepository;
import com.workforce.repository.RosterRepository;
import com.workforce.repository.ShiftRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class RosterService {

    private final RosterRepository rosterRepository;
    private final EmployeeRepository employeeRepository;
    private final ShiftRepository shiftRepository;

    public RosterService(
            RosterRepository rosterRepository,
            EmployeeRepository employeeRepository,
            ShiftRepository shiftRepository) {

        this.rosterRepository = rosterRepository;
        this.employeeRepository = employeeRepository;
        this.shiftRepository = shiftRepository;
    }

    // ==========================================
    // CREATE
    // ==========================================

    public Roster createRoster(Roster roster) {

        if (roster.getEmployee() == null ||
                roster.getEmployee().getId() == null) {

            throw new RuntimeException(
                    "Employee ID is required"
            );
        }

        if (roster.getShift() == null ||
                roster.getShift().getId() == null) {

            throw new RuntimeException(
                    "Shift ID is required"
            );
        }

        if (roster.getRosterDate() == null) {

            throw new RuntimeException(
                    "Roster date is required"
            );
        }

        if (roster.getStatus() == null ||
                roster.getStatus().trim().isEmpty()) {

            throw new RuntimeException(
                    "Roster status is required"
            );
        }

        Employee employee =
                employeeRepository.findById(
                        roster.getEmployee().getId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found with id: "
                                        + roster.getEmployee().getId()
                        )
                );

        Shift shift =
                shiftRepository.findById(
                        roster.getShift().getId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Shift not found with id: "
                                        + roster.getShift().getId()
                        )
                );

        roster.setEmployee(employee);
        roster.setShift(shift);

        return rosterRepository.save(roster);
    }


    // ==========================================
    // GET ALL
    // ==========================================

    public List<Roster> getAllRosters() {

        return rosterRepository.findAll();
    }


    // ==========================================
    // GET BY ID
    // ==========================================

    public Roster getRosterById(Long id) {

        return rosterRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Roster not found with id: " + id
                        )
                );
    }


    // ==========================================
    // GET BY EMPLOYEE
    // ==========================================

    public List<Roster> getRostersByEmployee(
            Long employeeId) {

        if (!employeeRepository.existsById(employeeId)) {

            throw new RuntimeException(
                    "Employee not found with id: "
                            + employeeId
            );
        }

        return rosterRepository
                .findByEmployeeId(employeeId);
    }


    // ==========================================
    // GET BY DATE
    // ==========================================

    public List<Roster> getRostersByDate(
            LocalDate date) {

        return rosterRepository
                .findByRosterDate(date);
    }


    // ==========================================
    // UPDATE
    // ==========================================

    public Roster updateRoster(
            Long id,
            Roster updatedRoster) {

        Roster existingRoster =
                rosterRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Roster not found with id: "
                                                + id
                                )
                        );

        if (updatedRoster.getEmployee() != null &&
                updatedRoster.getEmployee().getId() != null) {

            Employee employee =
                    employeeRepository.findById(
                            updatedRoster
                                    .getEmployee()
                                    .getId()
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Employee not found"
                            )
                    );

            existingRoster.setEmployee(employee);
        }

        if (updatedRoster.getShift() != null &&
                updatedRoster.getShift().getId() != null) {

            Shift shift =
                    shiftRepository.findById(
                            updatedRoster
                                    .getShift()
                                    .getId()
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Shift not found"
                            )
                    );

            existingRoster.setShift(shift);
        }

        if (updatedRoster.getRosterDate() != null) {

            existingRoster.setRosterDate(
                    updatedRoster.getRosterDate()
            );
        }

        if (updatedRoster.getStatus() != null) {

            existingRoster.setStatus(
                    updatedRoster.getStatus()
            );
        }

        existingRoster.setNotes(
                updatedRoster.getNotes()
        );

        return rosterRepository.save(
                existingRoster
        );
    }


    // ==========================================
    // DELETE
    // ==========================================

    public void deleteRoster(Long id) {

        if (!rosterRepository.existsById(id)) {

            throw new RuntimeException(
                    "Roster not found with id: " + id
            );
        }

        rosterRepository.deleteById(id);
    }
}