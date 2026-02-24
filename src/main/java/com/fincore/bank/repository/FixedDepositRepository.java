package com.fincore.bank.repository;

import com.fincore.bank.entity.FixedDeposit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FixedDepositRepository extends JpaRepository<FixedDeposit, Integer> {
    List<FixedDeposit> findByAccountNumberOrderByIdDesc(Long accountNumber);
}
