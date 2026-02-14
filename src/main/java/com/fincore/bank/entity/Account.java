package com.fincore.bank.entity;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="accounts")
public class Account {
    @Id @Column(name="account_number") private Long accountNumber;
    @ManyToOne @JoinColumn(name="customer_id") private Customer customer;
    private String accountType;
    private double balance;
    private String pin;
}
