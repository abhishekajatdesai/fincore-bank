package com.fincore.bank.dto;
import lombok.Data;
@Data
public class CreateCustomerRequest {
    private String name; private String email; private String phone; private String address;
    private String accountType; private String pin;
}
