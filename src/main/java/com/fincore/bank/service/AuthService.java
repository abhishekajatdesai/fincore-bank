package com.fincore.bank.service;
import com.fincore.bank.dto.*;
import com.fincore.bank.entity.Account;
import com.fincore.bank.entity.Customer;
import com.fincore.bank.entity.User;
import com.fincore.bank.repository.AccountRepository;
import com.fincore.bank.repository.CustomerRepository;
import com.fincore.bank.repository.UserRepository;
import com.fincore.bank.config.JwtUtil;
import com.fincore.bank.util.SecurityUtil;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepo;
    private final CustomerRepository customerRepo;
    private final AccountRepository accountRepo;
    private final JwtUtil jwtUtil;
    public AuthService(UserRepository userRepo, CustomerRepository customerRepo, AccountRepository accountRepo, JwtUtil jwtUtil){
        this.userRepo=userRepo;this.customerRepo=customerRepo;this.accountRepo=accountRepo;this.jwtUtil=jwtUtil;
    }

    public LoginResponse login(LoginRequest req){
        User user = userRepo.findByUsername(req.getUsername());
        if(user==null) return new LoginResponse(false, null, null, null, "User not found");
        String hashed = SecurityUtil.sha256(req.getPassword());
        if(!hashed.equals(user.getPasswordHash())) return new LoginResponse(false, null, null, null, "Invalid credentials");
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return new LoginResponse(true, user.getRole().name(), user.getAccountNumber(), token, "Login successful");
    }

    @Transactional
    public RegisterResponse register(RegisterRequest req){
        if(req.getEmail()==null || req.getPassword()==null || req.getPin()==null){
            return new RegisterResponse(false, null, null, "Email, password, and PIN are required");
        }
        if(customerRepo.findByEmail(req.getEmail())!=null){
            return new RegisterResponse(false, null, null, "Email already exists");
        }
        if(userRepo.findByUsername(req.getEmail())!=null){
            return new RegisterResponse(false, null, null, "Username already exists");
        }
        Customer c = new Customer();
        c.setName(req.getName()); c.setEmail(req.getEmail()); c.setPhone(req.getPhone()); c.setAddress(req.getAddress());
        customerRepo.save(c);

        Long accNo = System.currentTimeMillis();
        Account acc = new Account();
        acc.setAccountNumber(accNo); acc.setCustomer(c); acc.setAccountType(req.getAccountType()); acc.setBalance(0);
        acc.setPin(SecurityUtil.sha256(req.getPin()));
        accountRepo.save(acc);

        User u = new User();
        u.setUsername(req.getEmail());
        u.setPasswordHash(SecurityUtil.sha256(req.getPassword()));
        u.setRole(User.Role.CUSTOMER);
        u.setAccountNumber(accNo);
        userRepo.save(u);

        return new RegisterResponse(true, u.getUsername(), accNo, "Registration successful");
    }

    public ApiResponse changePassword(String username, ChangePasswordRequest req){
        User user = userRepo.findByUsername(username);
        if(user==null) return new ApiResponse(false, "User not found");
        String hashed = SecurityUtil.sha256(req.getOldPassword());
        if(!hashed.equals(user.getPasswordHash())) return new ApiResponse(false, "Old password is incorrect");
        user.setPasswordHash(SecurityUtil.sha256(req.getNewPassword()));
        userRepo.save(user);
        return new ApiResponse(true, "Password updated");
    }
}
