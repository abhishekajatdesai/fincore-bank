package com.fincore.bank.dto;

import lombok.Data;

@Data
public class CreateFixedDepositRequest {
    private double amount;
    private int tenureMonths;
}
