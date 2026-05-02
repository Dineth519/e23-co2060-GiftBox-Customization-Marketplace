package com.example.nexus.dto;

// ── Session CartItem ─────────────────────────────────────
// React ට response දෙද්දි use කරනවා (CartResponse ඇතුලේ)
// DB CartItemEntity ↔ මේ model convert කරගෙන යනවා CartService එකෙන්
// name + imageUrl DB cart_items table එකේ නෑ —
//   ඒ නිසා products table join කරලා CartService fill කරනවා

public class CartItem {

    private int    productId;
    private Integer giftBoxId;   // [NEW] gift box support
    private String name;
    private double price;
    private int    quantity;
    private String imageUrl;
    private String itemType;     // [NEW] "PRODUCT" or "GIFT_BOX"

    // ── Constructor — Product ────────────────────────────
    public CartItem(int productId, String name,
                    double price, int quantity, String imageUrl) {
        this.productId = productId;
        this.giftBoxId = null;
        this.name      = name;
        this.price     = price;
        this.quantity  = quantity;
        this.imageUrl  = imageUrl;
        this.itemType  = "PRODUCT";
    }

    // ── Constructor — Gift Box ───────────────────────────
    public CartItem(Integer giftBoxId, String name,
                    double price, int quantity, String imageUrl,
                    boolean isGiftBox) {
        this.productId = 0;
        this.giftBoxId = giftBoxId;
        this.name      = name;
        this.price     = price;
        this.quantity  = quantity;
        this.imageUrl  = imageUrl;
        this.itemType  = "GIFT_BOX";
    }

    // ── Getters ──────────────────────────────────────────
    public int     getProductId()  { return productId;  }
    public Integer getGiftBoxId()  { return giftBoxId;  }
    public String  getName()       { return name;       }
    public double  getPrice()      { return price;      }
    public int     getQuantity()   { return quantity;   }
    public String  getImageUrl()   { return imageUrl;   }
    public String  getItemType()   { return itemType;   }

    // ── Setters ──────────────────────────────────────────
    public void setQuantity(int quantity) { this.quantity = quantity; }

    // price × quantity
    public double getSubtotal() {
        return price * quantity;
    }
}