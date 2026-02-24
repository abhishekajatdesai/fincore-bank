package com.fincore.bank.dto;

import lombok.Data;

@Data
public class LoanApplicationRequest {
    private String loanType;
    private double amount;
    private int tenureMonths;
}
