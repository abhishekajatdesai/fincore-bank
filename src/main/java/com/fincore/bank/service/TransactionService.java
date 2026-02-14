package com.fincore.bank.service;
import com.fincore.bank.dto.TransactionRequest;
import com.fincore.bank.dto.TransactionView;
import com.fincore.bank.entity.*;
import com.fincore.bank.repository.*;
import com.fincore.bank.util.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TransactionService {
    private final AccountRepository accountRepo;
    private final TransactionRepository txRepo;
    private final AuditLogRepository auditRepo;
    private final UserRepository userRepo;
    public TransactionService(AccountRepository a, TransactionRepository t, AuditLogRepository auditRepo, UserRepository userRepo){
        this.accountRepo=a;this.txRepo=t;this.auditRepo=auditRepo;this.userRepo=userRepo;
    }

    @Transactional
    public boolean deposit(TransactionRequest req){
        enforceOwnership(req.getFromAccount());
        var acc = accountRepo.findById(req.getFromAccount()).orElse(null); if(acc==null) throw new RuntimeException("Account not found");
        acc.setBalance(acc.getBalance()+req.getAmount()); accountRepo.save(acc);
        Transaction tx = new Transaction(); tx.setAccountNumber(req.getFromAccount()); tx.setTxType("DEPOSIT"); tx.setAmount(req.getAmount()); tx.setDescription("Cash deposit");
        txRepo.save(tx);
        AuditLog log = new AuditLog();
        log.setAction("Deposit");
        log.setActor(SecurityContextHolder.getContext().getAuthentication().getName());
        log.setStatus("Success");
        log.setDetail("Account " + req.getFromAccount() + " amount " + req.getAmount());
        auditRepo.save(log);
        return true;
    }

    @Transactional
    public boolean withdraw(TransactionRequest req){
        enforceOwnership(req.getFromAccount());
        var acc = accountRepo.findById(req.getFromAccount()).orElse(null); if(acc==null) throw new RuntimeException("Account not found");
        if(!acc.getPin().equals(SecurityUtil.sha256(req.getPin()))) throw new RuntimeException("Invalid PIN");
        if(acc.getBalance()<req.getAmount()) throw new RuntimeException("Insufficient balance");
        acc.setBalance(acc.getBalance()-req.getAmount()); accountRepo.save(acc);
        Transaction tx = new Transaction(); tx.setAccountNumber(req.getFromAccount()); tx.setTxType("WITHDRAW"); tx.setAmount(req.getAmount()); tx.setDescription("Cash withdrawal");
        txRepo.save(tx);
        AuditLog log = new AuditLog();
        log.setAction("Withdraw");
        log.setActor(SecurityContextHolder.getContext().getAuthentication().getName());
        log.setStatus("Success");
        log.setDetail("Account " + req.getFromAccount() + " amount " + req.getAmount());
        auditRepo.save(log);
        return true;
    }

    @Transactional
    public boolean transfer(TransactionRequest req){
        enforceOwnership(req.getFromAccount());
        var from = accountRepo.findById(req.getFromAccount()).orElse(null); var to = accountRepo.findById(req.getToAccount()).orElse(null);
        if(from==null || to==null) throw new RuntimeException("Account not found");
        if(!from.getPin().equals(SecurityUtil.sha256(req.getPin()))) throw new RuntimeException("Invalid PIN");
        if(from.getBalance()<req.getAmount()) throw new RuntimeException("Insufficient balance");
        from.setBalance(from.getBalance()-req.getAmount()); to.setBalance(to.getBalance()+req.getAmount());
        accountRepo.save(from); accountRepo.save(to);
        Transaction t1 = new Transaction(); t1.setAccountNumber(req.getFromAccount()); t1.setTxType("TRANSFER_OUT"); t1.setAmount(req.getAmount()); t1.setDescription("Transfer to "+req.getToAccount());
        Transaction t2 = new Transaction(); t2.setAccountNumber(req.getToAccount()); t2.setTxType("TRANSFER_IN"); t2.setAmount(req.getAmount()); t2.setDescription("Transfer from "+req.getFromAccount());
        txRepo.save(t1); txRepo.save(t2);
        AuditLog log = new AuditLog();
        log.setAction("Transfer executed");
        log.setActor(SecurityContextHolder.getContext().getAuthentication().getName());
        log.setStatus("Success");
        log.setDetail("From " + req.getFromAccount() + " to " + req.getToAccount() + " amount " + req.getAmount());
        auditRepo.save(log);
        return true;
    }

    private void enforceOwnership(Long fromAccount) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) return;
        var user = userRepo.findByUsername(auth.getName());
        if (user == null || user.getAccountNumber() == null || !user.getAccountNumber().equals(fromAccount)) {
            throw new RuntimeException("Access denied");
        }
    }

    public List<Transaction> getTransactions(Long accNo){
        return txRepo.findByAccountNumberOrderByTransactionIdDesc(accNo);
    }

    public List<TransactionView> getTransactionViews(Long accNo){
        List<Transaction> txs = getTransactions(accNo);
        return txs.stream().map(tx -> {
            String accountName = getAccountName(tx.getAccountNumber());
            Long counterpartyAcc = extractCounterparty(tx.getDescription());
            String counterpartyName = counterpartyAcc == null ? null : getAccountName(counterpartyAcc);
            return new TransactionView(
                    tx.getTransactionId(),
                    tx.getAccountNumber(),
                    accountName,
                    tx.getTxType(),
                    tx.getAmount(),
                    tx.getTxTime(),
                    tx.getDescription(),
                    counterpartyAcc,
                    counterpartyName
            );
        }).toList();
    }

    private String getAccountName(Long accNo) {
        if (accNo == null) return null;
        return accountRepo.findById(accNo)
                .map(acc -> acc.getCustomer() != null ? acc.getCustomer().getName() : null)
                .orElse(null);
    }

    private Long extractCounterparty(String description) {
        if (description == null) return null;
        Pattern p = Pattern.compile("(\\d{6,})");
        Matcher m = p.matcher(description);
        if (m.find()) {
            try {
                return Long.parseLong(m.group(1));
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }
}
