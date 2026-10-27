package com.example.demo.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Savings;

import java.util.Optional;

public interface SavingsRepository
        extends JpaRepository<Savings, Long> {

    Optional<Savings> findByCustomerId(Long customerId);

    Optional<Savings> findFirstByOrderByAccountnoAsc();
}
