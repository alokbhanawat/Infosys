package com.infosys.backend.dto;

import java.math.BigDecimal;

public class RazorpayOrderResponse {

    private final String keyId;
    private final String razorpayOrderId;
    private final Integer amount;
    private final String currency;
    private final BigDecimal totalPrice;
    private final String paymentMethod;

    public RazorpayOrderResponse(
            String keyId,
            String razorpayOrderId,
            Integer amount,
            String currency,
            BigDecimal totalPrice,
            String paymentMethod) {
        this.keyId = keyId;
        this.razorpayOrderId = razorpayOrderId;
        this.amount = amount;
        this.currency = currency;
        this.totalPrice = totalPrice;
        this.paymentMethod = paymentMethod;
    }

    public String getKeyId() { return keyId; }
    public String getRazorpayOrderId() { return razorpayOrderId; }
    public Integer getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public String getPaymentMethod() { return paymentMethod; }
}
