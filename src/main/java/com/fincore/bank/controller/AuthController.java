package com.fincore.bank.controller;
import com.fincore.bank.dto.*;
import com.fincore.bank.service.AuthService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {
    private final AuthService authService;
    public AuthController(AuthService a){this.authService=a;}
    @PostMapping("/login") public LoginResponse login(@RequestBody LoginRequest req){ return authService.login(req); }
    @PostMapping("/register") public RegisterResponse register(@RequestBody RegisterRequest req){ return authService.register(req); }
    @PostMapping("/change-password")
    public ApiResponse changePassword(@RequestBody ChangePasswordRequest req){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return authService.changePassword(username, req);
    }
}
