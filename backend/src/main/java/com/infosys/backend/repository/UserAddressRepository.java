package com.infosys.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infosys.backend.model.UserAddress;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {
    List<UserAddress> findByUser_EmailOrderByDefaultAddressDescIdDesc(String email);
    Optional<UserAddress> findByIdAndUser_Email(Long id, String email);
    Optional<UserAddress> findFirstByUser_EmailOrderByIdAsc(String email);
    long countByUser_Email(String email);
}
