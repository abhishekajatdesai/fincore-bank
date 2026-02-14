package com.fincore.bank.entity;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="customers")
public class Customer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private int customerId;
    private String name;
    private String email;
    private String phone;
    private String address;
}
