package com.example.nexus.controller;

import com.example.nexus.dto.ProductDTO;
import com.example.nexus.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sellers")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/{sellerId}/products")
    public List<ProductDTO> getProductsBySeller(@PathVariable Integer sellerId) {
        
        return productRepository.findByPartnerId(sellerId)
            .stream()
            .map(product -> {
                ProductDTO dto = new ProductDTO();
                dto.setId(product.getId());
                dto.setName(product.getName());
                
                dto.setCategory(product.getCategoryId() == null ? "Uncategorized" : "Category ID: " + product.getCategoryId());
                
                dto.setPrice(product.getPrice());
                dto.setStock(product.getStockQuantity() != null ? product.getStockQuantity() : 0);
                dto.setSold(0);
                dto.setRating(product.getRating() != null ? product.getRating().doubleValue() : 0.0);
                dto.setImage(product.getImageUrl());
                
                int stock = dto.getStock();
                int isActive = product.getIsActive() != null ? product.getIsActive() : 1;

                if (isActive == 0 || stock <= 0) {
                    dto.setStatus("Out of Stock");
                } else if (stock <= 10) {
                    dto.setStatus("Low Stock");
                } else {
                    dto.setStatus("Active");
                }
                
                return dto;
            }).collect(Collectors.toList());
    }
}