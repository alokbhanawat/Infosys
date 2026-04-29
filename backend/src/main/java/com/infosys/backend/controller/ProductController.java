package com.infosys.backend.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.infosys.backend.model.Product;
import com.infosys.backend.service.ProductService;

@RestController
@RequestMapping("/api/products")
@CrossOrigin("*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping("/add")
    public Product addProduct(@RequestBody Product product) {
        return productService.addProduct(product);
    }

    @PostMapping
    public Product addProductFromRoot(@RequestBody Product product) {
        return productService.addProduct(product);
    }

    @GetMapping
    public List<Product> getAllProducts(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(value = "inStock", required = false) Boolean inStock) {
        return productService.filterActiveProducts(search, category, minPrice, maxPrice, inStock);
    }

    @GetMapping("/all")
    public List<Product> getAllProductsAlias(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(value = "inStock", required = false) Boolean inStock) {
        return productService.filterActiveProducts(search, category, minPrice, maxPrice, inStock);
    }

    @GetMapping("/getAll")
    public List<Product> getAllProductsLegacyAlias(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(value = "inStock", required = false) Boolean inStock) {
        return productService.filterActiveProducts(search, category, minPrice, maxPrice, inStock);
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getActiveProductById(id);
    }
}
