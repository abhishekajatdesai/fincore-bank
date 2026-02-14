package com.fincore.bank.controller;
import com.fincore.bank.dto.AccountResponse;
import com.fincore.bank.service.AccountService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/account")
@CrossOrigin
public class AccountController {
    private final AccountService accountService;
    public AccountController(AccountService a){this.accountService=a;}
    @GetMapping("/{accNo}") public AccountResponse getAccount(@PathVariable Long accNo){
        var auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return accountService.getAccountResponseForUser(accNo, username, isAdmin);
    }
    @GetMapping("/balance/{accNo}") public double getBalance(@PathVariable Long accNo){
        var auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            accountService.getAccountResponseForUser(accNo, username, false);
        }
        return accountService.getBalance(accNo);
    }
}
