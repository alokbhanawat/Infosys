package com.infosys.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.backend.dto.AuthResponse;
import com.infosys.backend.dto.LoginRequest;
import com.infosys.backend.dto.RegisterRequest;
import com.infosys.backend.dto.UserResponse;
import com.infosys.backend.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public UserResponse registerUser(@RequestBody RegisterRequest request) {
        return new UserResponse(userService.registerUser(request));
    }

    @PostMapping("/login")
    public AuthResponse loginUser(@RequestBody LoginRequest request) {
        return new AuthResponse(userService.loginUser(request.getEmail(), request.getPassword()));
    }

    @GetMapping("/dashboard")
    public String getProfile() {
        return "Protected API working ";
    }
}
