package com.musiclms.service;

import com.musiclms.dto.AuthRequest;
import com.musiclms.dto.AuthResponse;
import com.musiclms.dto.RegisterRequest;
import com.musiclms.model.entity.Role;
import com.musiclms.model.entity.User;
import com.musiclms.repository.UserRepository;
import com.musiclms.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email address is required.");
        }
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username is required.");
        }
        if (userRepository.existsByEmail(request.getEmail().trim())) {
            throw new IllegalArgumentException("Email address '" + request.getEmail().trim() + "' is already registered. Please sign in or use a different email.");
        }
        if (userRepository.existsByUsername(request.getUsername().trim())) {
            throw new IllegalArgumentException("Username '" + request.getUsername().trim() + "' is already taken. Please choose another username.");
        }

        String displayName = (request.getDisplayName() != null && !request.getDisplayName().isBlank())
                ? request.getDisplayName().trim() : request.getUsername().trim();

        User user = new User(
                request.getEmail().trim(),
                request.getUsername().trim(),
                displayName,
                passwordEncoder.encode(request.getPassword()),
                Role.ROLE_STUDENT
        );

        user = userRepository.save(user);

        String token = tokenProvider.generateTokenFromUsername(user.getUsername());
        return toAuthResponse(token, user);
    }

    public AuthResponse login(AuthRequest request) {
        String identifier = request.getUsernameOrEmail() != null ? request.getUsernameOrEmail().trim() : "";
        if (identifier.isEmpty()) {
            throw new IllegalArgumentException("Please enter your username or email address.");
        }
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Please enter your password.");
        }

        // Check user existence first to provide clear, actionable feedback
        Optional<User> userOpt = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier));

        if (userOpt.isEmpty()) {
            throw new BadCredentialsException("No account found with username or email '" + identifier + "'. Please check spelling or create an account.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(userOpt.get().getUsername(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = tokenProvider.generateToken(authentication);

            return toAuthResponse(token, userOpt.get());
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Incorrect password for account '" + identifier + "'. Please verify and try again.");
        }
    }

    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("User not found: " + username));
        String token = tokenProvider.generateTokenFromUsername(user.getUsername());
        return toAuthResponse(token, user);
    }

    public User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("User not found: " + username));
    }

    public Optional<User> getAuthenticatedUserOptional() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return Optional.empty();
        }
        return userRepository.findByUsername(auth.getName())
                .or(() -> userRepository.findByEmail(auth.getName()));
    }

    private AuthResponse toAuthResponse(String token, User user) {
        return new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole(),
                user.getTotalXp(),
                user.getCurrentLevel(),
                user.getCurrentStreakDays()
        );
    }
}
