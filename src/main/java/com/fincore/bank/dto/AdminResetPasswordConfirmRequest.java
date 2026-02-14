package com.fincore.bank.dto;

import lombok.Data;

@Data
public class AdminResetPasswordConfirmRequest {
    private String username;
    private String otp;
    private String newPassword;
}
