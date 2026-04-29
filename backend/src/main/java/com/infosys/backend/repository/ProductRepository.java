package com.infosys.backend.repository;

import com.infosys.backend.model.Product;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Find products by name (case insensitive)
    List<Product> findByNameContainingIgnoreCase(String name);

    Optional<Product> findByIdAndIsActiveTrue(Long id);

    @Query("""
            SELECT p
            FROM Product p
            WHERE p.isActive = true
              AND (
                :searchTerm IS NULL
                OR TRIM(:searchTerm) = ''
                OR LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(COALESCE(p.category, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
              )
            ORDER BY p.createdAt DESC
            """)
    List<Product> searchActiveProducts(@Param("searchTerm") String searchTerm);

    @Query("""
            SELECT p
            FROM Product p
            WHERE p.isActive = true
              AND (
                :searchTerm IS NULL
                OR TRIM(:searchTerm) = ''
                OR LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(COALESCE(p.category, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
              )
              AND (
                :category IS NULL
                OR TRIM(:category) = ''
                OR LOWER(TRIM(COALESCE(p.category, ''))) = LOWER(TRIM(:category))
              )
              AND (
                :minPrice IS NULL
                OR p.price >= :minPrice
              )
              AND (
                :maxPrice IS NULL
                OR p.price <= :maxPrice
              )
              AND (
                :inStock IS NULL
                OR :inStock = false
                OR p.stock > 0
              )
            ORDER BY p.createdAt DESC
            """)
    List<Product> filterActiveProducts(
            @Param("searchTerm") String searchTerm,
            @Param("category") String category,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("inStock") Boolean inStock);

    // Find products by category
    List<Product> findByCategory(String category);

    // Find active products only
    List<Product> findByIsActiveTrue();

    // Find products by price range
    List<Product> findByPriceBetween(Double minPrice, Double maxPrice);

    // Find products with stock greater than
    List<Product> findByStockGreaterThan(Integer quantity);
}
