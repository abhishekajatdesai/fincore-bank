package com.fincore.bank.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.sql.Timestamp;

@Data
@AllArgsConstructor
public class TransactionView {
    private int transactionId;
    private Long accountNumber;
    private String accountName;
    private String txType;
    private double amount;
    private Timestamp txTime;
    private String description;
    private Long counterpartyAccount;
    private String counterpartyName;
}
