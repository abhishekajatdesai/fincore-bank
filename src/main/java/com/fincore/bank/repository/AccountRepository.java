package com.fincore.bank.repository;

import com.fincore.bank.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByCustomerNameContainingIgnoreCaseOrCustomerEmailContainingIgnoreCaseOrCustomerPhoneContainingIgnoreCase(
            String name, String email, String phone);

    @Query("select coalesce(sum(a.balance),0) from Account a")
    double sumBalances();
}
