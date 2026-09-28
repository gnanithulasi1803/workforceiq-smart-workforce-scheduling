package com.workforce.repository;

import com.workforce.entity.Availability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AvailabilityRepository
        extends JpaRepository<Availability, Long> {

    List<Availability> findByEmployeeId(Long employeeId);

    List<Availability> findByDate(LocalDate date);

    List<Availability> findByAvailabilityStatus(
            String availabilityStatus);

    List<Availability> findByEmployeeIdAndDate(
            Long employeeId,
            LocalDate date);
}