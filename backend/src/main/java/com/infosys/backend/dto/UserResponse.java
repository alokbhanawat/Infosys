package com.infosys.backend.dto;

import com.infosys.backend.model.Role;
import com.infosys.backend.model.User;

public class UserResponse {

    private final int userId;
    private final String name;
    private final String email;
    private final String phone;
    private final Role role;

    public UserResponse(User user) {
        this.userId = user.getUserId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.role = user.getRole();
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

    public String getPhone() {
        return phone;
    }

    public Role getRole() {
        return role;
    }
}
