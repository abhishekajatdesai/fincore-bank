package com.fincore.bank.entity;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private int userId;
    @Column(unique = true, nullable = false) private String username;
    @Column(name="password_hash") private String passwordHash;
    @Enumerated(EnumType.STRING) private Role role;
    @Column(name="account_number") private Long accountNumber;
    public enum Role { ADMIN, CUSTOMER }
}
