package com.infosys.backend.dto;

import com.infosys.backend.model.OrderItem;
import java.math.BigDecimal;

public class OrderItemResponse {

    private final Long orderItemId;
    private final Long productId;
    private final String productName;
    private final BigDecimal unitPrice;
    private final Integer quantity;
    private final BigDecimal lineTotal;

    public OrderItemResponse(OrderItem orderItem) {
        this.orderItemId = orderItem.getOrderItemId();
        this.productId = orderItem.getProductId();
        this.productName = orderItem.getProductName();
        this.unitPrice = orderItem.getUnitPrice();
        this.quantity = orderItem.getQuantity();
        this.lineTotal = orderItem.getLineTotal();
    }

    public Long getOrderItemId() { return orderItemId; }
    public Long getProductId() { return productId; }
    public String getProductName() { return productName; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public Integer getQuantity() { return quantity; }
    public BigDecimal getLineTotal() { return lineTotal; }
}
