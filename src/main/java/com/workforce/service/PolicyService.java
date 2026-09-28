package com.workforce.service;

import com.workforce.entity.Policy;
import com.workforce.repository.PolicyRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PolicyService {

    private final PolicyRepository policyRepository;

    public PolicyService(
            PolicyRepository policyRepository) {

        this.policyRepository = policyRepository;
    }

    // ==========================================
    // CREATE
    // ==========================================

    public Policy createPolicy(Policy policy) {

        if (policy.getPolicyName() == null ||
                policy.getPolicyName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Policy name is required"
            );
        }

        if (policy.getMaxWeeklyHours() <= 0) {
            throw new RuntimeException(
                    "Maximum weekly hours must be greater than 0"
            );
        }

        if (policy.getMaxConsecutiveDays() <= 0) {
            throw new RuntimeException(
                    "Maximum consecutive days must be greater than 0"
            );
        }

        if (policy.getMinRestHours() < 0) {
            throw new RuntimeException(
                    "Minimum rest hours cannot be negative"
            );
        }

        if (policy.getNewJoinerMonths() < 0) {
            throw new RuntimeException(
                    "New joiner months cannot be negative"
            );
        }

        if (policyRepository
                .findByPolicyName(
                        policy.getPolicyName()
                ).isPresent()) {

            throw new RuntimeException(
                    "Policy already exists"
            );
        }

        return policyRepository.save(policy);
    }


    // ==========================================
    // GET ALL
    // ==========================================

    public List<Policy> getAllPolicies() {

        return policyRepository.findAll();
    }


    // ==========================================
    // GET BY ID
    // ==========================================

    public Policy getPolicyById(Long id) {

        return policyRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Policy not found with id: " + id
                        )
                );
    }


    // ==========================================
    // UPDATE
    // ==========================================

    public Policy updatePolicy(
            Long id,
            Policy updatedPolicy) {

        Policy existingPolicy =
                policyRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Policy not found with id: "
                                                + id
                                )
                        );

        existingPolicy.setPolicyName(
                updatedPolicy.getPolicyName()
        );

        existingPolicy.setMaxWeeklyHours(
                updatedPolicy.getMaxWeeklyHours()
        );

        existingPolicy.setMaxConsecutiveDays(
                updatedPolicy.getMaxConsecutiveDays()
        );

        existingPolicy.setMinRestHours(
                updatedPolicy.getMinRestHours()
        );

        existingPolicy.setNewJoinerMonths(
                updatedPolicy.getNewJoinerMonths()
        );

        existingPolicy.setNewJoinerMorningOnly(
                updatedPolicy.isNewJoinerMorningOnly()
        );

        existingPolicy.setNightShiftRestriction(
                updatedPolicy.isNightShiftRestriction()
        );

        existingPolicy
                .setAllowNightShiftForRestrictedEmployees(
                        updatedPolicy
                                .isAllowNightShiftForRestrictedEmployees()
                );

        return policyRepository.save(existingPolicy);
    }


    // ==========================================
    // DELETE
    // ==========================================

    public void deletePolicy(Long id) {

        if (!policyRepository.existsById(id)) {

            throw new RuntimeException(
                    "Policy not found with id: " + id
            );
        }

        policyRepository.deleteById(id);
    }
}