package com.example.demo.controller;



import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.SavingsRequest;
import com.example.demo.entity.Savings;
import com.example.demo.service.SavingsService;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*") 
public class SavingsController {

    private final SavingsService savingsService;
    
    @Value("${server.port}")
    private int port;

    @GetMapping("/savings/port")
    public String getPort() {
        return "Savings-service is running on port: " + port;
    }

    public SavingsController(SavingsService savingsService) {
        this.savingsService = savingsService;
    }

    // GET /api/v1/savings
    @GetMapping("/savings")
    public ResponseEntity<Savings> getProfile() {
        return ResponseEntity.ok(savingsService.getProfile());
    }

    // POST /api/v1/savings
    @PostMapping("/savings")
    public ResponseEntity<Savings> createSavings(
            @Valid @RequestBody SavingsRequest request) {

        Savings saved = savingsService.createSavings(request);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(saved);
    }

    // GET /api/v1/customers/{customerid}
    @GetMapping("/customers/{customerid}")
    public ResponseEntity<Savings> getSavingsByCustomerId(
            @PathVariable("customerid") Long customerId) {

        return ResponseEntity.ok(
            savingsService.getSavingsByCustomerId(customerId)
        );
    }

    // GET /api/v1/customers/savings/{customerid}
    @GetMapping("/customers/savings/{customerid}")
    public Object getSavingsSummary(
            @PathVariable("customerid") Long customerId) {

        return null;
    }
}
