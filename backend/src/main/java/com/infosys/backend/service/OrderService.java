package com.infosys.backend.service;

import com.infosys.backend.dto.CheckoutRequest;
import com.infosys.backend.dto.OrderResponse;
import com.infosys.backend.dto.RazorpayOrderResponse;
import com.infosys.backend.dto.RazorpayPaymentVerificationRequest;
import com.infosys.backend.model.Cart;
import com.infosys.backend.model.Order;
import com.infosys.backend.model.OrderItem;
import com.infosys.backend.model.Product;
import com.infosys.backend.model.RazorpayPaymentSession;
import com.infosys.backend.model.User;
import com.infosys.backend.model.UserAddress;
import com.infosys.backend.repository.CartRepository;
import com.infosys.backend.repository.OrderRepository;
import com.infosys.backend.repository.ProductRepository;
import com.infosys.backend.repository.RazorpayPaymentSessionRepository;
import com.infosys.backend.repository.UserRepository;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
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
    private final UserAddressService userAddressService;
    private final RazorpayPaymentSessionRepository razorpayPaymentSessionRepository;
    private final HttpClient httpClient;
    private final String razorpayKeyId;
    private final String razorpayKeySecret;
    private final String razorpayCurrency;

    public OrderService(
            OrderRepository orderRepository,
            CartRepository cartRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            UserAddressService userAddressService,
            RazorpayPaymentSessionRepository razorpayPaymentSessionRepository,
            @Value("${razorpay.key-id}") String razorpayKeyId,
            @Value("${razorpay.key-secret}") String razorpayKeySecret,
            @Value("${razorpay.currency:INR}") String razorpayCurrency) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.userAddressService = userAddressService;
        this.razorpayPaymentSessionRepository = razorpayPaymentSessionRepository;
        this.httpClient = HttpClient.newHttpClient();
        this.razorpayKeyId = razorpayKeyId;
        this.razorpayKeySecret = razorpayKeySecret;
        this.razorpayCurrency = razorpayCurrency;
    }

    @Transactional
    public OrderResponse checkout(CheckoutRequest request, String email) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Use Razorpay checkout so the payment can be verified before the order is saved.");
    }

    @Transactional
    public RazorpayOrderResponse createRazorpayOrder(CheckoutRequest request, String email) {
        User user = getUserForCheckout(email, request.getUserId());
        UserAddress selectedAddress = resolveSelectedAddress(user, request);
        validateCheckoutRequest(request, selectedAddress);

        List<Cart> cartItems = cartRepository.findByUser_UserId(user.getUserId());
        if (cartItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty.");
        }

        Map<Long, Product> lockedProducts = lockProductsForCheckout(cartItems);
        validateCartStock(cartItems, lockedProducts);

        BigDecimal totalPrice = calculateTotalPrice(cartItems);
        int amountInPaise = toRazorpayAmount(totalPrice);
        String razorpayOrderId = createRazorpayOrderOnGateway(amountInPaise, user.getUserId());

        RazorpayPaymentSession session = new RazorpayPaymentSession();
        session.setUser(user);
        session.setRazorpayOrderId(razorpayOrderId);
        session.setAmount(totalPrice);
        session.setAmountInPaise(amountInPaise);
        session.setCurrency(razorpayCurrency);
        session.setStatus("CREATED");
        session.setAddressId(request.getAddressId());
        session.setFullName(trimToNull(request.getFullName()));
        session.setPhone(trimToNull(request.getPhone()));
        session.setAddressLine1(trimToNull(request.getAddressLine1()));
        session.setAddressLine2(trimToNull(request.getAddressLine2()));
        session.setCity(trimToNull(request.getCity()));
        session.setState(trimToNull(request.getState()));
        session.setPostalCode(trimToNull(request.getPostalCode()));
        session.setCountry(trimToNull(request.getCountry()));
        session.setPaymentMethod(normalizePaymentMethod(request.getPaymentMethod()));
        session.setCardHolderName(trimToNull(request.getCardHolderName()));
        razorpayPaymentSessionRepository.save(session);

        return new RazorpayOrderResponse(
                razorpayKeyId,
                razorpayOrderId,
                amountInPaise,
                razorpayCurrency,
                totalPrice,
                normalizePaymentMethod(request.getPaymentMethod()));
    }

    @Transactional
    public OrderResponse verifyRazorpayPayment(RazorpayPaymentVerificationRequest request, String email) {
        requireMandatoryText(request == null ? null : request.getRazorpayOrderId(), "Razorpay order ID");
        requireMandatoryText(request.getRazorpayPaymentId(), "Razorpay payment ID");
        requireMandatoryText(request.getRazorpaySignature(), "Razorpay signature");

        RazorpayPaymentSession session = razorpayPaymentSessionRepository
                .findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment session not found."));

        if (!email.equals(session.getUser().getEmail())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Payment session does not belong to this user.");
        }

        if ("PAID".equals(session.getStatus())) {
            return orderRepository.findById(session.getAppOrderId())
                    .map(OrderResponse::new)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Verified order not found."));
        }

        if (!isValidRazorpaySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Razorpay payment verification failed.");
        }

        CheckoutRequest checkoutRequest = checkoutRequestFromSession(session);
        UserAddress selectedAddress = resolveSelectedAddress(session.getUser(), checkoutRequest);
        OrderResponse orderResponse = createOrderForUser(
                session.getUser(),
                checkoutRequest,
                selectedAddress,
                session.getAmount(),
                "RAZORPAY-" + request.getRazorpayPaymentId());

        session.setStatus("PAID");
        session.setRazorpayPaymentId(request.getRazorpayPaymentId());
        session.setAppOrderId(orderResponse.getOrderId());
        session.setPaidAt(LocalDateTime.now());
        razorpayPaymentSessionRepository.save(session);

        return orderResponse;
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

    private void validateCheckoutRequest(CheckoutRequest request, UserAddress selectedAddress) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Checkout request is required.");
        }

        if (selectedAddress == null) {
            requireMandatoryText(request.getFullName(), "Full name");
            requireMandatoryText(request.getPhone(), "Phone number");
            requireTenDigitPhone(request.getPhone());
            requireMandatoryText(request.getAddressLine1(), "Address line 1");
            requireMandatoryText(request.getCity(), "City");
            requireMandatoryText(request.getState(), "State");
            requireMandatoryText(request.getPostalCode(), "Postal code");
            requireMandatoryText(request.getCountry(), "Country");
        }
        requireMandatoryText(request.getPaymentMethod(), "Payment method");

        String paymentMethod = normalizePaymentMethod(request.getPaymentMethod());
        if (!"CARD".equals(paymentMethod) && !"UPI".equals(paymentMethod)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please choose a valid payment method: card or UPI.");
        }

        if ("CARD".equals(paymentMethod)) {
            request.setUpiId(null);
        }

        if ("UPI".equals(paymentMethod)) {
            request.setCardHolderName(null);
            request.setCardNumber(null);
        }
    }

    private void requireTenDigitPhone(String phone) {
        if (digitsOnly(phone).length() != 10) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid 10-digit phone number");
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

    private CheckoutRequest checkoutRequestFromSession(RazorpayPaymentSession session) {
        CheckoutRequest request = new CheckoutRequest();
        request.setUserId(session.getUser().getUserId());
        request.setAddressId(session.getAddressId());
        request.setFullName(session.getFullName());
        request.setPhone(session.getPhone());
        request.setAddressLine1(session.getAddressLine1());
        request.setAddressLine2(session.getAddressLine2());
        request.setCity(session.getCity());
        request.setState(session.getState());
        request.setPostalCode(session.getPostalCode());
        request.setCountry(session.getCountry());
        request.setPaymentMethod(session.getPaymentMethod());
        request.setCardHolderName(session.getCardHolderName());
        return request;
    }

    private int toRazorpayAmount(BigDecimal totalPrice) {
        return totalPrice
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .intValueExact();
    }

    private String createRazorpayOrderOnGateway(int amountInPaise, Integer userId) {
        try {
            String payload = String.format(
                    "{\"amount\":%d,\"currency\":\"%s\",\"receipt\":\"cart_%d_%d\",\"payment_capture\":1}",
                    amountInPaise,
                    escapeJson(razorpayCurrency),
                    userId,
                    System.currentTimeMillis());

            String credentials = Base64.getEncoder().encodeToString(
                    (razorpayKeyId + ":" + razorpayKeySecret).getBytes(StandardCharsets.UTF_8));
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.razorpay.com/v1/orders"))
                    .header("Authorization", "Basic " + credentials)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Unable to create Razorpay order. Please try again.");
            }

            String orderId = extractJsonString(response.body(), "id");
            if (orderId == null || orderId.isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Razorpay did not return an order ID.");
            }

            return orderId;
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to connect to Razorpay. Please try again.",
                    exception);
        }
    }

    private String escapeJson(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String extractJsonString(String json, String key) {
        if (json == null || key == null) {
            return null;
        }

        Pattern pattern = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*\"([^\"]*)\"");
        Matcher matcher = pattern.matcher(json);
        return matcher.find() ? matcher.group(1) : null;
    }

    private boolean isValidRazorpaySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String generatedSignature = bytesToHex(digest);
            return constantTimeEquals(generatedSignature, signature);
        } catch (NoSuchAlgorithmException | InvalidKeyException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to verify Razorpay payment.",
                    exception);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder hex = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) {
            hex.append(String.format("%02x", value));
        }
        return hex.toString();
    }

    private boolean constantTimeEquals(String left, String right) {
        if (left == null || right == null) {
            return false;
        }

        byte[] leftBytes = left.getBytes(StandardCharsets.UTF_8);
        byte[] rightBytes = right.getBytes(StandardCharsets.UTF_8);
        if (leftBytes.length != rightBytes.length) {
            return false;
        }

        int result = 0;
        for (int index = 0; index < leftBytes.length; index++) {
            result |= leftBytes[index] ^ rightBytes[index];
        }
        return result == 0;
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

    private UserAddress resolveSelectedAddress(User user, CheckoutRequest request) {
        if (request == null || request.getAddressId() == null) {
            return null;
        }

        return userAddressService.getAddressForCheckout(user.getEmail(), request.getAddressId());
    }

    private OrderResponse createOrderForUser(
            User user,
            CheckoutRequest request,
            UserAddress selectedAddress,
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
        if (selectedAddress != null) {
            order.setShippingFullName(selectedAddress.getFullName());
            order.setShippingPhone(selectedAddress.getPhone());
            order.setShippingAddressLine1(selectedAddress.getAddressLine1());
            order.setShippingAddressLine2(selectedAddress.getAddressLine2());
            order.setShippingCity(selectedAddress.getCity());
            order.setShippingState(selectedAddress.getState());
            order.setShippingPostalCode(selectedAddress.getPostalCode());
            order.setShippingCountry(selectedAddress.getCountry());
        } else {
            order.setShippingFullName(request.getFullName().trim());
            order.setShippingPhone(request.getPhone().trim());
            order.setShippingAddressLine1(request.getAddressLine1().trim());
            order.setShippingAddressLine2(trimToNull(request.getAddressLine2()));
            order.setShippingCity(request.getCity().trim());
            order.setShippingState(request.getState().trim());
            order.setShippingPostalCode(request.getPostalCode().trim());
            order.setShippingCountry(request.getCountry().trim());
        }
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
