package com.infosys.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.infosys.backend.model.*;

public interface UserRepository extends JpaRepository<User, Integer> {
}