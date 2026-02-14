package com.fincore.bank.service;
import com.fincore.bank.dto.AccountResponse;
import com.fincore.bank.entity.Account;
import com.fincore.bank.entity.User;
import com.fincore.bank.repository.AccountRepository;
import com.fincore.bank.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AccountService {
    private final AccountRepository accountRepo;
    private final UserRepository userRepo;
    public AccountService(AccountRepository ar, UserRepository ur){this.accountRepo=ar;this.userRepo=ur;}
    public Account getAccount(Long acc) { return accountRepo.findById(acc).orElseThrow(() -> new RuntimeException("Account not found")); }
    public AccountResponse getAccountResponse(Long acc) {
        Account account = getAccount(acc);
        return new AccountResponse(account.getAccountNumber(), account.getCustomer(), account.getAccountType(), account.getBalance());
    }
    public AccountResponse getAccountResponseForUser(Long acc, String username, boolean isAdmin) {
        if (!isAdmin) {
            User user = userRepo.findByUsername(username);
            if (user == null || user.getAccountNumber() == null || !user.getAccountNumber().equals(acc)) {
                throw new RuntimeException("Access denied");
            }
        }
        return getAccountResponse(acc);
    }
    public double getBalance(Long acc) { return getAccount(acc).getBalance(); }
}
