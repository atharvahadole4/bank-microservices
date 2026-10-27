package com.example.demo.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

import com.example.demo.entity.Gender;

public record CustomerRequest(

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be 2-50 characters")
    @Pattern(
        regexp = "^[A-Za-z ]+$",
        message = "Name must contain only letters and spaces"
    )
    String name,

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    String email,

    @NotBlank(message = "Mobile is required")
    @Pattern(
        regexp = "^[6-9][0-9]{9}$",
        message = "Mobile must be a valid 10-digit Indian number"
    )
    String mobile,

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    LocalDate dateOfBirth,

    @NotNull(message = "Gender is required")
    Gender gender,

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 60, message = "City must be 2-60 characters")
    @Pattern(
        regexp = "^[A-Za-z][A-Za-z .,'-]*$",
        message = "City contains invalid characters"
    )
    String city

) {
    @AssertTrue(message = "Customer must be at least 18 years old")
    public boolean isAtLeast18() {
        return dateOfBirth == null
            || !dateOfBirth.isAfter(LocalDate.now().minusYears(18));
    }
}