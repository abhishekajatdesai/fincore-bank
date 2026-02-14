package com.fincore.bank.dto;
import lombok.AllArgsConstructor; import lombok.Data;
@Data @AllArgsConstructor
public class LoginResponse { private boolean success; private String role; private Long accountNumber; private String token; private String message; }
