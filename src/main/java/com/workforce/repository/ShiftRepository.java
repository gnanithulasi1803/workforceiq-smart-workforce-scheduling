package com.workforce.repository;

import com.workforce.entity.Shift;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShiftRepository extends JpaRepository<Shift, Long> {

    Optional<Shift> findByShiftName(String shiftName);

    boolean existsByShiftName(String shiftName);

    Optional<Shift> findByShiftNameIgnoreCase(String shiftName);
}