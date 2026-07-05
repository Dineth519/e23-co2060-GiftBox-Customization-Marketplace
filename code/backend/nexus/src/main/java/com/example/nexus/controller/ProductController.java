package com.example.nexus.controller;

import com.example.nexus.dto.ProductDTO;
import com.example.nexus.model.Product;
import com.example.nexus.model.Category;
import com.example.nexus.repository.ProductRepository;
import com.example.nexus.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // GET /api/products — Fetch all products for the customer-facing Products Page
    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // GET /api/products/new-arrivals — Latest 8 active products (landing page)
    @GetMapping("/products/new-arrivals")
    public List<Product> getNewArrivals() {
        return productRepository.findAll(
            PageRequest.of(0, 8, Sort.by(Sort.Direction.DESC, "id"))
        ).getContent()
          .stream()
          .filter(p -> p.getIsActive() == null || p.getIsActive() == 1)
          .collect(Collectors.toList());
    }

    // GET /api/products/hot-sellers — Top 8 by rating (landing page)
    @GetMapping("/products/hot-sellers")
    public List<Product> getHotSellers() {
        return productRepository.findAll(
            PageRequest.of(0, 8, Sort.by(Sort.Direction.DESC, "rating"))
        ).getContent()
          .stream()
          .filter(p -> p.getIsActive() == null || p.getIsActive() == 1)
          .collect(Collectors.toList());
    }

    // ── GET /api/vendors/{vendorId}/products — Vendor dashboard ──
    @GetMapping("/vendors/{vendorId}/products")
    public List<ProductDTO> getProductsByVendor(@PathVariable Integer vendorId) {
        return productRepository.findByVendorId(vendorId)
            .stream()
            .map(product -> {
                ProductDTO dto = new ProductDTO();
                dto.setId(product.getId());
                dto.setName(product.getName());
                dto.setCategory(product.getCategoryId() == null
                    ? "Uncategorized"
                    : categoryRepository.findById(product.getCategoryId())
                        .map(com.example.nexus.model.Category::getName)
                        .orElse("Unknown"));
                dto.setSubCategory(product.getSubCategory());
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

    // ── POST /api/vendors/{vendorId}/products — product creation ──
    @PostMapping("/vendors/{vendorId}/products")
    public ResponseEntity<Product> addProduct(
            @PathVariable Integer vendorId,
            @RequestBody Product product) {
        product.setVendorId(vendorId);
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