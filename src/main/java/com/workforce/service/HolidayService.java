package com.workforce.service;

import com.workforce.entity.Holiday;
import com.workforce.repository.HolidayRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class HolidayService {

    private final HolidayRepository holidayRepository;

    public HolidayService(
            HolidayRepository holidayRepository) {

        this.holidayRepository = holidayRepository;
    }

    // ==========================================
    // CREATE
    // ==========================================

    public Holiday createHoliday(Holiday holiday) {

        if (holiday.getHolidayName() == null ||
                holiday.getHolidayName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Holiday name is required"
            );
        }

        if (holiday.getHolidayDate() == null) {

            throw new RuntimeException(
                    "Holiday date is required"
            );
        }

        if (holidayRepository
                .findByHolidayDate(
                        holiday.getHolidayDate()
                ).isPresent()) {

            throw new RuntimeException(
                    "Holiday already exists on this date"
            );
        }

        return holidayRepository.save(holiday);
    }


    // ==========================================
    // GET ALL
    // ==========================================

    public List<Holiday> getAllHolidays() {

        return holidayRepository.findAll();
    }


    // ==========================================
    // GET BY ID
    // ==========================================

    public Holiday getHolidayById(Long id) {

        return holidayRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Holiday not found with id: " + id
                        )
                );
    }


    // ==========================================
    // GET BY DATE
    // ==========================================

    public Holiday getHolidayByDate(
            LocalDate date) {

        return holidayRepository
                .findByHolidayDate(date)
                .orElseThrow(() ->
                        new RuntimeException(
                                "No holiday found on: " + date
                        )
                );
    }


    // ==========================================
    // GET OPTIONAL / MANDATORY
    // ==========================================

    public List<Holiday> getHolidaysByOptional(
            boolean optional) {

        return holidayRepository
                .findByOptional(optional);
    }


    // ==========================================
    // GET BY DATE RANGE
    // ==========================================

    public List<Holiday> getHolidaysBetween(
            LocalDate startDate,
            LocalDate endDate) {

        return holidayRepository
                .findByHolidayDateBetween(
                        startDate,
                        endDate
                );
    }


    // ==========================================
    // UPDATE
    // ==========================================

    public Holiday updateHoliday(
            Long id,
            Holiday updatedHoliday) {

        Holiday existingHoliday =
                holidayRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Holiday not found with id: "
                                                + id
                                )
                        );

        existingHoliday.setHolidayName(
                updatedHoliday.getHolidayName()
        );

        existingHoliday.setHolidayDate(
                updatedHoliday.getHolidayDate()
        );

        existingHoliday.setDescription(
                updatedHoliday.getDescription()
        );

        existingHoliday.setOptional(
                updatedHoliday.isOptional()
        );

        return holidayRepository.save(
                existingHoliday
        );
    }


    // ==========================================
    // DELETE
    // ==========================================

    public void deleteHoliday(Long id) {

        if (!holidayRepository.existsById(id)) {

            throw new RuntimeException(
                    "Holiday not found with id: " + id
            );
        }

        holidayRepository.deleteById(id);
    }
}