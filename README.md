# 🎁 Giftora — Personalized Gift Box Marketplace

> A centralized multi-vendor platform where customers can browse items from multiple vendors, assemble customized gift boxes, and have them quality-checked, professionally packaged, and delivered — all through one seamless experience.

---

## 👥 Team Nexus

| Student ID | Name | Email |
|------------|------|-------|
| E/23/167 | Karunarathna A. V. P. J. P. | [e23167@eng.pdn.ac.lk](mailto:e23167@eng.pdn.ac.lk) |
| E/23/351 | Sanjuna K. D. | [e23351@eng.pdn.ac.lk](mailto:e23351@eng.pdn.ac.lk) |
| E/23/412 | Vidanya A. P. S. | [e23412@eng.pdn.ac.lk](mailto:e23412@eng.pdn.ac.lk) |
| E/23/416 | Vishwaka A. G. S. | [e23416@eng.pdn.ac.lk](mailto:e23416@eng.pdn.ac.lk) |

**Module:** CO2060 — Software Design Project  
**Department:** Computer Engineering, University of Peradeniya

---

## 🚩 The Problem

Online gift-giving is broken. When someone wants to send a thoughtful, multi-item gift, they're forced to:

- Place **separate orders** across multiple vendor websites
- **Manually coordinate** delivery timelines
- Hope that packaging quality is consistent
- Deal with **multiple tracking systems** for one gift

This is especially painful when gifts are time-sensitive and non-returnable.

---

## 💡 Our Solution

Giftora introduces a **centralized assembly workflow**:

1. Customer browses a unified catalogue from multiple vendors
2. Customer builds a custom gift box in a single session
3. Vendors are notified and dispatch their items to our assembly hub
4. Assembly team **quality-checks, packages, and dispatches** the complete gift box
5. Customer tracks every milestone — from order placement to doorstep delivery

---

## ✨ Key Features

- **Multi-Vendor Gift Box Builder** — select items from different vendors into one box
- **Role-Based Access Control** — separate portals for Customers, Vendors, and Admins
- **Order Splitting Engine** — one checkout auto-splits into per-vendor sub-orders
- **Centralized Assembly Workflow** — quality inspection and professional packaging
- **Milestone-Based Order Tracking** — 5+ trackable stages with real-time updates
- **Vendor Portal** — product listing, inventory management, and order queue
- **Admin Dashboard** — vendor approval, operational monitoring, and reporting

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (v18+) |
| Backend | Spring Boot (Java, v3+) |
| Database | MySQL (v8+) |
| Authentication | JWT (JSON Web Tokens) |
| Communication | RESTful APIs over HTTPS |
| Containerization | Docker |
| Version Control | Git / GitHub |

---

## 🏗️ System Architecture

The platform follows a clean three-tier architecture:

```
[React.js Frontend]  ←→  [Spring Boot REST API]  ←→  [MySQL Database]
        ↕                          ↕
  [Customer / Vendor]     [JWT Auth | RBAC | Order Engine]
```

A single customer order flows through:
`Order Placed → Sub-orders Created → Vendor Dispatch → Hub Receipt → Quality Check → Assembly → Delivery`

---

## 🗓️ Project Timeline

| Phase | Weeks | Focus |
|-------|-------|-------|
| Phase 1 | 1–5 | Foundation: Auth, RBAC, Vendor Registration |
| Phase 2 | 6–11 | Core Marketplace: Browsing, Filtering, Cart, Checkout |
| Phase 3 | 12–17 | Assembly & Logistics Workflow |
| Phase 4 | 18–22 | Admin Tools, Notifications, UI Polish |
| Phase 5 | 23–28 | Testing, Optimization & Final Submission |

**Final Deadline:** July 26, 2026

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Java JDK (v17+)
- MySQL (v8+)
- Docker (optional, for containerized deployment)

### Setup

```bash
# Clone the repository
git clone https://github.com/cepdnaclk/e23-co2060-GiftBox-CustomizationMarketplace.git
cd e23-co2060-GiftBox-CustomizationMarketplace

# Frontend setup
cd frontend
npm install
npm start

# Backend setup (in a new terminal)
cd backend
./mvnw spring-boot:run
```

Configure your MySQL connection in `backend/src/main/resources/application.properties` before starting.

---

## 🔗 Links

- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)
- [CE Projects Portal](https://projects.ce.pdn.ac.lk)