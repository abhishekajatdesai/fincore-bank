package com.fincore.bank.service;
import com.fincore.bank.dto.AccountSummaryResponse;
import com.fincore.bank.dto.AdminStatsResponse;
import com.fincore.bank.dto.ApiResponse;
import com.fincore.bank.dto.CreateCustomerRequest;
import com.fincore.bank.dto.OtpResponse;
import com.fincore.bank.entity.*;
import com.fincore.bank.repository.*;
import com.fincore.bank.util.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {
    private final CustomerRepository customerRepo;
    private final AccountRepository accountRepo;
    private final UserRepository userRepo;
    private final TransactionRepository txRepo;
    private final AuditLogRepository auditRepo;
    private final Map<String, OtpEntry> passwordOtps = new ConcurrentHashMap<>();
    private final Map<Long, OtpEntry> pinOtps = new ConcurrentHashMap<>();
    public AdminService(CustomerRepository cr, AccountRepository ar, UserRepository ur, TransactionRepository tr, AuditLogRepository auditRepo){
        this.customerRepo=cr;this.accountRepo=ar;this.userRepo=ur;this.txRepo=tr;this.auditRepo=auditRepo;
    }

    @Transactional
    public Long createCustomerAndAccount(CreateCustomerRequest req, String actor){
        Customer c = new Customer();
        c.setName(req.getName()); c.setEmail(req.getEmail()); c.setPhone(req.getPhone()); c.setAddress(req.getAddress());
        customerRepo.save(c);

        Long accNo = System.currentTimeMillis();
        Account acc = new Account();
        acc.setAccountNumber(accNo); acc.setCustomer(c); acc.setAccountType(req.getAccountType()); acc.setBalance(0);
        acc.setPin(SecurityUtil.sha256(req.getPin()));
        accountRepo.save(acc);

        User u = new User();
        u.setUsername("cust"+accNo); u.setPasswordHash(SecurityUtil.sha256(req.getPin()));
        u.setRole(User.Role.CUSTOMER); u.setAccountNumber(accNo);
        userRepo.save(u);
        AuditLog log = new AuditLog();
        log.setAction("Customer created");
        log.setActor(actor);
        log.setStatus("Success");
        log.setDetail("Created account " + accNo);
        auditRepo.save(log);
        return accNo;
    }

    public List<AccountSummaryResponse> searchAccounts(String query){
        String q = query == null ? "" : query;
        List<Account> accounts = q.isBlank()
                ? accountRepo.findAll()
                : accountRepo.findByCustomerNameContainingIgnoreCaseOrCustomerEmailContainingIgnoreCaseOrCustomerPhoneContainingIgnoreCase(q, q, q);
        return accounts
                .stream()
                .map(acc -> new AccountSummaryResponse(
                        acc.getAccountNumber(),
                        acc.getCustomer().getName(),
                        acc.getCustomer().getEmail(),
                        acc.getCustomer().getPhone(),
                        acc.getCustomer().getAddress(),
                        acc.getAccountType(),
                        acc.getBalance()
                ))
                .collect(Collectors.toList());
    }

    public AdminStatsResponse getStats(){
        LocalDate today = LocalDate.now(ZoneId.systemDefault());
        Timestamp start = Timestamp.valueOf(today.atStartOfDay());
        Timestamp end = Timestamp.valueOf(today.plusDays(1).atStartOfDay());
        long totalCustomers = customerRepo.count();
        long totalAccounts = accountRepo.count();
        long todayTransactions = txRepo.countByTxTimeBetween(start, end);
        long todayTransfers = txRepo.countByTxTypeInAndTxTimeBetween(List.of("TRANSFER_IN","TRANSFER_OUT"), start, end);
        double totalBalance = accountRepo.sumBalances();
        return new AdminStatsResponse(totalCustomers, totalAccounts, todayTransactions, todayTransfers, totalBalance);
    }

    public List<AuditLog> getAuditLogs(){
        return auditRepo.findTop50ByOrderByCreatedAtDesc();
    }

    public OtpResponse initiatePasswordReset(String username){
        User user = userRepo.findByUsername(username);
        if(user==null){
            return new OtpResponse(false, "User not found", null);
        }
        String otp = generateOtp();
        passwordOtps.put(username, new OtpEntry(otp, System.currentTimeMillis() + 5 * 60_000));
        return new OtpResponse(true, "OTP generated (simulated)", otp);
    }

    public ApiResponse confirmPasswordReset(String username, String otp, String newPassword){
        OtpEntry entry = passwordOtps.get(username);
        if(entry==null || entry.isExpired()){
            return new ApiResponse(false, "OTP expired or not found");
        }
        if(!entry.code.equals(otp)){
            return new ApiResponse(false, "Invalid OTP");
        }
        User user = userRepo.findByUsername(username);
        if(user==null) return new ApiResponse(false, "User not found");
        user.setPasswordHash(SecurityUtil.sha256(newPassword));
        userRepo.save(user);
        passwordOtps.remove(username);
        return new ApiResponse(true, "Password reset successful");
    }

    public OtpResponse initiatePinReset(Long accNo){
        Account acc = accountRepo.findById(accNo).orElse(null);
        if(acc==null){
            return new OtpResponse(false, "Account not found", null);
        }
        String otp = generateOtp();
        pinOtps.put(accNo, new OtpEntry(otp, System.currentTimeMillis() + 5 * 60_000));
        return new OtpResponse(true, "OTP generated (simulated)", otp);
    }

    public ApiResponse confirmPinReset(Long accNo, String otp, String newPin){
        OtpEntry entry = pinOtps.get(accNo);
        if(entry==null || entry.isExpired()){
            return new ApiResponse(false, "OTP expired or not found");
        }
        if(!entry.code.equals(otp)){
            return new ApiResponse(false, "Invalid OTP");
        }
        Account acc = accountRepo.findById(accNo).orElse(null);
        if(acc==null) return new ApiResponse(false, "Account not found");
        acc.setPin(SecurityUtil.sha256(newPin));
        accountRepo.save(acc);
        pinOtps.remove(accNo);
        return new ApiResponse(true, "PIN reset successful");
    }

    private String generateOtp(){
        int code = ThreadLocalRandom.current().nextInt(100000, 999999);
        return String.valueOf(code);
    }

    private static class OtpEntry {
        private final String code;
        private final long expiresAt;
        private OtpEntry(String code, long expiresAt){
            this.code = code;
            this.expiresAt = expiresAt;
        }
        private boolean isExpired(){
            return System.currentTimeMillis() > expiresAt;
        }
    }
}
