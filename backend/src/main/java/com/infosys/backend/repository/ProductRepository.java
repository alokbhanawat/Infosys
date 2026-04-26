package com.infosys.backend.repository;

import com.infosys.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Find products by name (case insensitive)
    List<Product> findByNameContainingIgnoreCase(String name);

    // Find products by category
    List<Product> findByCategory(String category);

    // Find active products only
    List<Product> findByIsActiveTrue();

    // Find products by price range
    List<Product> findByPriceBetween(Double minPrice, Double maxPrice);

    // Find products with stock greater than
    List<Product> findByStockGreaterThan(Integer quantity);
}
