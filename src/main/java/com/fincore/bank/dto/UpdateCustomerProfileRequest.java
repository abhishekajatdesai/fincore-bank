package com.fincore.bank.dto;

import lombok.Data;

@Data
public class UpdateCustomerProfileRequest {
    private String name;
    private String email;
    private String phone;
    private String address;
}
