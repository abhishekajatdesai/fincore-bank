package com.fincore.bank.dto;

import lombok.Data;

@Data
public class LoanRepaymentRequest {
    private double amount;
    private String pin;
}
