package com.infosys.backend.controller;

import com.infosys.backend.dto.CheckoutRequest;
import com.infosys.backend.dto.OrderResponse;
import com.infosys.backend.service.OrderService;
import java.security.Principal;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin("*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    public OrderResponse checkout(@RequestBody CheckoutRequest request, Principal principal) {
        return orderService.checkout(request, principal.getName());
    }

    @GetMapping("/my")
    public List<OrderResponse> getCurrentUserOrders(Principal principal) {
        return orderService.getOrdersForCurrentUser(principal.getName());
    }

    @GetMapping("/{userId}")
    public List<OrderResponse> getOrdersByUserId(@PathVariable int userId) {
        return orderService.getOrdersByUserId(userId);
    }
}
