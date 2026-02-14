package com.fincore.bank.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String phone;
    private String address;
    private String accountType;
    private String pin;
    private String password;
}
