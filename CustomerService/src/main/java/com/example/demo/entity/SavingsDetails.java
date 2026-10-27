package com.example.demo.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class SavingsDetails {
	private Long accountno;

    private Long customerId;

    private LocalDate openingDate;

    private double balance;
}
