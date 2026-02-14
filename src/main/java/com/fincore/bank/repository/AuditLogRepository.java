package com.fincore.bank.repository;

import com.fincore.bank.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Integer> {
    List<AuditLog> findTop50ByOrderByCreatedAtDesc();
}
