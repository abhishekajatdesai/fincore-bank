package com.fincore.bank.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RegisterResponse {
    private boolean success;
    private String username;
    private Long accountNumber;
    private String message;
}
