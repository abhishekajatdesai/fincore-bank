package com.fincore.bank.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;

@Data
@Entity
@Table(name = "loan_accounts")
public class LoanAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(name = "account_number", nullable = false)
    private Long accountNumber;
    @Column(name = "loan_type", nullable = false)
    private String loanType;
    @Column(name = "principal_amount", nullable = false)
    private double principalAmount;
    @Column(name = "interest_rate", nullable = false)
    private double interestRate;
    @Column(name = "tenure_months", nullable = false)
    private int tenureMonths;
    @Column(name = "emi_amount", nullable = false)
    private double emiAmount;
    @Column(name = "outstanding_amount", nullable = false)
    private double outstandingAmount;
    @Column(name = "total_repaid", nullable = false)
    private double totalRepaid;
    @Enumerated(EnumType.STRING)
    private Status status;
    @Column(name = "requested_at")
    private Timestamp requestedAt;
    @Column(name = "approved_at")
    private Timestamp approvedAt;
    @Column(name = "approved_by")
    private String approvedBy;
    @Column(name = "decision_note")
    private String decisionNote;
    @Column(name = "last_payment_at")
    private Timestamp lastPaymentAt;

    public enum Status { PENDING, APPROVED, REJECTED, CLOSED }

    @PrePersist
    public void onCreate() {
        if (requestedAt == null) {
            requestedAt = new Timestamp(System.currentTimeMillis());
        }
        if (status == null) {
            status = Status.PENDING;
        }
    }
}
