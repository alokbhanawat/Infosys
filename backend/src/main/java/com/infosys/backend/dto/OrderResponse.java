package com.infosys.backend.dto;

import com.infosys.backend.model.Order;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {

    private final Long orderId;
    private final Integer userId;
    private final BigDecimal totalPrice;
    private final LocalDateTime createdAt;
    private final List<OrderItemResponse> items;

    public OrderResponse(Order order) {
        this.orderId = order.getOrderId();
        this.userId = order.getUser().getUserId();
        this.totalPrice = order.getTotalPrice();
        this.createdAt = order.getCreatedAt();
        this.items = order.getItems().stream()
                .map(OrderItemResponse::new)
                .toList();
    }

    public Long getOrderId() { return orderId; }
    public Integer getUserId() { return userId; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<OrderItemResponse> getItems() { return items; }
}
