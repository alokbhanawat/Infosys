package com.infosys.backend.service;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.backend.model.Product;
import com.infosys.backend.repository.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Product addProduct(Product product) {
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
}
