package com.infosys.backend.config;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.infosys.backend.model.Product;
import com.infosys.backend.repository.ProductRepository;

@Component
public class ProductDataSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    public ProductDataSeeder(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() <= 1) {
            List<Product> seedProducts = List.of(
                    create("Audiomax Wireless Headphones",
                            "High-fidelity wireless over-ear headphones with active noise cancellation and 40h battery life.",
                            new BigDecimal("2499.00"), 25, "Headphones",
                            "/seed-products/audiomax-headphones.png"),

                    create("Sonicbuds Pro True Wireless",
                            "Compact wireless earbuds with deep bass, IPX5 water resistance, and fast charging.",
                            new BigDecimal("1499.00"), 30, "Headphones",
                            "/seed-products/sonicbuds-headphones.png"),

                    create("Nova 5G Smartphone",
                            "6.7-inch AMOLED 120Hz display, 64MP triple camera, 5000mAh battery with 67W fast charging.",
                            new BigDecimal("18999.00"), 15, "Mobiles",
                            "/seed-products/nova-5g-mobile.png"),

                    create("Orbit Pro 5G",
                            "Flagship camera phone with 108MP sensor, ultra-slim design, and Snapdragon processor.",
                            new BigDecimal("24999.00"), 12, "Mobiles",
                            "/seed-products/orbit-pro-mobile.png"),

                    create("Swiftbook 15 Laptop",
                            "15.6-inch FHD display, Intel Core i5 12th Gen, 16GB RAM, 512GB SSD for work and study.",
                            new BigDecimal("42999.00"), 10, "Laptops",
                            "/seed-products/swiftbook-laptop.png"),

                    create("Zenbook Air Ultralight",
                            "Ultrathin 1.1kg aluminum body, OLED display, 16-hour battery, Ryzen 7 processor.",
                            new BigDecimal("58999.00"), 8, "Laptops",
                            "/seed-products/zenbook-air-laptop.png"),

                    create("Cinemaview 55-inch 4K Smart TV",
                            "Ultra HD 4K LED TV with Dolby Vision, Atmos audio, HDR10+, and built-in streaming apps.",
                            new BigDecimal("32999.00"), 14, "Smart TVs",
                            "/seed-products/cinemaview-smart-tv.png"),

                    create("VisionX 43-inch Bezel-less Smart TV",
                            "Crisp Full HD display with Google TV, Chromecast built-in, and quad-core processor.",
                            new BigDecimal("21999.00"), 18, "Smart TVs",
                            "/seed-products/visionx-smart-tv.png"),

                    create("Coolmate Double Door Refrigerator",
                            "260L frost-free double door inverter refrigerator with stabilizer-free operation.",
                            new BigDecimal("26499.00"), 7, "Refrigerators",
                            "/seed-products/coolmate-refrigerator.png")
            );

            productRepository.saveAll(seedProducts);
        }
    }

    private Product create(String name, String description, BigDecimal price, int stock, String category, String imageUrl) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(description);
        p.setPrice(price);
        p.setStock(stock);
        p.setCategory(category);
        p.setImageUrl(imageUrl);
        p.setIsActive(true);
        return p;
    }
}
