package com.fincore.bank.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AccountSummaryResponse {
    private Long accountNumber;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String accountType;
    private double balance;
}
