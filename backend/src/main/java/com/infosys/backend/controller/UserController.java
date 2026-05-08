package com.infosys.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.security.Principal;

import com.infosys.backend.dto.AuthResponse;
import com.infosys.backend.dto.LoginRequest;
import com.infosys.backend.dto.RegisterRequest;
import com.infosys.backend.dto.UserResponse;
import com.infosys.backend.service.CurrentUserService;
import com.infosys.backend.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
public class UserController {

    private final UserService userService;
    private final CurrentUserService currentUserService;

    public UserController(UserService userService, CurrentUserService currentUserService) {
        this.userService = userService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/register")
    public UserResponse registerUser(@RequestBody RegisterRequest request) {
        return new UserResponse(userService.registerUser(request));
    }

    @PostMapping("/login")
    public AuthResponse loginUser(@RequestBody LoginRequest request) {
        return userService.loginUser(request.getEmail(), request.getPassword());
    }

    @GetMapping("/products")
    public String getProfile() {
        return "Protected API working ";
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser(Principal principal) {
        return currentUserService.getCurrentUser(principal.getName());
    }
}
