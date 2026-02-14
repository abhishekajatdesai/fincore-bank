package com.fincore.bank.controller;
import com.fincore.bank.dto.*;
import com.fincore.bank.entity.AuditLog;
import com.fincore.bank.service.AdminService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
public class AdminController {
    private final AdminService adminService;
    public AdminController(AdminService a){this.adminService=a;}
    @PostMapping("/create-customer")
    public Long createCustomer(@RequestBody CreateCustomerRequest req){
        String actor = SecurityContextHolder.getContext().getAuthentication().getName();
        return adminService.createCustomerAndAccount(req, actor);
    }

    @GetMapping("/accounts")
    public List<AccountSummaryResponse> searchAccounts(@RequestParam(required = false) String query){
        return adminService.searchAccounts(query);
    }

    @GetMapping("/stats")
    public AdminStatsResponse stats(){
        return adminService.getStats();
    }

    @GetMapping("/audit")
    public List<AuditLog> audit(){
        return adminService.getAuditLogs();
    }

    @PostMapping("/reset-password/initiate")
    public OtpResponse resetPasswordInit(@RequestBody AdminResetPasswordInitRequest req){
        return adminService.initiatePasswordReset(req.getUsername());
    }

    @PostMapping("/reset-password/confirm")
    public ApiResponse resetPasswordConfirm(@RequestBody AdminResetPasswordConfirmRequest req){
        return adminService.confirmPasswordReset(req.getUsername(), req.getOtp(), req.getNewPassword());
    }

    @PostMapping("/reset-pin/initiate")
    public OtpResponse resetPinInit(@RequestBody AdminResetPinInitRequest req){
        return adminService.initiatePinReset(req.getAccountNumber());
    }

    @PostMapping("/reset-pin/confirm")
    public ApiResponse resetPinConfirm(@RequestBody AdminResetPinConfirmRequest req){
        return adminService.confirmPinReset(req.getAccountNumber(), req.getOtp(), req.getNewPin());
    }
}
