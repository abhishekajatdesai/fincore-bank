package com.fincore.bank.repository;

import com.fincore.bank.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.sql.Timestamp;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    List<Transaction> findByAccountNumberOrderByTransactionIdDesc(Long accNo);

    long countByTxTimeBetween(Timestamp start, Timestamp end);

    long countByTxTypeInAndTxTimeBetween(List<String> types, Timestamp start, Timestamp end);
}
