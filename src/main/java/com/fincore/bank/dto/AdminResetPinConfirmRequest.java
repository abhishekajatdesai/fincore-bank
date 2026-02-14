package com.fincore.bank.dto;

import lombok.Data;

@Data
public class AdminResetPinConfirmRequest {
    private Long accountNumber;
    private String otp;
    private String newPin;
}
