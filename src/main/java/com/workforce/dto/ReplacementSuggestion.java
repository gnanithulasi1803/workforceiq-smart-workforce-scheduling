package com.workforce.dto;

public class ReplacementSuggestion {

    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private String shiftName;
    private boolean eligible;
    private String reason;

    public ReplacementSuggestion() {
    }

    public ReplacementSuggestion(
            Long employeeId,
            String employeeCode,
            String employeeName,
            String shiftName,
            boolean eligible,
            String reason) {

        this.employeeId = employeeId;
        this.employeeCode = employeeCode;
        this.employeeName = employeeName;
        this.shiftName = shiftName;
        this.eligible = eligible;
        this.reason = reason;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getShiftName() {
        return shiftName;
    }

    public void setShiftName(String shiftName) {
        this.shiftName = shiftName;
    }

    public boolean isEligible() {
        return eligible;
    }

    public void setEligible(boolean eligible) {
        this.eligible = eligible;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}