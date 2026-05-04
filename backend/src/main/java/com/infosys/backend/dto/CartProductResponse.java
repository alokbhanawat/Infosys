package com.infosys.backend.dto;

public class CartProductResponse {

    private final Long id;
    private final String name;

    public CartProductResponse(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}
