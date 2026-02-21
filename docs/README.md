---
layout: home
permalink: index.html

# Please update this with your repository name and project title
repository-name: e23-co2060-GiftBox-Customization-Marketplace
title: GiftBox-Customization-Marketplace
---

[comment]: # "This is the standard layout for the project, but you can clean this and use your own template, and add more information required for your own project"

<!-- Once you fill the index.json file inside /docs/data, please make sure the syntax is correct. (You can use this tool to identify syntax errors)

Please include the "correct" email address of your supervisors. (You can find them from https://people.ce.pdn.ac.lk/ )

Please include an appropriate cover page image ( cover_page.jpg ) and a thumbnail image ( thumbnail.jpg ) in the same folder as the index.json (i.e., /docs/data ). The cover page image must be cropped to 940×352 and the thumbnail image must be cropped to 640×360 . Use https://croppola.com/ for cropping and https://squoosh.app/ to reduce the file size.

If your followed all the given instructions correctly, your repository will be automatically added to the department's project web site (Update daily)

A HTML template integrated with the given GitHub repository templates, based on github.com/cepdnaclk/eYY-project-theme . If you like to remove this default theme and make your own web page, you can remove the file, docs/_config.yml and create the site using HTML. -->

# GiftBox-Customization-Marketplace
---

## Team
-  E/23/167 - Name, [email](mailto:e23167@eng.pdn.ac.lk)
-  E/23/351 - Sanjuna K.D - [email](mailto:e23351@eng.pdn.ac.lk)
-  E/23/412 - Name, [email](mailto:e23412@eng.pdn.ac.lk)
-  E/23/416 - Vishwaka A.G.S, [email](mailto:e23416@eng.pdn.ac.lk)

<!-- Image (photo/drawing of the final hardware) should be here -->

<!-- This is a sample image, to show how to add images to your page. To learn more options, please refer [this](https://projects.ce.pdn.ac.lk/docs/faq/how-to-add-an-image/) -->

<!-- ![Sample Image](./images/sample.png) -->

#### Table of Contents
1. [Introduction](#introduction)
2. [Solution Architecture](#solution-architecture )
3. [Software Designs](#hardware-and-software-designs)
4. [Testing](#testing)
5. [Conclusion](#conclusion)
6. [Links](#links)

## Introduction

### Problem Statement

Online gift-giving has grown rapidly, yet existing e-commerce platforms offer no native way to select items from multiple vendors and combine them into a single gift package. Customers are forced to:

- Place separate orders across different stores
- Manually coordinate delivery timelines
- Accept inconsistent packaging and quality
- Manage multiple tracking systems for one occasion

These gaps are especially painful for time-sensitive, non-returnable gifts where quality and punctuality are critical.

### Proposed Solution

**Giftora** is a centralized multi-vendor gift box customization marketplace. Customers build a single personalized gift box by selecting items from any number of registered vendors, check out once, and receive one professionally assembled, quality-checked delivery.

The platform introduces a **centralized assembly workflow**: a dedicated team collects items from vendors, inspects and assembles them, and dispatches the final gift box — ensuring consistent packaging standards and reliable delivery timelines.

### Impact

**For Customers** — One checkout, one delivery, zero coordination headache. Personalized gifts without logistical complexity.

**For Vendors** — Broader customer reach, reduced individual shipping overhead, and clear order workflow integration.

**For the Gift Industry** — A scalable model for multi-vendor collaboration with built-in quality assurance.

---

## Solution Architecture

Giftora is a full-stack web application structured around three tiers:

- **Frontend** — A React.js (v18+) single-page application serving role-specific dashboards for Customers, Vendors, Assembly Staff, and Administrators over HTTPS
- **Backend** — A Spring Boot (Java, v3+) RESTful API layer handling business logic, JWT-based authentication, RBAC enforcement, order splitting, and assembly workflow coordination
- **Database** — A MySQL (v8+) relational database storing users, products, orders, sub-orders, assembly records, and tracking milestones

A single customer order is split internally into **sub-orders per vendor**, each tracked independently and merged for the customer-facing milestone view. Real-time status updates are delivered via API polling or WebSocket connections.

---

## Software Design

### Core Modules

**User Management** — Secure registration and login for Customers, Vendors, and Administrators. JWT-based stateless authentication, BCrypt password hashing, and role-based access control (RBAC) enforced at both API and UI layers.

**Gift Box Customisation Engine** — An interactive canvas where customers browse a searchable, filterable multi-vendor catalogue, add items from different sellers into one gift box, view a real-time cost total, attach a personalised message, and save drafts for later.

**Vendor & Item Management** — A dedicated vendor portal for creating, editing, and managing product listings with images, pricing, and stock levels. Stock is automatically decremented on order confirmation.

**Order Management & Splitting** — On checkout, a master order record is created and automatically split into one sub-order per vendor. Vendors are notified immediately; administrators manage the assembly hub workflow.

**Milestone-Based Order Tracking** — Customers see a clear timeline across five stages: *Order Placed → Vendor Processing → Items Dispatched to Hub → Quality Inspection → Out for Delivery*, each with a recorded timestamp.

### Technology Stack

| Layer | Technology             |
|---|------------------------|
| Frontend | React.js v18+          |
| Backend | Spring Boot v3+ (Java) |
| Database | MySQL v8+              |
| Auth | JWT + BCrypt           |
| Version Control | Git / GitHub           |

---

## Testing

The system is verified across four strategies:

- **Unit Tests** — Backend service/utility methods with JUnit; frontend components with Jest
- **Integration Tests** — API endpoint behaviour verified against the SRS using Postman collections
- **System Tests** — End-to-end user journey scenarios on a deployed staging environment
- **Security Tests** — JWT validation, RBAC enforcement, and input sanitisation via targeted API tests

Automated regression tests run on every pull request to the main branch. Final User Acceptance Testing (UAT) simulates the full gift customization lifecycle with real user scenarios.

---

## Conclusion

Giftora addresses a genuine gap in the online gifting market by combining multi-vendor item selection, centralized assembly, and milestone-based tracking into one seamless platform. The project demonstrates practical application of full-stack web development, secure system design, RESTful API architecture, and Agile project management — and provides a foundation for future enhancements including AI-powered gift recommendations, mobile applications, and multi-currency support.

## Links

- [Project Repository](https://github.com/cepdnaclk/{{ page.repository-name }}){:target="_blank"}
- [Project Page](https://cepdnaclk.github.io/{{ page.repository-name }}/){:target="_blank"}
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)

[//]: # (Please refer this to learn more about Markdown syntax)
[//]: # (https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)
