package com.infosys.backend.service;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.infosys.backend.dto.AuthResponse;
import com.infosys.backend.dto.MessageResponse;
import com.infosys.backend.dto.RegisterRequest;
import com.infosys.backend.dto.UpdatePasswordRequest;
import com.infosys.backend.dto.UpdateProfileRequest;
import com.infosys.backend.model.Role;
import com.infosys.backend.model.User;
import com.infosys.backend.repository.UserRepository;
import com.infosys.backend.security.JwtUtil;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AdminKeyService adminKeyService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            AdminKeyService adminKeyService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.adminKeyService = adminKeyService;
    }

    public User registerUser(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        Role assignedRole = adminKeyService.isValidAdminKey(request.getAdminKey()) ? Role.ADMIN : Role.USER;

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(assignedRole);

        return userRepository.save(user);
    }

    public AuthResponse loginUser(String email, String password) {
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            boolean isMatch = passwordEncoder.matches(password, user.getPassword());

            if (isMatch) {
                String token = jwtUtil.generateToken(user.getUserId(), user.getEmail(), user.getName(), user.getRole().name());
                return new AuthResponse(token, user.getUserId(), user.getName(), user.getEmail(), user.getRole());
            }
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    public AuthResponse updateProfile(String currentEmail, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String updatedName = normalize(request.getName());
        String updatedEmail = normalize(request.getEmail());
        String updatedPhone = normalize(request.getPhone());

        if (updatedName == null || updatedEmail == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name and email are required");
        }

        Optional<User> existingUser = userRepository.findByEmail(updatedEmail);
        if (existingUser.isPresent() && existingUser.get().getUserId() != user.getUserId()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        user.setName(updatedName);
        user.setEmail(updatedEmail);
        user.setPhone(updatedPhone);

        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(
                savedUser.getUserId(),
                savedUser.getEmail(),
                savedUser.getName(),
                savedUser.getRole().name());

        return new AuthResponse(
                token,
                savedUser.getUserId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole());
    }

    public MessageResponse updatePassword(String currentEmail, UpdatePasswordRequest request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String currentPassword = request.getCurrentPassword();
        String newPassword = request.getNewPassword();
        String confirmPassword = request.getConfirmPassword();

        if (isBlank(currentPassword) || isBlank(newPassword) || isBlank(confirmPassword)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "All password fields are required");
        }

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }

        if (newPassword.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be at least 6 characters");
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password and confirm password must match");
        }

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return new MessageResponse("Password updated successfully");
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }

        String trimmedValue = value.trim();
        return trimmedValue.isEmpty() ? null : trimmedValue;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
