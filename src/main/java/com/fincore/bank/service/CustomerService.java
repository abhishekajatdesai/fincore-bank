package com.fincore.bank.service;

import com.fincore.bank.dto.AccountResponse;
import com.fincore.bank.dto.ApiResponse;
import com.fincore.bank.dto.ChangePinRequest;
import com.fincore.bank.dto.CreateFixedDepositRequest;
import com.fincore.bank.dto.LoanApplicationRequest;
import com.fincore.bank.dto.LoanRepaymentRequest;
import com.fincore.bank.dto.UpdateCustomerProfileRequest;
import com.fincore.bank.entity.Account;
import com.fincore.bank.entity.Customer;
import com.fincore.bank.entity.FixedDeposit;
import com.fincore.bank.entity.LoanAccount;
import com.fincore.bank.entity.Transaction;
import com.fincore.bank.entity.User;
import com.fincore.bank.repository.AccountRepository;
import com.fincore.bank.repository.CustomerRepository;
import com.fincore.bank.repository.FixedDepositRepository;
import com.fincore.bank.repository.LoanAccountRepository;
import com.fincore.bank.repository.TransactionRepository;
import com.fincore.bank.repository.UserRepository;
import com.fincore.bank.util.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
public class CustomerService {
    private final UserRepository userRepo;
    private final AccountRepository accountRepo;
    private final CustomerRepository customerRepo;
    private final TransactionRepository txRepo;
    private final FixedDepositRepository fdRepo;
    private final LoanAccountRepository loanRepo;
    private final PdfService pdfService;

    public CustomerService(
            UserRepository userRepo,
            AccountRepository accountRepo,
            CustomerRepository customerRepo,
            TransactionRepository txRepo,
            FixedDepositRepository fdRepo,
            LoanAccountRepository loanRepo,
            PdfService pdfService
    ){
        this.userRepo=userRepo;
        this.accountRepo=accountRepo;
        this.customerRepo=customerRepo;
        this.txRepo=txRepo;
        this.fdRepo=fdRepo;
        this.loanRepo=loanRepo;
        this.pdfService=pdfService;
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
        Long accountNumber = requireCustomerAccount(username);
        List<Transaction> all = txRepo.findByAccountNumberOrderByTransactionIdDesc(accountNumber);
        return all.subList(0, Math.min(limit, all.size()));
    }

    @Transactional
    public FixedDeposit createFixedDeposit(String username, CreateFixedDepositRequest req){
        Long accountNumber = requireCustomerAccount(username);
        if (req.getAmount() <= 0) throw new RuntimeException("FD amount must be greater than zero");
        if (req.getTenureMonths() <= 0) throw new RuntimeException("FD tenure must be greater than zero");
        Account acc = accountRepo.findById(accountNumber).orElseThrow(() -> new RuntimeException("Account not found"));
        if (acc.getBalance() < req.getAmount()) throw new RuntimeException("Insufficient balance for fixed deposit");

        acc.setBalance(acc.getBalance() - req.getAmount());
        accountRepo.save(acc);

        double rate = fdRate(req.getTenureMonths());
        double maturity = req.getAmount() + (req.getAmount() * rate * req.getTenureMonths() / 1200.0);
        FixedDeposit fd = new FixedDeposit();
        fd.setAccountNumber(accountNumber);
        fd.setPrincipalAmount(req.getAmount());
        fd.setInterestRate(rate);
        fd.setTenureMonths(req.getTenureMonths());
        fd.setMaturityAmount(Math.round(maturity * 100.0) / 100.0);
        fd.setMaturityDate(java.time.LocalDate.now().plusMonths(req.getTenureMonths()));
        fdRepo.save(fd);

        Transaction tx = new Transaction();
        tx.setAccountNumber(accountNumber);
        tx.setTxType("FD_BOOK");
        tx.setAmount(req.getAmount());
        tx.setDescription("Fixed deposit created, tenure " + req.getTenureMonths() + " months");
        txRepo.save(tx);
        return fd;
    }

    public List<FixedDeposit> getFixedDeposits(String username){
        Long accountNumber = requireCustomerAccount(username);
        return fdRepo.findByAccountNumberOrderByIdDesc(accountNumber);
    }

    @Transactional
    public LoanAccount applyLoan(String username, LoanApplicationRequest req){
        Long accountNumber = requireCustomerAccount(username);
        if (req.getAmount() <= 0) throw new RuntimeException("Loan amount must be greater than zero");
        if (req.getTenureMonths() <= 0) throw new RuntimeException("Loan tenure must be greater than zero");
        if (req.getLoanType() == null || req.getLoanType().isBlank()) throw new RuntimeException("Loan type is required");

        LoanAccount loan = new LoanAccount();
        loan.setAccountNumber(accountNumber);
        loan.setLoanType(req.getLoanType().trim().toUpperCase());
        loan.setPrincipalAmount(req.getAmount());
        loan.setTenureMonths(req.getTenureMonths());
        loan.setInterestRate(0);
        loan.setEmiAmount(0);
        loan.setOutstandingAmount(req.getAmount());
        loan.setTotalRepaid(0);
        loan.setStatus(LoanAccount.Status.PENDING);
        return loanRepo.save(loan);
    }

    public List<LoanAccount> getLoans(String username){
        Long accountNumber = requireCustomerAccount(username);
        return loanRepo.findByAccountNumberOrderByIdDesc(accountNumber);
    }

    @Transactional
    public ApiResponse breakFixedDeposit(String username, int fdId) {
        Long accountNumber = requireCustomerAccount(username);
        FixedDeposit fd = fdRepo.findById(fdId).orElseThrow(() -> new RuntimeException("Fixed deposit not found"));
        if (!fd.getAccountNumber().equals(accountNumber)) {
            throw new RuntimeException("Access denied");
        }
        if (fd.getStatus() != FixedDeposit.Status.ACTIVE) {
            throw new RuntimeException("Fixed deposit is already closed");
        }

        Account account = accountRepo.findById(accountNumber).orElseThrow(() -> new RuntimeException("Account not found"));
        int totalDays = Math.max(1, fd.getTenureMonths() * 30);
        Instant createdAt = fd.getCreatedAt() == null ? Instant.now() : fd.getCreatedAt().toInstant();
        long elapsedDays = Math.max(0, Duration.between(createdAt, Instant.now()).toDays());
        long interestDays = Math.min(totalDays, elapsedDays);
        double accruedInterest = fd.getPrincipalAmount() * fd.getInterestRate() * interestDays / 36500.0;
        double creditedAmount = round2(fd.getPrincipalAmount() + accruedInterest);

        account.setBalance(round2(account.getBalance() + creditedAmount));
        accountRepo.save(account);

        fd.setStatus(FixedDeposit.Status.CLOSED);
        fd.setMaturityDate(LocalDate.now());
        fdRepo.save(fd);

        Transaction tx = new Transaction();
        tx.setAccountNumber(accountNumber);
        tx.setTxType("FD_BREAK_CREDIT");
        tx.setAmount(creditedAmount);
        tx.setDescription("FD " + fd.getId() + " broken. Principal+interest credited");
        txRepo.save(tx);

        return new ApiResponse(true, "FD broken successfully. Credited amount: " + creditedAmount);
    }

    @Transactional
    public ApiResponse repayLoan(String username, int loanId, LoanRepaymentRequest req) {
        Long accountNumber = requireCustomerAccount(username);
        if (req.getAmount() <= 0) throw new RuntimeException("Repayment amount must be greater than zero");
        LoanAccount loan = loanRepo.findById(loanId).orElseThrow(() -> new RuntimeException("Loan not found"));
        if (!loan.getAccountNumber().equals(accountNumber)) {
            throw new RuntimeException("Access denied");
        }
        if (loan.getStatus() != LoanAccount.Status.APPROVED) {
            throw new RuntimeException("Only approved loan can be repaid");
        }

        Account account = accountRepo.findById(accountNumber).orElseThrow(() -> new RuntimeException("Account not found"));
        if (!account.getPin().equals(SecurityUtil.sha256(req.getPin()))) {
            throw new RuntimeException("Invalid PIN");
        }

        double outstanding = loan.getOutstandingAmount() <= 0 ? loan.getPrincipalAmount() : loan.getOutstandingAmount();
        double repayment = Math.min(req.getAmount(), outstanding);
        if (account.getBalance() < repayment) throw new RuntimeException("Insufficient balance for repayment");

        account.setBalance(round2(account.getBalance() - repayment));
        accountRepo.save(account);

        loan.setOutstandingAmount(round2(outstanding - repayment));
        loan.setTotalRepaid(round2(loan.getTotalRepaid() + repayment));
        loan.setLastPaymentAt(new Timestamp(System.currentTimeMillis()));
        if (loan.getOutstandingAmount() <= 0) {
            loan.setOutstandingAmount(0);
            loan.setStatus(LoanAccount.Status.CLOSED);
            if (loan.getDecisionNote() == null || loan.getDecisionNote().isBlank()) {
                loan.setDecisionNote("Loan closed after full repayment");
            }
        }
        loanRepo.save(loan);

        Transaction tx = new Transaction();
        tx.setAccountNumber(accountNumber);
        tx.setTxType("LOAN_REPAY");
        tx.setAmount(repayment);
        tx.setDescription("Loan repayment for loanId=" + loan.getId());
        txRepo.save(tx);

        return new ApiResponse(true, "Repayment successful. Remaining outstanding: " + loan.getOutstandingAmount());
    }

    public byte[] downloadFixedDepositReceipt(String username, int fdId) throws Exception {
        Long accountNumber = requireCustomerAccount(username);
        FixedDeposit fd = fdRepo.findById(fdId).orElseThrow(() -> new RuntimeException("Fixed deposit not found"));
        if (!fd.getAccountNumber().equals(accountNumber)) {
            throw new RuntimeException("Access denied");
        }
        Account account = accountRepo.findById(accountNumber).orElseThrow(() -> new RuntimeException("Account not found"));
        return pdfService.generateFixedDepositReceipt(fd, account, account.getCustomer());
    }

    public byte[] downloadLoanSummary(String username, int loanId) throws Exception {
        Long accountNumber = requireCustomerAccount(username);
        LoanAccount loan = loanRepo.findById(loanId).orElseThrow(() -> new RuntimeException("Loan not found"));
        if (!loan.getAccountNumber().equals(accountNumber)) {
            throw new RuntimeException("Access denied");
        }
        Account account = accountRepo.findById(accountNumber).orElseThrow(() -> new RuntimeException("Account not found"));
        return pdfService.generateLoanSummary(loan, account, account.getCustomer());
    }

    private Long requireCustomerAccount(String username) {
        User user = userRepo.findByUsername(username);
        if(user==null || user.getAccountNumber()==null){
            throw new RuntimeException("Customer account not found");
        }
        return user.getAccountNumber();
    }

    private double fdRate(int tenureMonths) {
        if (tenureMonths <= 12) return 6.5;
        if (tenureMonths <= 24) return 7.0;
        return 7.5;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
