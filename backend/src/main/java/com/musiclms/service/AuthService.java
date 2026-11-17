package com.musiclms.service;

import com.musiclms.dto.AuthRequest;
import com.musiclms.dto.AuthResponse;
import com.musiclms.dto.RegisterRequest;
import com.musiclms.model.entity.Role;
import com.musiclms.model.entity.User;
import com.musiclms.repository.UserRepository;
import com.musiclms.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
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
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }

        String displayName = (request.getDisplayName() != null && !request.getDisplayName().isBlank())
                ? request.getDisplayName() : request.getUsername();

        User user = new User(
                request.getEmail(),
                request.getUsername(),
                displayName,
                passwordEncoder.encode(request.getPassword()),
                Role.ROLE_STUDENT
        );

        user = userRepository.save(user);

        String token = tokenProvider.generateTokenFromUsername(user.getUsername());
        return toAuthResponse(token, user);
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(authentication.getName())
                .or(() -> userRepository.findByEmail(authentication.getName()))
                .orElseThrow(() -> new IllegalStateException("User not found"));

        return toAuthResponse(token, user);
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
