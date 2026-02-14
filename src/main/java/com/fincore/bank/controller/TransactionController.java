package com.fincore.bank.controller;
import com.fincore.bank.dto.TransactionRequest;
import com.fincore.bank.dto.TransactionView;
import com.fincore.bank.entity.Transaction;
import com.fincore.bank.repository.UserRepository;
import com.fincore.bank.service.TransactionService;
import com.fincore.bank.service.PdfService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.List;

@RestController
@RequestMapping("/api/transaction")
@CrossOrigin
public class TransactionController {
    private final TransactionService txService;
    private final PdfService pdfService;
    private final UserRepository userRepo;
    public TransactionController(TransactionService t, PdfService p, UserRepository userRepo){
        this.txService=t;this.pdfService=p;this.userRepo=userRepo;
    }

    @PostMapping("/deposit") public boolean deposit(@RequestBody TransactionRequest req){ return txService.deposit(req); }
    @PostMapping("/withdraw") public boolean withdraw(@RequestBody TransactionRequest req){ return txService.withdraw(req); }
    @PostMapping("/transfer") public boolean transfer(@RequestBody TransactionRequest req){ return txService.transfer(req); }
    @GetMapping("/history/{accNo}")
    public List<TransactionView> history(@PathVariable Long accNo){
        enforceOwnership(accNo);
        return txService.getTransactionViews(accNo);
    }
    @GetMapping("/statement/{accNo}")
    public ResponseEntity<byte[]> statement(@PathVariable Long accNo, @RequestParam(defaultValue="10") int limit) throws Exception {
        enforceOwnership(accNo);
        List<Transaction> all = txService.getTransactions(accNo);
        List<Transaction> t = all.subList(0, Math.min(limit, all.size()));
        byte[] pdf = pdfService.generateStatement(accNo, t);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Statement_" + accNo + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    private void enforceOwnership(Long accNo) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) return;
        String username = auth.getName();
        var user = userRepo.findByUsername(username);
        if (user == null || user.getAccountNumber() == null || !user.getAccountNumber().equals(accNo)) {
            throw new RuntimeException("Access denied");
        }
    }
}
