package com.infosys.backend.service;

import com.infosys.backend.dto.CheckoutRequest;
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
    public OrderResponse checkout(CheckoutRequest request, String email) {
        validateCheckoutRequest(request);

        User user = getUserForCheckout(email, request.getUserId());
        return createOrderForUser(user, request, null, null);
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

    private void validateCheckoutRequest(CheckoutRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Checkout request is required.");
        }

        requireMandatoryText(request.getFullName(), "Full name");
        requireMandatoryText(request.getPhone(), "Phone number");
        requireMandatoryText(request.getAddressLine1(), "Address line 1");
        requireMandatoryText(request.getCity(), "City");
        requireMandatoryText(request.getState(), "State");
        requireMandatoryText(request.getPostalCode(), "Postal code");
        requireMandatoryText(request.getCountry(), "Country");
        requireMandatoryText(request.getPaymentMethod(), "Payment method");

        String paymentMethod = normalizePaymentMethod(request.getPaymentMethod());
        if (!"CARD".equals(paymentMethod) && !"UPI".equals(paymentMethod)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please choose a valid payment method: card or UPI.");
        }

        if ("CARD".equals(paymentMethod)) {
            requireMandatoryText(request.getCardHolderName(), "Card holder name");
            String digitsOnly = digitsOnly(request.getCardNumber());
            if (digitsOnly.length() < 4) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Card number is mandatory. Please fill this mandatory field with at least the last 4 digits.");
            }
        }

        if ("UPI".equals(paymentMethod)) {
            requireMandatoryText(request.getUpiId(), "UPI ID");
        }
    }

    private void requireMandatoryText(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    fieldName + " is mandatory. Please fill this mandatory field.");
        }
    }

    private String normalizePaymentMethod(String paymentMethod) {
        return paymentMethod == null ? "" : paymentMethod.trim().toUpperCase();
    }

    private String buildPaymentReference(CheckoutRequest request) {
        String paymentMethod = normalizePaymentMethod(request.getPaymentMethod());
        if ("CARD".equals(paymentMethod)) {
            String digitsOnly = digitsOnly(request.getCardNumber());
            if (digitsOnly.length() >= 4) {
                return "CARD-XXXX-" + digitsOnly.substring(digitsOnly.length() - 4);
            }

            return "CARD";
        }

        if ("UPI".equals(paymentMethod)) {
            return "UPI-" + request.getUpiId().trim().toLowerCase();
        }

        return paymentMethod;
    }

    private String digitsOnly(String value) {
        if (value == null) {
            return "";
        }

        return value.replaceAll("\\D", "");
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private User getUserForCheckout(String email, Integer requestedUserId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        if (requestedUserId != null && requestedUserId != user.getUserId()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Checkout user does not match the logged-in user.");
        }

        return user;
    }

    private OrderResponse createOrderForUser(
            User user,
            CheckoutRequest request,
            BigDecimal expectedTotal,
            String externalPaymentReference) {
        List<Cart> cartItems = cartRepository.findByUser_UserId(user.getUserId());
        if (cartItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty.");
        }

        Map<Long, Product> lockedProducts = lockProductsForCheckout(cartItems);
        validateCartStock(cartItems, lockedProducts);

        BigDecimal totalPrice = calculateTotalPrice(cartItems);
        if (expectedTotal != null && totalPrice.compareTo(expectedTotal) != 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Your cart changed after the payment session was created. Please try checkout again.");
        }

        Order order = new Order(user, totalPrice);
        order.setShippingFullName(request.getFullName().trim());
        order.setShippingPhone(request.getPhone().trim());
        order.setShippingAddressLine1(request.getAddressLine1().trim());
        order.setShippingAddressLine2(trimToNull(request.getAddressLine2()));
        order.setShippingCity(request.getCity().trim());
        order.setShippingState(request.getState().trim());
        order.setShippingPostalCode(request.getPostalCode().trim());
        order.setShippingCountry(request.getCountry().trim());
        order.setPaymentMethod(normalizePaymentMethod(request.getPaymentMethod()));
        order.setPaymentCardHolderName(trimToNull(request.getCardHolderName()));
        order.setPaymentReference(externalPaymentReference != null
                ? externalPaymentReference
                : buildPaymentReference(request));

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
}
