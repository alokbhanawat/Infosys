package com.infosys.backend.repository;

import com.infosys.backend.model.RazorpayPaymentSession;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RazorpayPaymentSessionRepository extends JpaRepository<RazorpayPaymentSession, Long> {
    Optional<RazorpayPaymentSession> findByRazorpayOrderId(String razorpayOrderId);
}
