package com.example.demo.service;


import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.SavingsRequest;
import com.example.demo.entity.Savings;
import com.example.demo.exception.AccountNumberNotFoundException;
import com.example.demo.repository.SavingsRepository;

@Service
public class SavingServiceImpl implements SavingsService {

    private final SavingsRepository savingsRepository;

    public SavingServiceImpl(SavingsRepository savingsRepository) {
        this.savingsRepository = savingsRepository;
    }

    @Override
    @Transactional
    public Savings createSavings(SavingsRequest request) {

        Savings savings = new Savings();
        savings.setCustomerId(request.customerId());
        savings.setOpeningDate(request.openingDate());
        savings.setBalance(request.balance());

        return savingsRepository.save(savings);
    }

    @Override
    @Transactional(readOnly = true)
    public Savings getSavingsByCustomerId(Long customerId) {

        return savingsRepository.findByCustomerId(customerId)
            .orElseThrow(() ->
                new AccountNumberNotFoundException(
                    "Savings account not found for customer ID: "
                    + customerId
                )
            );
    }

    @Override
    @Transactional(readOnly = true)
    public Savings getProfile() {

        return savingsRepository.findFirstByOrderByAccountnoAsc()
            .orElseThrow(() ->
                new AccountNumberNotFoundException(
                    "No savings account found"
                )
            );
    }
}