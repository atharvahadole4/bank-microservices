package com.example.demo.dto;


import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record SavingsRequest(

    @NotNull(message = "Customer ID is required")
    @Positive(message = "Customer ID must be positive")
    Long customerId,

    @NotNull(message = "Opening date is required")
    @PastOrPresent(message = "Opening date cannot be in the future")
    LocalDate openingDate,

    @DecimalMin(
        value = "0.0",
        message = "Balance must be zero or positive"
    )
    double balance

) {}
