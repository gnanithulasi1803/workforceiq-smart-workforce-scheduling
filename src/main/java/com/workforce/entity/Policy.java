package com.workforce.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "policies")
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String policyName;

    // Maximum working hours allowed per week
    @Column(nullable = false)
    private Integer maxWeeklyHours;

    // Maximum consecutive working days
    @Column(nullable = false)
    private Integer maxConsecutiveDays;

    // Minimum rest gap between shifts in hours
    @Column(nullable = false)
    private Integer minRestHours;

    // Number of months new employees
    // must work only morning shift
    @Column(nullable = false)
    private Integer newJoinerMonths;

    // Whether new joiners are restricted to morning
    @Column(nullable = false)
    private boolean newJoinerMorningOnly;

    // Whether night shift restriction is enabled
    @Column(nullable = false)
    private boolean nightShiftRestriction;

    // Whether employees under the restriction
    // can work night shifts
    @Column(nullable = false)
    private boolean allowNightShiftForRestrictedEmployees;

    public Policy() {
    }

    public Policy(
            String policyName,
            Integer maxWeeklyHours,
            Integer maxConsecutiveDays,
            Integer minRestHours,
            Integer newJoinerMonths,
            boolean newJoinerMorningOnly,
            boolean nightShiftRestriction,
            boolean allowNightShiftForRestrictedEmployees) {

        this.policyName = policyName;
        this.maxWeeklyHours = maxWeeklyHours;
        this.maxConsecutiveDays = maxConsecutiveDays;
        this.minRestHours = minRestHours;
        this.newJoinerMonths = newJoinerMonths;
        this.newJoinerMorningOnly = newJoinerMorningOnly;
        this.nightShiftRestriction =
                nightShiftRestriction;
        this.allowNightShiftForRestrictedEmployees =
                allowNightShiftForRestrictedEmployees;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPolicyName() {
        return policyName;
    }

    public void setPolicyName(String policyName) {
        this.policyName = policyName;
    }

    public Integer getMaxWeeklyHours() {
        return maxWeeklyHours;
    }

    public void setMaxWeeklyHours(Integer maxWeeklyHours) {
        this.maxWeeklyHours = maxWeeklyHours;
    }

    public Integer getMaxConsecutiveDays() {
        return maxConsecutiveDays;
    }

    public void setMaxConsecutiveDays(Integer maxConsecutiveDays) {
        this.maxConsecutiveDays = maxConsecutiveDays;
    }

    public Integer getMinRestHours() {
        return minRestHours;
    }

    public void setMinRestHours(Integer minRestHours) {
        this.minRestHours = minRestHours;
    }

    public Integer getNewJoinerMonths() {
        return newJoinerMonths;
    }

    public void setNewJoinerMonths(Integer newJoinerMonths) {
        this.newJoinerMonths = newJoinerMonths;
    }

    public boolean isNewJoinerMorningOnly() {
        return newJoinerMorningOnly;
    }

    public void setNewJoinerMorningOnly(
            boolean newJoinerMorningOnly) {

        this.newJoinerMorningOnly =
                newJoinerMorningOnly;
    }

    public boolean isNightShiftRestriction() {
        return nightShiftRestriction;
    }

    public void setNightShiftRestriction(
            boolean nightShiftRestriction) {

        this.nightShiftRestriction =
                nightShiftRestriction;
    }

    public boolean isAllowNightShiftForRestrictedEmployees() {
        return allowNightShiftForRestrictedEmployees;
    }

    public void setAllowNightShiftForRestrictedEmployees(
            boolean allowNightShiftForRestrictedEmployees) {

        this.allowNightShiftForRestrictedEmployees =
                allowNightShiftForRestrictedEmployees;
    }
}