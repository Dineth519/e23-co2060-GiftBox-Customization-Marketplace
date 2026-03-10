package com.example.nexus.dto;

// DTO for React "Add to Cart" POST request
// Backend receives this shape from the frontend

public class AddToCart {

    private int    productId;
    private String name;
    private double price;
    private String imageUrl;

    // Getters
    public int    getProductId() { return productId; }
    public String getName()      { return name;      }
    public double getPrice()     { return price;     }
    public String getImageUrl()  { return imageUrl;  }

    // Setters — required for Jackson JSON deserialization
    public void setProductId(int productId)  { this.productId = productId; }
    public void setName(String name)         { this.name      = name;      }
    public void setPrice(double price)       { this.price     = price;     }
    public void setImageUrl(String imageUrl) { this.imageUrl  = imageUrl;  }
}