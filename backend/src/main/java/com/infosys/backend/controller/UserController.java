package com.infosys.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.infosys.backend.model.User;
import com.infosys.backend.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
public class UserController {

    @Autowired
    private UserService userService;

    // ✅ REGISTER
    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    // ✅ LOGIN
    @PostMapping("/login")
    public User loginUser(@RequestBody User user) {

        User loggedUser = userService.loginUser(user.getEmail(), user.getPassword());

        if (loggedUser != null) {
            return loggedUser;
        } else {
            throw new RuntimeException("Invalid email or password");
        }
    }
}