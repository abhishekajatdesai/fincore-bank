package com.fincore.bank.dto;

import lombok.Data;

@Data
public class ChangePinRequest {
    private String oldPin;
    private String newPin;
}
