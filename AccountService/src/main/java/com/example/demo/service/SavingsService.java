package com.example.demo.service;

import com.example.demo.dto.SavingsRequest;
import com.example.demo.entity.Savings;

public interface SavingsService {

    Savings createSavings(SavingsRequest request);

    Savings getSavingsByCustomerId(Long customerId);

    Savings getProfile();
}
