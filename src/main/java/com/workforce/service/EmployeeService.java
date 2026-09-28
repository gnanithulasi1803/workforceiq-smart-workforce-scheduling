package com.workforce.service;

import com.workforce.entity.Employee;
import com.workforce.exception.ResourceNotFoundException;
import com.workforce.repository.EmployeeRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    // =========================
    // CREATE
    // =========================

    public Employee createEmployee(Employee employee) {

        if (employeeRepository.existsByEmployeeCode(
                employee.getEmployeeCode())) {

            throw new RuntimeException(
                    "Employee code already exists: "
                            + employee.getEmployeeCode()
            );
        }

        if (employeeRepository.existsByEmail(
                employee.getEmail())) {

            throw new RuntimeException(
                    "Email already exists: "
                            + employee.getEmail()
            );
        }

        return employeeRepository.save(employee);
    }


    // =========================
    // READ ALL
    // =========================

    public List<Employee> getAllEmployees() {

        return employeeRepository.findAll();
    }


    // =========================
    // READ BY ID
    // =========================

    public Employee getEmployeeById(Long id) {

        return employeeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found with id: " + id
                        )
                );
    }


    // =========================
    // UPDATE
    // =========================

    public Employee updateEmployee(
            Long id,
            Employee employeeDetails) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found with id: " + id
                        )
                );

        employee.setEmployeeCode(
                employeeDetails.getEmployeeCode()
        );

        employee.setName(
                employeeDetails.getName()
        );

        employee.setEmail(
                employeeDetails.getEmail()
        );

        employee.setPhone(
                employeeDetails.getPhone()
        );

        employee.setDepartment(
                employeeDetails.getDepartment()
        );

        employee.setDesignation(
                employeeDetails.getDesignation()
        );

        employee.setJoiningDate(
                employeeDetails.getJoiningDate()
        );

        employee.setStatus(
                employeeDetails.getStatus()
        );

        return employeeRepository.save(employee);
    }


    // =========================
    // DELETE
    // =========================

    public void deleteEmployee(Long id) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found with id: " + id
                        )
                );

        employeeRepository.delete(employee);
    }
}