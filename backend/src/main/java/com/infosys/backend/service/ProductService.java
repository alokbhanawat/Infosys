package com.infosys.backend.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.infosys.backend.dto.ProductCreateRequest;
import com.infosys.backend.model.Product;
import com.infosys.backend.repository.ProductRepository;

@Service
public class ProductService {

    private static final Set<String> ALLOWED_IMAGE_TYPES =
            Set.of("image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif");
    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS =
            Set.of(".png", ".jpg", ".jpeg", ".webp", ".gif");

    private final ProductRepository productRepository;

    private final String uploadDir;

    public ProductService(
            ProductRepository productRepository,
            @Value("${app.upload.dir:uploads}") String uploadDir) {
        this.productRepository = productRepository;
        this.uploadDir = uploadDir;
    }

    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    public Product addProduct(ProductCreateRequest request) {
        validateProductRequest(request);

        Product product = new Product();
        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(normalize(request.getCategory()));
        product.setImageUrl(storeProductImage(request.getImage()));
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getAllProductsForAdmin() {
        return productRepository.findAll();
    }

    public List<Product> searchActiveProducts(String searchTerm) {
        return productRepository.searchActiveProducts(searchTerm);
    }

    public List<Product> filterActiveProducts(
            String searchTerm,
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean inStock) {
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "minPrice cannot be greater than maxPrice.");
        }

        return productRepository.filterActiveProducts(
                normalize(searchTerm),
                normalize(category),
                minPrice,
                maxPrice,
                inStock);
    }

    public Product getActiveProductById(Long id) {
        return productRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found."));
    }

    @Transactional
    public void deactivateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found."));
        product.setIsActive(false);
        productRepository.save(product);
    }

    @Transactional
    public int deactivateProducts(List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please select at least one product.");
        }

        Set<Long> uniqueIds = new LinkedHashSet<>(productIds);
        List<Product> products = productRepository.findAllById(uniqueIds);

        if (products.size() != uniqueIds.size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "One or more selected products were not found.");
        }

        products.forEach(product -> product.setIsActive(false));
        productRepository.saveAll(products);
        return products.size();
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }

        String normalizedValue = value.trim();
        return normalizedValue.isEmpty() ? null : normalizedValue;
    }

    private void validateProductRequest(ProductCreateRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product details are required.");
        }

        if (normalize(request.getName()) == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product name is required.");
        }

        if (request.getPrice() == null || request.getPrice().signum() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price must be zero or greater.");
        }

        if (request.getStock() == null || request.getStock() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock must be zero or greater.");
        }

        MultipartFile image = request.getImage();
        if (image == null || image.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product image is required.");
        }
    }

    private String storeProductImage(MultipartFile image) {
        try {
            String originalFilename = image.getOriginalFilename();
            String extension = getFileExtension(originalFilename).toLowerCase(Locale.ROOT);
            String contentType = image.getContentType() == null
                    ? null
                    : image.getContentType().toLowerCase(Locale.ROOT);

            if (contentType == null
                    || !ALLOWED_IMAGE_TYPES.contains(contentType)
                    || !ALLOWED_IMAGE_EXTENSIONS.contains(extension)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Upload a valid image file such as PNG, JPG, JPEG, WEBP, or GIF.");
            }

            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String storedFileName = UUID.randomUUID() + extension;
            Path destination = uploadPath.resolve(storedFileName).normalize();
            Files.copy(image.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            return ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/")
                    .path(storedFileName)
                    .toUriString();
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to store product image.");
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null) {
            return "";
        }

        int extensionIndex = filename.lastIndexOf('.');
        if (extensionIndex < 0) {
            return "";
        }

        return filename.substring(extensionIndex);
    }
}
