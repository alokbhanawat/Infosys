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
    private final AddressResponse shippingAddress;
    private final PaymentSummaryResponse paymentSummary;
    private final List<OrderItemResponse> items;

    public OrderResponse(Order order) {
        this.orderId = order.getOrderId();
        this.userId = order.getUser().getUserId();
        this.totalPrice = order.getTotalPrice();
        this.createdAt = order.getCreatedAt();
        this.shippingAddress = new AddressResponse(
                order.getShippingFullName(),
                order.getShippingPhone(),
                order.getShippingAddressLine1(),
                order.getShippingAddressLine2(),
                order.getShippingCity(),
                order.getShippingState(),
                order.getShippingPostalCode(),
                order.getShippingCountry());
        this.paymentSummary = new PaymentSummaryResponse(
                order.getPaymentMethod(),
                order.getPaymentCardHolderName(),
                order.getPaymentReference());
        this.items = order.getItems().stream()
                .map(OrderItemResponse::new)
                .toList();
    }

    public Long getOrderId() { return orderId; }
    public Integer getUserId() { return userId; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public AddressResponse getShippingAddress() { return shippingAddress; }
    public PaymentSummaryResponse getPaymentSummary() { return paymentSummary; }
    public List<OrderItemResponse> getItems() { return items; }
}
