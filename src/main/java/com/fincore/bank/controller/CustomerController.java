package com.fincore.bank.controller;

import com.fincore.bank.dto.AccountResponse;
import com.fincore.bank.dto.ApiResponse;
import com.fincore.bank.dto.ChangePinRequest;
import com.fincore.bank.dto.UpdateCustomerProfileRequest;
import com.fincore.bank.entity.Transaction;
import com.fincore.bank.service.CustomerService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin
public class CustomerController {
    private final CustomerService customerService;
    public CustomerController(CustomerService customerService){this.customerService=customerService;}

    @GetMapping("/profile")
    public AccountResponse profile(){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return customerService.getProfile(username);
    }

    @PutMapping("/profile")
    public AccountResponse updateProfile(@RequestBody UpdateCustomerProfileRequest req){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return customerService.updateProfile(username, req);
    }

    @PostMapping("/change-pin")
    public ApiResponse changePin(@RequestBody ChangePinRequest req){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return customerService.changePin(username, req);
    }

    @GetMapping("/activity")
    public List<Transaction> activity(@RequestParam(defaultValue = "10") int limit){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return customerService.recentActivity(username, limit);
    }
}
