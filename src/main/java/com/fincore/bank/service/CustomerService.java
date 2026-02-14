package com.fincore.bank.service;

import com.fincore.bank.dto.AccountResponse;
import com.fincore.bank.dto.ApiResponse;
import com.fincore.bank.dto.ChangePinRequest;
import com.fincore.bank.dto.UpdateCustomerProfileRequest;
import com.fincore.bank.entity.Account;
import com.fincore.bank.entity.Customer;
import com.fincore.bank.entity.Transaction;
import com.fincore.bank.entity.User;
import com.fincore.bank.repository.AccountRepository;
import com.fincore.bank.repository.CustomerRepository;
import com.fincore.bank.repository.TransactionRepository;
import com.fincore.bank.repository.UserRepository;
import com.fincore.bank.util.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerService {
    private final UserRepository userRepo;
    private final AccountRepository accountRepo;
    private final CustomerRepository customerRepo;
    private final TransactionRepository txRepo;

    public CustomerService(UserRepository userRepo, AccountRepository accountRepo, CustomerRepository customerRepo, TransactionRepository txRepo){
        this.userRepo=userRepo; this.accountRepo=accountRepo; this.customerRepo=customerRepo; this.txRepo=txRepo;
    }

    public AccountResponse getProfile(String username){
        User user = userRepo.findByUsername(username);
        if(user==null || user.getAccountNumber()==null){
            throw new RuntimeException("Customer account not found");
        }
        Account acc = accountRepo.findById(user.getAccountNumber())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        return new AccountResponse(acc.getAccountNumber(), acc.getCustomer(), acc.getAccountType(), acc.getBalance());
    }

    @Transactional
    public AccountResponse updateProfile(String username, UpdateCustomerProfileRequest req){
        User user = userRepo.findByUsername(username);
        if(user==null || user.getAccountNumber()==null){
            throw new RuntimeException("Customer account not found");
        }
        Account acc = accountRepo.findById(user.getAccountNumber())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        Customer c = acc.getCustomer();
        if(req.getName()!=null) c.setName(req.getName());
        if(req.getEmail()!=null && !req.getEmail().equalsIgnoreCase(c.getEmail())){
            Customer existing = customerRepo.findByEmail(req.getEmail());
            if(existing!=null && existing.getCustomerId()!=c.getCustomerId()){
                throw new RuntimeException("Email already exists");
            }
            c.setEmail(req.getEmail());
        }
        if(req.getPhone()!=null) c.setPhone(req.getPhone());
        if(req.getAddress()!=null) c.setAddress(req.getAddress());
        customerRepo.save(c);
        return new AccountResponse(acc.getAccountNumber(), c, acc.getAccountType(), acc.getBalance());
    }

    @Transactional
    public ApiResponse changePin(String username, ChangePinRequest req){
        User user = userRepo.findByUsername(username);
        if(user==null || user.getAccountNumber()==null){
            return new ApiResponse(false, "Customer account not found");
        }
        Account acc = accountRepo.findById(user.getAccountNumber())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        if(!acc.getPin().equals(SecurityUtil.sha256(req.getOldPin()))){
            return new ApiResponse(false, "Old PIN is incorrect");
        }
        acc.setPin(SecurityUtil.sha256(req.getNewPin()));
        accountRepo.save(acc);
        return new ApiResponse(true, "PIN updated");
    }

    public List<Transaction> recentActivity(String username, int limit){
        User user = userRepo.findByUsername(username);
        if(user==null || user.getAccountNumber()==null){
            throw new RuntimeException("Customer account not found");
        }
        List<Transaction> all = txRepo.findByAccountNumberOrderByTransactionIdDesc(user.getAccountNumber());
        return all.subList(0, Math.min(limit, all.size()));
    }
}
