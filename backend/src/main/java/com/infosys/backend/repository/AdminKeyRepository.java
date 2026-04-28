package com.infosys.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infosys.backend.model.AdminKey;

public interface AdminKeyRepository extends JpaRepository<AdminKey, Long> {
    List<AdminKey> findByActiveTrue();
}
