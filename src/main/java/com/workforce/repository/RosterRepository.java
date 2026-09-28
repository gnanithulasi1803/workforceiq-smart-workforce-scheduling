package com.workforce.repository;

import com.workforce.entity.Roster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
public interface RosterRepository
        extends JpaRepository<Roster, Long> {

    List<Roster> findByEmployeeId(Long employeeId);

    List<Roster> findByRosterDate(LocalDate rosterDate);

    List<Roster> findByRosterDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    Optional<Roster> findByEmployeeIdAndRosterDate(
            Long employeeId,
            LocalDate rosterDate
    );
}