package com.infosys.backend.repository;

import com.infosys.backend.model.Order;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser_UserIdOrderByCreatedAtDesc(int userId);
}
