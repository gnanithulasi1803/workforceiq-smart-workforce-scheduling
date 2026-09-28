package com.workforce.repository;

import com.workforce.entity.ShiftSwap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShiftSwapRepository
        extends JpaRepository<ShiftSwap, Long> {

    List<ShiftSwap> findByRequesterId(Long requesterId);

    List<ShiftSwap> findByTargetEmployeeId(Long targetEmployeeId);

    List<ShiftSwap> findByStatus(String status);
}