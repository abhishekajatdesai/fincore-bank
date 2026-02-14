package com.fincore.bank.dto;
import lombok.Data;
@Data
public class TransactionRequest {
    private Long fromAccount;
    private Long toAccount;
    private double amount;
    private String pin;
}
