package com.infosys.backend.controller;

import com.infosys.backend.dto.CartResponse;
import com.infosys.backend.service.CartService;
import java.util.Map;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin("*")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping
    public CartResponse addToCart(
            @RequestParam int userId,
            @RequestParam Long productId,
            @RequestParam Integer quantity) {
        return cartService.addToCart(userId, productId, quantity);
    }

    @GetMapping("/{userId}")
    public List<CartResponse> getCartByUserId(@PathVariable int userId) {
        return cartService.getCartByUserId(userId);
    }

    @PutMapping
    public CartResponse updateCart(
            @RequestParam int userId,
            @RequestParam Long productId,
            @RequestParam Integer quantity) {
        return cartService.updateCart(userId, productId, quantity);
    }

    @DeleteMapping
    public Map<String, String> removeFromCart(
            @RequestParam int userId,
            @RequestParam Long productId) {
        cartService.removeFromCart(userId, productId);
        return Map.of("message", "Product removed from cart successfully.");
    }
}
