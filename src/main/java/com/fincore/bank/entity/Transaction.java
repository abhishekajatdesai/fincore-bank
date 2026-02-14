package com.fincore.bank.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.sql.Timestamp;

@Data
@Entity
@Table(name="transactions")
public class Transaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private int transactionId;
    @Column(name="account_number") private Long accountNumber;
    private String txType;
    private double amount;
    @Column(name="tx_time", insertable=false, updatable=false) private Timestamp txTime;
    private String description;
}
