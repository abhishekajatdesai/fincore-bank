package com.fincore.bank.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "fixed_deposits")
public class FixedDeposit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(name = "account_number", nullable = false)
    private Long accountNumber;
    @Column(name = "principal_amount", nullable = false)
    private double principalAmount;
    @Column(name = "interest_rate", nullable = false)
    private double interestRate;
    @Column(name = "tenure_months", nullable = false)
    private int tenureMonths;
    @Column(name = "maturity_amount", nullable = false)
    private double maturityAmount;
    @Enumerated(EnumType.STRING)
    private Status status;
    @Column(name = "created_at")
    private Timestamp createdAt;
    @Column(name = "maturity_date")
    private LocalDate maturityDate;

    public enum Status { ACTIVE, CLOSED }

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = new Timestamp(System.currentTimeMillis());
        }
        if (status == null) {
            status = Status.ACTIVE;
        }
    }
}
