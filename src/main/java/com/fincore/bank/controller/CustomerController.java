package com.fincore.bank.controller;

import com.fincore.bank.dto.AccountResponse;
import com.fincore.bank.dto.ApiResponse;
import com.fincore.bank.dto.ChangePinRequest;
import com.fincore.bank.dto.CreateFixedDepositRequest;
import com.fincore.bank.dto.LoanApplicationRequest;
import com.fincore.bank.dto.LoanRepaymentRequest;
import com.fincore.bank.dto.UpdateCustomerProfileRequest;
import com.fincore.bank.entity.FixedDeposit;
import com.fincore.bank.entity.LoanAccount;
import com.fincore.bank.entity.Transaction;
import com.fincore.bank.service.CustomerService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/fixed-deposits")
    public FixedDeposit createFixedDeposit(@RequestBody CreateFixedDepositRequest req){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return customerService.createFixedDeposit(username, req);
    }

    @GetMapping("/fixed-deposits")
    public List<FixedDeposit> fixedDeposits(){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return customerService.getFixedDeposits(username);
    }

    @PostMapping("/fixed-deposits/{fdId}/break")
    public ApiResponse breakFixedDeposit(@PathVariable int fdId){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return customerService.breakFixedDeposit(username, fdId);
    }

    @GetMapping("/fixed-deposits/{fdId}/receipt")
    public ResponseEntity<byte[]> fixedDepositReceipt(@PathVariable int fdId) throws Exception {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        byte[] pdf = customerService.downloadFixedDepositReceipt(username, fdId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=FD_Receipt_" + fdId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PostMapping("/loans/apply")
    public LoanAccount applyLoan(@RequestBody LoanApplicationRequest req){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return customerService.applyLoan(username, req);
    }

    @GetMapping("/loans")
    public List<LoanAccount> loans(){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return customerService.getLoans(username);
    }

    @PostMapping("/loans/{loanId}/repay")
    public ApiResponse repayLoan(@PathVariable int loanId, @RequestBody LoanRepaymentRequest req){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return customerService.repayLoan(username, loanId, req);
    }

    @GetMapping("/loans/{loanId}/summary")
    public ResponseEntity<byte[]> loanSummary(@PathVariable int loanId) throws Exception {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        byte[] pdf = customerService.downloadLoanSummary(username, loanId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Loan_Summary_" + loanId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
