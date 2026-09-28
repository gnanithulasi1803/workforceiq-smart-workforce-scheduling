package com.workforce.controller;

import com.workforce.entity.Policy;
import com.workforce.service.PolicyService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policies")
public class PolicyController {

    private final PolicyService policyService;

    public PolicyController(
            PolicyService policyService) {

        this.policyService = policyService;
    }


    // ==========================================
    // CREATE
    // ==========================================

    @PostMapping
    public ResponseEntity<Policy> createPolicy(
            @RequestBody Policy policy) {

        return new ResponseEntity<>(
                policyService.createPolicy(policy),
                HttpStatus.CREATED
        );
    }


    // ==========================================
    // GET ALL
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Policy>>
    getAllPolicies() {

        return ResponseEntity.ok(
                policyService.getAllPolicies()
        );
    }


    // ==========================================
    // GET BY ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<Policy>
    getPolicyById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                policyService.getPolicyById(id)
        );
    }


    // ==========================================
    // UPDATE
    // ==========================================

    @PutMapping("/{id}")
    public ResponseEntity<Policy>
    updatePolicy(
            @PathVariable Long id,
            @RequestBody Policy policy) {

        return ResponseEntity.ok(
                policyService.updatePolicy(
                        id,
                        policy
                )
        );
    }


    // ==========================================
    // DELETE
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deletePolicy(
            @PathVariable Long id) {

        policyService.deletePolicy(id);

        return ResponseEntity.ok(
                "Policy deleted successfully"
        );
    }
}