package com.fincore.bank.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;

@Data
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String action;
    private String actor;
    private String status;
    private String detail;
    @Column(name = "created_at")
    private Timestamp createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = new Timestamp(System.currentTimeMillis());
        }
    }
}
