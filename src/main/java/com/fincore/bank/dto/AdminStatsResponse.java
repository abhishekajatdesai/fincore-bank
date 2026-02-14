package com.fincore.bank.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalCustomers;
    private long totalAccounts;
    private long todayTransactions;
    private long todayTransfers;
    private double totalBalance;
}
