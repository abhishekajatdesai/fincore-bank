package com.fincore.bank.config;

import com.fincore.bank.repository.UserRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends GenericFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepo;

    public JwtAuthFilter(JwtUtil jwtUtil, UserRepository userRepo) {
        this.jwtUtil = jwtUtil;
        this.userRepo = userRepo;
    }

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain
    ) throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;

        String authHeader = req.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            String token = authHeader.substring(7);

            try {
                String username = jwtUtil.extractUsername(token);

                var user = userRepo.findByUsername(username);

                if (user != null) {
                    String role = jwtUtil.extractRole(token);
                    List<SimpleGrantedAuthority> authorities =
                            List.of(new SimpleGrantedAuthority("ROLE_" + role));
                    var authToken = new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            authorities
                    );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(req)
                    );

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }

            } catch (Exception e) {
                System.out.println("JWT ERROR: " + e.getMessage());
            }
        }

        chain.doFilter(request, response);
    }
}
