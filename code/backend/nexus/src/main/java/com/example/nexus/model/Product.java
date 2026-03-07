package com.example.nexus.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;

// Entity class representing the 'products' table in the MySQL database
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double price;

    // Maps to the 'image_url' column in the database
    @JsonProperty("imageUrl")
    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    // Maps to the 'category_id' column in the database
    @Column(name = "category_id")
    private Integer categoryId;

    // Default constructor required by JPA
    public Product() {
    }

    // Getters and Setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }
}
