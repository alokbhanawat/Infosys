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

    // ✅ LOGIN (UPDATED)
   @PostMapping("/login")
public String loginUser(@RequestBody User user) {
    System.out.println("EMAIL: " + user.getEmail());
    System.out.println("PASSWORD: " + user.getPassword());

    return userService.loginUser(user.getEmail(), user.getPassword());
}

@GetMapping("/profile")
public String getProfile() {
    return "Protected API working ✅";
}


}