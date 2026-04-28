package com.infosys.backend.service;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.infosys.backend.dto.RegisterRequest;
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

    public String loginUser(String email, String password) {
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            boolean isMatch = passwordEncoder.matches(password, user.getPassword());

            if (isMatch) {
                return jwtUtil.generateToken(user.getEmail(), user.getName(), user.getRole().name());
            }
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }
}
