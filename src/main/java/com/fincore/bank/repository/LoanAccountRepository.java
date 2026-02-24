package com.fincore.bank.repository;

import com.fincore.bank.entity.LoanAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanAccountRepository extends JpaRepository<LoanAccount, Integer> {
    List<LoanAccount> findByAccountNumberOrderByIdDesc(Long accountNumber);
    List<LoanAccount> findByStatusOrderByIdDesc(LoanAccount.Status status);
}
