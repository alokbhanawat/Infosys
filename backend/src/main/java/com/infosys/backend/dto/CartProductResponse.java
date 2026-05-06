package com.infosys.backend.dto;
import java.math.BigDecimal;
public class CartProductResponse {

    private final Long id;
    private final String name;
    private final BigDecimal price; // ✅ ADD THIS

    public CartProductResponse(Long id, String name, BigDecimal price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getPrice() {   // ✅ getter
        return price;
    }
}