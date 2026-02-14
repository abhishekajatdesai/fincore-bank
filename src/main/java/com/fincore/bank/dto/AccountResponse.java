package com.fincore.bank.dto;

import com.fincore.bank.entity.Customer;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AccountResponse {
    private Long accountNumber;
    private Customer customer;
    private String accountType;
    private double balance;
}
