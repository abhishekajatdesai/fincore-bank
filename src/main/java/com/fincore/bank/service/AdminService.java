package com.fincore.bank.service;
import com.fincore.bank.dto.AccountSummaryResponse;
import com.fincore.bank.dto.AdminStatsResponse;
import com.fincore.bank.dto.LoanApprovalRequest;
import com.fincore.bank.dto.LoanRejectRequest;
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
    private final LoanAccountRepository loanRepo;
    private final Map<String, OtpEntry> passwordOtps = new ConcurrentHashMap<>();
    private final Map<Long, OtpEntry> pinOtps = new ConcurrentHashMap<>();
    public AdminService(
            CustomerRepository cr,
            AccountRepository ar,
            UserRepository ur,
            TransactionRepository tr,
            AuditLogRepository auditRepo,
            LoanAccountRepository loanRepo
    ){
        this.customerRepo=cr;
        this.accountRepo=ar;
        this.userRepo=ur;
        this.txRepo=tr;
        this.auditRepo=auditRepo;
        this.loanRepo=loanRepo;
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

    public List<LoanAccount> getPendingLoanRequests() {
        return loanRepo.findByStatusOrderByIdDesc(LoanAccount.Status.PENDING);
    }

    @Transactional
    public LoanAccount approveLoan(int loanId, LoanApprovalRequest req, String actor) {
        LoanAccount loan = loanRepo.findById(loanId).orElseThrow(() -> new RuntimeException("Loan request not found"));
        if (loan.getStatus() != LoanAccount.Status.PENDING) {
            throw new RuntimeException("Only pending loan can be approved");
        }
        if (req.getInterestRate() <= 0) throw new RuntimeException("Interest rate must be greater than zero");

        int tenure = req.getTenureMonths() != null && req.getTenureMonths() > 0 ? req.getTenureMonths() : loan.getTenureMonths();
        double emi = calculateEmi(loan.getPrincipalAmount(), req.getInterestRate(), tenure);

        loan.setInterestRate(req.getInterestRate());
        loan.setTenureMonths(tenure);
        loan.setEmiAmount(Math.round(emi * 100.0) / 100.0);
        if (loan.getOutstandingAmount() <= 0) {
            loan.setOutstandingAmount(loan.getPrincipalAmount());
        }
        if (loan.getTotalRepaid() < 0) {
            loan.setTotalRepaid(0);
        }
        loan.setStatus(LoanAccount.Status.APPROVED);
        loan.setApprovedAt(new Timestamp(System.currentTimeMillis()));
        loan.setApprovedBy(actor);
        loan.setDecisionNote(req.getNote());
        loanRepo.save(loan);

        Account acc = accountRepo.findById(loan.getAccountNumber()).orElseThrow(() -> new RuntimeException("Account not found"));
        acc.setBalance(acc.getBalance() + loan.getPrincipalAmount());
        accountRepo.save(acc);

        Transaction tx = new Transaction();
        tx.setAccountNumber(loan.getAccountNumber());
        tx.setTxType("LOAN_CREDIT");
        tx.setAmount(loan.getPrincipalAmount());
        tx.setDescription("Loan approved and disbursed, loanId=" + loan.getId());
        txRepo.save(tx);

        AuditLog log = new AuditLog();
        log.setAction("Loan approved");
        log.setActor(actor);
        log.setStatus("Success");
        log.setDetail("Loan " + loan.getId() + " approved for account " + loan.getAccountNumber());
        auditRepo.save(log);
        return loan;
    }

    @Transactional
    public LoanAccount rejectLoan(int loanId, LoanRejectRequest req, String actor) {
        LoanAccount loan = loanRepo.findById(loanId).orElseThrow(() -> new RuntimeException("Loan request not found"));
        if (loan.getStatus() != LoanAccount.Status.PENDING) {
            throw new RuntimeException("Only pending loan can be rejected");
        }
        loan.setStatus(LoanAccount.Status.REJECTED);
        loan.setApprovedAt(new Timestamp(System.currentTimeMillis()));
        loan.setApprovedBy(actor);
        loan.setDecisionNote(req.getNote());
        loanRepo.save(loan);

        AuditLog log = new AuditLog();
        log.setAction("Loan rejected");
        log.setActor(actor);
        log.setStatus("Success");
        log.setDetail("Loan " + loan.getId() + " rejected for account " + loan.getAccountNumber());
        auditRepo.save(log);
        return loan;
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

    private double calculateEmi(double principal, double annualRate, int months) {
        double monthlyRate = annualRate / 1200.0;
        if (monthlyRate == 0) return principal / months;
        double factor = Math.pow(1 + monthlyRate, months);
        return principal * monthlyRate * factor / (factor - 1);
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
