package com.workforce.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "rosters")
public class Roster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Employee assigned to this roster
    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    // Shift assigned to employee
    @ManyToOne
    @JoinColumn(name = "shift_id", nullable = false)
    private Shift shift;

    // Date of roster
    @Column(nullable = false)
    private LocalDate rosterDate;

    // Status: ASSIGNED, LEAVE, OFF
    @Column(nullable = false)
    private String status;

    // Optional notes
    private String notes;

    public Roster() {
    }

    public Roster(
            Employee employee,
            Shift shift,
            LocalDate rosterDate,
            String status,
            String notes) {

        this.employee = employee;
        this.shift = shift;
        this.rosterDate = rosterDate;
        this.status = status;
        this.notes = notes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public Shift getShift() {
        return shift;
    }

    public void setShift(Shift shift) {
        this.shift = shift;
    }

    public LocalDate getRosterDate() {
        return rosterDate;
    }

    public void setRosterDate(LocalDate rosterDate) {
        this.rosterDate = rosterDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}