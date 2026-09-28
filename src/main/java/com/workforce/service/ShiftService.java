package com.workforce.service;

import com.workforce.entity.Shift;
import com.workforce.repository.ShiftRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShiftService {

    private final ShiftRepository shiftRepository;

    public ShiftService(ShiftRepository shiftRepository) {
        this.shiftRepository = shiftRepository;
    }

    // =========================================================
    // CREATE
    // =========================================================

    public Shift createShift(Shift shift) {

        if (shiftRepository.existsByShiftName(
                shift.getShiftName())) {

            throw new RuntimeException(
                    "Shift name already exists"
            );
        }

        return shiftRepository.save(shift);
    }

    // =========================================================
    // GET ALL
    // =========================================================

    public List<Shift> getAllShifts() {

        return shiftRepository.findAll();
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    public Shift getShiftById(Long id) {

        return shiftRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Shift not found with id: " + id
                        )
                );
    }

    // =========================================================
    // UPDATE
    // =========================================================

    public Shift updateShift(
            Long id,
            Shift updatedShift) {

        Shift existingShift =
                shiftRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Shift not found with id: " + id
                                )
                        );

        // Check duplicate shift name
        if (!existingShift.getShiftName()
                .equalsIgnoreCase(
                        updatedShift.getShiftName())
                && shiftRepository.existsByShiftName(
                updatedShift.getShiftName())) {

            throw new RuntimeException(
                    "Shift name already exists"
            );
        }

        existingShift.setShiftName(
                updatedShift.getShiftName()
        );

        existingShift.setStartTime(
                updatedShift.getStartTime()
        );

        existingShift.setEndTime(
                updatedShift.getEndTime()
        );

        existingShift.setDuration(
                updatedShift.getDuration()
        );

        existingShift.setStatus(
                updatedShift.getStatus()
        );

        return shiftRepository.save(existingShift);
    }

    // =========================================================
    // DELETE
    // =========================================================

    public void deleteShift(Long id) {

        if (!shiftRepository.existsById(id)) {

            throw new RuntimeException(
                    "Shift not found with id: " + id
            );
        }

        shiftRepository.deleteById(id);
    }
}