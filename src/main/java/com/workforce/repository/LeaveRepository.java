package com.workforce.repository;

import com.workforce.entity.Leave;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRepository extends JpaRepository<Leave, Long> {

    // Get all leaves for an employee
    List<Leave> findByEmployeeId(Long employeeId);

    // Get leaves by status
    List<Leave> findByStatus(String status);

    // Get leaves by employee and status
    List<Leave> findByEmployeeIdAndStatus(
            Long employeeId,
            String status
    );

    // Find leaves active on a particular date
    List<Leave> findByStartDateLessThanEqualAndEndDateGreaterThanEqual(
            LocalDate startDate,
            LocalDate endDate
    );
}