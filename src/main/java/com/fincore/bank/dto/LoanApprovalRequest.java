package com.fincore.bank.dto;

import lombok.Data;

@Data
public class LoanApprovalRequest {
    private double interestRate;
    private Integer tenureMonths;
    private String note;
}
