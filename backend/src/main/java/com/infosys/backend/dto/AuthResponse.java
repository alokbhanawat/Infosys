package com.infosys.backend.dto;

import com.infosys.backend.model.Role;

public class AuthResponse {

    private final String token;
    private final int userId;
    private final String name;
    private final String email;
    private final Role role;

    public AuthResponse(String token, int userId, String name, String email, Role role) {
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public int getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }
}
