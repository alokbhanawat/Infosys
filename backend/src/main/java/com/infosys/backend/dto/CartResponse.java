package com.infosys.backend.dto;

import com.infosys.backend.model.Cart;

public class CartResponse {

    private final Long cartId;
    private final Integer quantity;
    private final CartProductResponse product;

    public CartResponse(Cart cart) {
        this.cartId = cart.getCartId();
        this.quantity = cart.getQuantity();
        this.product = new CartProductResponse(
                cart.getProduct().getId(),
                cart.getProduct().getName());
    }

    public Long getCartId() {
        return cartId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public CartProductResponse getProduct() {
        return product;
    }
}
