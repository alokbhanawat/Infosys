package com.infosys.backend.dto;

public class PaymentSummaryResponse {

    private final String paymentMethod;
    private final String cardHolderName;
    private final String paymentReference;

    public PaymentSummaryResponse(String paymentMethod, String cardHolderName, String paymentReference) {
        this.paymentMethod = paymentMethod;
        this.cardHolderName = cardHolderName;
        this.paymentReference = paymentReference;
    }

    public String getPaymentMethod() { return paymentMethod; }
    public String getCardHolderName() { return cardHolderName; }
    public String getPaymentReference() { return paymentReference; }
}
