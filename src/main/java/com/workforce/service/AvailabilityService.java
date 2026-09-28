package com.workforce.service;

import com.workforce.entity.Availability;
import com.workforce.repository.AvailabilityRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;

    public AvailabilityService(
            AvailabilityRepository availabilityRepository) {

        this.availabilityRepository =
                availabilityRepository;
    }

    // ==========================================
    // CREATE
    // ==========================================

    public Availability createAvailability(
            Availability availability) {

        if (availability.getDate()
                .isBefore(LocalDate.now())) {

            throw new RuntimeException(
                    "Availability date cannot be in the past"
            );
        }

        if (availability.getAvailabilityStatus() == null
                || (!availability.getAvailabilityStatus()
                .equalsIgnoreCase("AVAILABLE")
                &&
                !availability.getAvailabilityStatus()
                        .equalsIgnoreCase("UNAVAILABLE"))) {

            throw new RuntimeException(
                    "Status must be AVAILABLE or UNAVAILABLE"
            );
        }

        return availabilityRepository.save(
                availability
        );
    }


    // ==========================================
    // GET ALL
    // ==========================================

    public List<Availability> getAllAvailabilities() {

        return availabilityRepository.findAll();
    }


    // ==========================================
    // GET BY ID
    // ==========================================

    public Availability getAvailabilityById(
            Long id) {

        return availabilityRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Availability not found with id: "
                                        + id
                        )
                );
    }


    // ==========================================
    // GET BY EMPLOYEE
    // ==========================================

    public List<Availability> getByEmployee(
            Long employeeId) {

        return availabilityRepository
                .findByEmployeeId(employeeId);
    }


    // ==========================================
    // GET BY DATE
    // ==========================================

    public List<Availability> getByDate(
            LocalDate date) {

        return availabilityRepository
                .findByDate(date);
    }


    // ==========================================
    // GET BY STATUS
    // ==========================================

    public List<Availability> getByStatus(
            String status) {

        return availabilityRepository
                .findByAvailabilityStatus(status);
    }


    // ==========================================
    // GET EMPLOYEE + DATE
    // ==========================================

    public List<Availability>
    getByEmployeeAndDate(
            Long employeeId,
            LocalDate date) {

        return availabilityRepository
                .findByEmployeeIdAndDate(
                        employeeId,
                        date
                );
    }


    // ==========================================
    // UPDATE
    // ==========================================

    public Availability updateAvailability(
            Long id,
            Availability updatedAvailability) {

        Availability existing =
                availabilityRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Availability not found with id: "
                                                + id
                                )
                        );

        if (updatedAvailability.getDate()
                .isBefore(LocalDate.now())) {

            throw new RuntimeException(
                    "Availability date cannot be in the past"
            );
        }

        existing.setEmployeeId(
                updatedAvailability.getEmployeeId()
        );

        existing.setDate(
                updatedAvailability.getDate()
        );

        existing.setAvailabilityStatus(
                updatedAvailability
                        .getAvailabilityStatus()
        );

        existing.setPreferredShift(
                updatedAvailability.getPreferredShift()
        );

        existing.setReason(
                updatedAvailability.getReason()
        );

        return availabilityRepository.save(
                existing
        );
    }


    // ==========================================
    // DELETE
    // ==========================================

    public void deleteAvailability(Long id) {

        if (!availabilityRepository
                .existsById(id)) {

            throw new RuntimeException(
                    "Availability not found with id: "
                            + id
            );
        }

        availabilityRepository.deleteById(id);
    }
}
