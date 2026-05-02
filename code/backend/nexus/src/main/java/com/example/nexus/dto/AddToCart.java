package com.example.nexus.dto;

// ── DTO for React "Add to Cart" POST request ─────────────
// Body: { productId?, giftBoxId?, name, price, imageUrl }
// productId OR giftBoxId — one will be null

public class AddToCart {

    private Integer productId;   // null if adding a gift box
    private Integer giftBoxId;   // [NEW] null if adding a product
    private String  name;
    private double  price;
    private String  imageUrl;

    // ── Getters ──────────────────────────────────────────
    public Integer getProductId()  { return productId;  }
    public Integer getGiftBoxId()  { return giftBoxId;  }
    public String  getName()       { return name;       }
    public double  getPrice()      { return price;      }
    public String  getImageUrl()   { return imageUrl;   }

    // ── Setters ──────────────────────────────────────────
    public void setProductId(Integer productId)  { this.productId = productId; }
    public void setGiftBoxId(Integer giftBoxId)  { this.giftBoxId = giftBoxId; }
    public void setName(String name)             { this.name      = name;      }
    public void setPrice(double price)           { this.price     = price;     }
    public void setImageUrl(String imageUrl)     { this.imageUrl  = imageUrl;  }

    // Helper — is this a gift box add?
    public boolean isGiftBox() {
        return giftBoxId != null && productId == null;
    }
}