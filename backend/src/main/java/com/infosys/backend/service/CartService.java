package com.infosys.backend.service;

import com.infosys.backend.dto.CartResponse;
import com.infosys.backend.model.Cart;
import com.infosys.backend.model.Product;
import com.infosys.backend.model.User;
import com.infosys.backend.repository.CartRepository;
import com.infosys.backend.repository.ProductRepository;
import com.infosys.backend.repository.UserRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public CartService(
            CartRepository cartRepository,
            UserRepository userRepository,
            ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public CartResponse addToCart(int userId, Long productId, Integer quantity) {
        if (quantity == null || quantity < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be at least 1.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        Product product = productRepository.findByIdAndIsActiveTrue(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found."));

        if (product.getStock() == null || product.getStock() < quantity) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Requested quantity is not available.");
        }

        Cart cart = cartRepository.findByUser_UserIdAndProduct_Id(userId, productId)
                .map(existingCart -> updateExistingCart(existingCart, quantity, product))
                .orElseGet(() -> new Cart(user, product, quantity));

        return new CartResponse(cartRepository.save(cart));
    }

    @Transactional(readOnly = true)
    public List<CartResponse> getCartByUserId(int userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found.");
        }

        return cartRepository.findByUser_UserId(userId).stream()
                .map(CartResponse::new)
                .toList();
    }

    @Transactional
    public CartResponse updateCart(int userId, Long productId, Integer quantity) {
        if (quantity == null || quantity < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be at least 1.");
        }

        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found.");
        }

        Product product = productRepository.findByIdAndIsActiveTrue(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found."));

        if (product.getStock() == null || product.getStock() < quantity) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Requested quantity is not available.");
        }

        Cart cart = cartRepository.findByUser_UserIdAndProduct_Id(userId, productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found."));

        cart.setQuantity(quantity);
        return new CartResponse(cartRepository.save(cart));
    }

    @Transactional
    public void removeFromCart(int userId, Long productId) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found.");
        }

        Cart cart = cartRepository.findByUser_UserIdAndProduct_Id(userId, productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found."));

        cartRepository.delete(cart);
    }

    private Cart updateExistingCart(Cart cart, Integer quantityToAdd, Product product) {
        int updatedQuantity = cart.getQuantity() + quantityToAdd;

        if (product.getStock() == null || product.getStock() < updatedQuantity) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Requested quantity is not available.");
        }

        cart.setQuantity(updatedQuantity);
        return cart;
    }
}
