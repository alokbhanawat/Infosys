package com.infosys.backend.service;

import com.infosys.backend.dto.OrderResponse;
import com.infosys.backend.model.Cart;
import com.infosys.backend.model.Order;
import com.infosys.backend.model.OrderItem;
import com.infosys.backend.model.Product;
import com.infosys.backend.model.User;
import com.infosys.backend.repository.CartRepository;
import com.infosys.backend.repository.OrderRepository;
import com.infosys.backend.repository.ProductRepository;
import com.infosys.backend.repository.UserRepository;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(
            OrderRepository orderRepository,
            CartRepository cartRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderResponse checkout(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        List<Cart> cartItems = cartRepository.findByUser_UserId(userId);
        if (cartItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty.");
        }

        Map<Long, Product> lockedProducts = lockProductsForCheckout(cartItems);
        validateCartStock(cartItems, lockedProducts);

        BigDecimal totalPrice = calculateTotalPrice(cartItems);
        Order order = new Order(user, totalPrice);

        for (Cart cartItem : cartItems) {
            Product product = lockedProducts.get(cartItem.getProduct().getId());
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));

            order.addItem(new OrderItem(
                    product.getId(),
                    product.getName(),
                    product.getPrice(),
                    cartItem.getQuantity(),
                    lineTotal));

            product.setStock(product.getStock() - cartItem.getQuantity());
        }

        Order savedOrder = orderRepository.save(order);
        cartRepository.deleteAll(cartItems);
        return new OrderResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(int userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found.");
        }

        return orderRepository.findByUser_UserIdOrderByCreatedAtDesc(userId).stream()
                .map(OrderResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersForCurrentUser(String email) {
        return orderRepository.findByUser_EmailOrderByCreatedAtDesc(email).stream()
                .map(OrderResponse::new)
                .toList();
    }

    private Map<Long, Product> lockProductsForCheckout(List<Cart> cartItems) {
        List<Long> productIds = cartItems.stream()
                .map(cartItem -> cartItem.getProduct().getId())
                .distinct()
                .sorted()
                .toList();

        List<Product> lockedProducts = productRepository.findAllActiveByIdInForUpdate(productIds);
        Map<Long, Product> lockedProductsById = new LinkedHashMap<>();
        for (Product product : lockedProducts) {
            lockedProductsById.put(product.getId(), product);
        }

        if (lockedProductsById.size() != productIds.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "One or more products in your cart are no longer available.");
        }

        return lockedProductsById;
    }

    private void validateCartStock(List<Cart> cartItems, Map<Long, Product> lockedProducts) {
        for (Cart cartItem : cartItems) {
            Product product = lockedProducts.get(cartItem.getProduct().getId());
            if (product.getStock() == null || product.getStock() < cartItem.getQuantity()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Requested quantity is not available for product: " + product.getName());
            }
        }
    }

    private BigDecimal calculateTotalPrice(List<Cart> cartItems) {
        return cartItems.stream()
                .map(cartItem -> cartItem.getProduct().getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
