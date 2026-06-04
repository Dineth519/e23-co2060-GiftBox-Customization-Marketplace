package com.example.nexus.controller;

import com.example.nexus.dto.ProductDTO;
import com.example.nexus.model.Product;
import com.example.nexus.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    // GET /api/products — Fetch all products for the customer-facing Products Page
    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // ── GET /api/sellers/{sellerId}/products — Seller dashboard ──
    @GetMapping("/sellers/{sellerId}/products")
    public List<ProductDTO> getProductsBySeller(@PathVariable Integer sellerId) {
        return productRepository.findByPartnerId(sellerId)
            .stream()
            .map(product -> {
                ProductDTO dto = new ProductDTO();
                dto.setId(product.getId());
                dto.setName(product.getName());
                dto.setCategory(product.getCategoryId() == null
                    ? "Uncategorized"
                    : "Category ID: " + product.getCategoryId());
                dto.setPrice(product.getPrice());
                dto.setStock(product.getStockQuantity() != null ? product.getStockQuantity() : 0);
                dto.setSold(0);
                dto.setRating(product.getRating() != null ? product.getRating().doubleValue() : 0.0);
                dto.setImage(product.getImageUrl());

                int stock    = dto.getStock();
                int isActive = product.getIsActive() != null ? product.getIsActive() : 1;

                if (isActive == 0 || stock <= 0) {
                    dto.setStatus("Out of Stock");
                } else if (stock <= 10) {
                    dto.setStatus("Low Stock");
                } else {
                    dto.setStatus("Active");
                }
                return dto;
            })
            .collect(Collectors.toList());
    }

    // ── POST /api/sellers/{sellerId}/products — product creation ──
    @PostMapping("/sellers/{sellerId}/products")
    public ResponseEntity<Product> addProduct(
            @PathVariable Integer sellerId,
            @RequestBody Product product) {
        product.setPartnerId(sellerId);
        Product saved = productRepository.save(product);
        return ResponseEntity.ok(saved);
    }

    // ── PUT /api/products/{id} — product update ──
    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Integer id,
            @RequestBody Product updatedProduct) {
        return productRepository.findById(id).map(product -> {
            if (updatedProduct.getName()          != null) product.setName(updatedProduct.getName());
            if (updatedProduct.getPrice()         != null) product.setPrice(updatedProduct.getPrice());
            if (updatedProduct.getStockQuantity() != null) product.setStockQuantity(updatedProduct.getStockQuantity());
            if (updatedProduct.getIsActive()      != null) product.setIsActive(updatedProduct.getIsActive());
            if (updatedProduct.getDescription()   != null) product.setDescription(updatedProduct.getDescription());
            if (updatedProduct.getDiscountPrice() != null) product.setDiscountPrice(updatedProduct.getDiscountPrice());
            if (updatedProduct.getSku()           != null) product.setSku(updatedProduct.getSku());
            if (updatedProduct.getImageUrl()      != null) product.setImageUrl(updatedProduct.getImageUrl());
            if (updatedProduct.getCategoryId()    != null) product.setCategoryId(updatedProduct.getCategoryId());
            productRepository.save(product);
            return ResponseEntity.ok().body("Product updated successfully");
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── DELETE /api/products/{id} — product delete ──
    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Integer id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productRepository.deleteById(id);
        return ResponseEntity.ok().body("Product deleted successfully");
    }
}