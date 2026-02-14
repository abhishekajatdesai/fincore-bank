package com.fincore.bank.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OtpResponse {
    private boolean success;
    private String message;
    private String otp;
}
