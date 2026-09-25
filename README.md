# 🎁 Giftora — Personalized Gift Box Marketplace

Giftora is a multi-vendor marketplace for building one personalized gift box from products supplied by different vendors. The platform coordinates product discovery, customization, checkout, vendor fulfilment, centralized quality assurance, packing, and order tracking in one workflow.

![Giftora multi-vendor workflow](docs/images/cover_page.jpg)

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](code/frontend/package.json)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.2-6DB33F?style=flat-square&logo=springboot&logoColor=white)](code/backend/nexus/pom.xml)
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8+-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Authentication](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens)
![Status](https://img.shields.io/badge/Status-Active%20Development-F0C96A?style=flat-square)

## Quick links

- [Project page](https://cepdnaclk.github.io/e23-co2060-GiftBox-Customization-Marketplace/)
- [GitHub repository](https://github.com/cepdnaclk/e23-co2060-GiftBox-Customization-Marketplace)
- [Presentation-facing documentation](docs/README.md)
- [Frontend test guide](code/frontend/src/__tests__/README.md)
- [Backend test guide](code/backend/nexus/src/test/README.md)

## The problem

Creating a thoughtful gift from several sellers is fragmented. Customers normally place separate orders, coordinate multiple delivery dates, accept inconsistent packaging, and track every parcel independently. Vendors also have no shared workflow for contributing products to a single finished gift.

## The Giftora solution

Giftora turns those separate purchases into one coordinated order:

1. A customer browses products from multiple approved vendors.
2. The customer chooses a ready-made gift or builds a custom box.
3. One checkout creates a parent order and vendor-specific sub-orders.
4. Each vendor prepares and dispatches its assigned items to the assembly hub.
5. An assembler verifies the items, resolves issues, packs the gift, and completes quality assurance.
6. The customer follows the order through a single milestone-based timeline.

## Core capabilities

### Customer experience

- Product catalogue with categories, search, and featured collections
- Interactive gift-box builder with live pricing
- Persistent cart, delivery details, and Stripe payment-intent flow
- Standard and custom-box checkout
- Order history, detailed status tracking, profile, and account settings

### Vendor portal

- Vendor registration and administrator approval
- Dashboard for catalogue and order activity
- Product creation, editing, inventory, activation, and Cloudinary image upload
- Vendor-specific sub-order queue and fulfilment updates
- Ready-made gift-box creation

### Assembly hub

- Incoming order queue and role-protected workspace
- Item verification and issue recording
- Assembly, quality-assurance, packing, and completion stages
- Packing guide, completed-order history, and operational metrics

### Administration

- Operational dashboard
- Vendor approval and status management
- Customer, category, and staff management
- Assembler account activation and performance overview

## Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│ React 19 client                                              │
│ Public site · Customer · Vendor · Assembler · Administrator  │
└──────────────────────────────┬───────────────────────────────┘
                               │ REST/JSON + JWT
┌──────────────────────────────▼───────────────────────────────┐
│ Spring Boot 4 API                                            │
│ Auth · Catalogue · Cart · Orders · Payments · Assembly       │
└──────────────────────────────┬───────────────────────────────┘
                               │ JPA + Flyway
┌──────────────────────────────▼───────────────────────────────┐
│ MySQL 8                                                      │
│ Users · Products · Carts · Orders · Sub-orders · Workflow    │
└──────────────────────────────────────────────────────────────┘
```

The frontend is designed for Vercel, the backend for Azure App Service, and the managed MySQL database for Aiven. GitHub Actions builds and deploys the backend and synchronizes the deployment branch.

## Technology stack

| Area | Technology |
|---|---|
| Frontend | React 19.2, React Router 7, Axios, Recharts, CSS |
| Backend | Spring Boot 4.0.2, Java 17, Maven, Spring Security, Spring Data JPA |
| Data | MySQL 8+, Flyway migrations V1–V24, H2 for automated integration tests |
| Security | JWT access/refresh flow, BCrypt, role-based access control |
| Payments and media | Stripe payment intents, Cloudinary uploads |
| Delivery | Vercel, Azure App Service, Aiven, GitHub Actions |
| Testing | Jest/React Testing Library, JUnit, Spring integration tests, optional MySQL suite |

## Repository layout

```text
.
├── code/
│   ├── backend/nexus/        Spring Boot API, migrations, and tests
│   └── frontend/             React application and tests
├── docs/                     GitHub Pages project site and metadata
└── README.md                 Repository overview and setup guide
```

## Run locally

### Prerequisites

- Node.js 18 or newer and npm
- Java 17
- MySQL 8 or newer

### 1. Clone the project

```bash
git clone https://github.com/cepdnaclk/e23-co2060-GiftBox-Customization-Marketplace.git
cd e23-co2060-GiftBox-Customization-Marketplace
```

### 2. Start the backend

Configure the database, JWT, email, Stripe, and allowed-origin values through environment variables or `code/backend/nexus/src/main/resources/application.properties`. Never commit real credentials.

```bash
cd code/backend/nexus
./mvnw spring-boot:run
```

The API starts on `http://localhost:8080` by default. Database changes are managed only through the versioned Flyway migrations in `code/backend/nexus/src/main/resources/db/migration`; there is no separate manual SQL setup folder.

### Database migrations

The backend is the single source of truth for the database schema and seed evolution:

```text
code/backend/nexus/src/main/resources/db/migration/
├── V1__initial_schema.sql ... V24__add_version_to_products.sql
├── assembly/     Assembly-workflow migrations
└── commerce/     Multi-vendor commerce migrations
```

Add future schema changes as new, versioned migrations. Do not edit an already-applied migration or maintain a second copy of the schema elsewhere in the repository.

### 3. Start the frontend

In another terminal:

```bash
cd code/frontend
npm install
npm start
```

The development client opens at `http://localhost:3000` and proxies local API requests to port `8080`. For a separately hosted API, set `REACT_APP_API_URL` before building or starting the client.

## Main API groups

| Area | Representative endpoints |
|---|---|
| Authentication | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/verify-email`, `POST /api/auth/refresh-token` |
| Catalogue | `GET /api/products`, `GET /api/categories`, `GET /api/vendors/{vendorId}/products` |
| Cart | `GET /api/cart`, `POST /api/cart/add`, `PUT /api/cart/update`, `POST /api/db-cart/sync` |
| Orders | `POST /api/orders/standard`, `POST /api/orders/custom-box`, `GET /api/customers/{customerId}/orders` |
| Vendors | `POST /api/vendors/register`, `GET /api/vendor/{vendorId}/dashboard`, `GET /api/vendors/{vendorId}/orders` |
| Assembly | `GET /api/assembler/orders`, `GET /api/assembler/orders/{id}`, `PUT /api/assembler/orders/{id}` |
| Administration | `GET /api/admin/dashboard`, `GET /api/vendors`, `GET /api/users`, `POST /api/assemblers` |
| Payments | `POST /api/payments/create-intent` |

## Testing

Run the frontend suite:

```bash
cd code/frontend
CI=true npm test -- --runInBand --watchAll=false
```

Run the backend unit and automated integration tests:

```bash
cd code/backend/nexus
./mvnw test
```

The optional MySQL assembly test has separate setup instructions in the [backend test guide](code/backend/nexus/src/test/README.md).

## Team Nexus

**Group:** E23 GR33

**Module:** CO2060 — Software Systems Design Project

**Department:** Computer Engineering, University of Peradeniya

| Student ID | Name | Email |
|---|---|---|
| E/23/167 | Karunarathna A. V. P. J. P. | [e23167@eng.pdn.ac.lk](mailto:e23167@eng.pdn.ac.lk) |
| E/23/351 | Sanjuna K. D. | [e23351@eng.pdn.ac.lk](mailto:e23351@eng.pdn.ac.lk) |
| E/23/412 | Vidanya A. P. S. | [e23412@eng.pdn.ac.lk](mailto:e23412@eng.pdn.ac.lk) |
| E/23/416 | Vishwaka A. G. S. | [e23416@eng.pdn.ac.lk](mailto:e23416@eng.pdn.ac.lk) |

## Academic links

- [Department of Computer Engineering](https://www.ce.pdn.ac.lk/)
- [Faculty of Engineering, University of Peradeniya](https://eng.pdn.ac.lk/)
- [Computer Engineering Projects Portal](https://projects.ce.pdn.ac.lk/)
