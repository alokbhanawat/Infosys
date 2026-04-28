package com.infosys.backend.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.infosys.backend.model.AdminKey;
import com.infosys.backend.repository.AdminKeyRepository;

@Service
public class AdminKeyService {

    private final AdminKeyRepository adminKeyRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminKeyService(AdminKeyRepository adminKeyRepository, PasswordEncoder passwordEncoder) {
        this.adminKeyRepository = adminKeyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean isValidAdminKey(String rawAdminKey) {
        if (!StringUtils.hasText(rawAdminKey)) {
            return false;
        }

        List<AdminKey> activeKeys = adminKeyRepository.findByActiveTrue();
        return activeKeys.stream()
                .map(AdminKey::getKeyHash)
                .anyMatch(hash -> passwordEncoder.matches(rawAdminKey, hash));
    }

    public AdminKey createAdminKey(String rawAdminKey) {
        AdminKey adminKey = new AdminKey(passwordEncoder.encode(rawAdminKey), true);
        return adminKeyRepository.save(adminKey);
    }
}
