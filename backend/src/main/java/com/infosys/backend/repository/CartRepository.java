package com.infosys.backend.repository;

import com.infosys.backend.model.Cart;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    List<Cart> findByUser_UserId(int userId);

    Optional<Cart> findByUser_UserIdAndProduct_Id(int userId, Long productId);

    void deleteByUser_UserId(int userId);
}
