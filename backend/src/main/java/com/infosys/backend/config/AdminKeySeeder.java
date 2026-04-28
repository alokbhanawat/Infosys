package com.infosys.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.infosys.backend.repository.AdminKeyRepository;
import com.infosys.backend.service.AdminKeyService;

@Component
public class AdminKeySeeder implements CommandLineRunner {

    private final AdminKeyRepository adminKeyRepository;
    private final AdminKeyService adminKeyService;

    @Value("${app.admin.seed-key:}")
    private String seedKey;

    public AdminKeySeeder(AdminKeyRepository adminKeyRepository, AdminKeyService adminKeyService) {
        this.adminKeyRepository = adminKeyRepository;
        this.adminKeyService = adminKeyService;
    }

    @Override
    public void run(String... args) {
        if (adminKeyRepository.count() == 0 && StringUtils.hasText(seedKey)) {
            adminKeyService.createAdminKey(seedKey);
        }
    }
}
