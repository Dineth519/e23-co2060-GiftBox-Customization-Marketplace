# Giftora Bug Resolution Log

Date: 24 September 2026  
Testing types: unit, component, and integration testing

## Summary

| ID | Area | Problem | Resolution | Verification |
|---|---|---|---|---|
| BUG-01 | Vendor authentication | A vendor with a pending application could sign in before admin approval. | Added a vendor-status check to authentication. Only `ACTIVE` vendors can sign in. | Integration workflow verifies pending login is rejected, admin approval succeeds, and login succeeds afterward. |
| BUG-02 | Vendor administration | The vendor approval endpoint was not limited specifically to admins. | Protected `PUT /api/vendors/{id}/status` with the `ADMIN` role. | Integration workflow signs in as admin before approving the vendor. |
| BUG-03 | Order authorization | An authenticated user could attempt to create an order using another customer's ID. | Standard and custom order endpoints now require the authenticated customer ID to match the request customer ID. | Integration workflow creates an order using the signed-in customer's token and ID. |
| BUG-04 | Order status workflow | Status updates did not verify the actor who owned the order, and shipping/delivery transitions were missing. | Added role- and ownership-based transitions for vendor, assigned assembler, and customer. Added `READY -> SHIPPED -> DELIVERED -> RECEIVED`. | Integration workflow verifies the complete order lifecycle across all roles. |
| BUG-05 | Browser cart isolation | All customers used the same `giftora_cart` browser-storage key. A second customer could load the first customer's cart. | Cart storage keys are now customer-specific: `giftora_cart_<customerId>`; guests use `giftora_cart_guest`. | React component test switches between two customer IDs and verifies separate stored carts. |
| BUG-06 | Database cart sync | Repeated cart synchronization appended rows, causing duplicate items and quantities. | A sync now replaces the previous rows for that customer's vendor cart before saving the current items. | Integration workflow syncs the same cart twice and verifies that the new contents replace, rather than duplicate, the old contents. |
| BUG-07 | Cart authorization | A customer could request another customer's cart by changing an ID in the URL. | Cart endpoints now require the `CUSTOMER` role, matching customer ID, and cart ownership. | Integration workflow verifies cross-customer cart access returns HTTP 403. |
| BUG-08 | Assembly validation | Assembly rule checks could fail when required values were absent. | Added defensive null validation to the assembly rules. | Ten assembly-rule unit tests pass, including invalid and boundary inputs. |
| BUG-09 | Integration test database | Existing integration tests depended on a separately running MySQL database, making automated verification unreliable. | Added an isolated H2 integration profile with a fresh database for each test run. | The integration suite starts without an external database and completes successfully. |
| BUG-10 | Integration schema compatibility | The test schema initially lacked assembly workflow fields and assembler details used by the JDBC assembly service. | Added the required test-only schema columns and `gift_boxes` table during integration setup. | The assembler can confirm receipt, start assembly, submit the box, ship, and deliver in the automated test. |
| BUG-11 | Mixed JPA/JDBC test visibility | A test-wide transaction prevented JDBC assembly code from seeing status changes made by JPA during the same scenario. | Removed the outer test transaction and clean the isolated database explicitly before every test. | The vendor-confirmed order is visible to the assembly service and the end-to-end workflow passes. |

## Integration Scenarios Covered

### Scenario 1: Vendor approval and complete order lifecycle

1. A vendor submits an application.
2. The application is stored with `PENDING` status.
3. Vendor sign-in is rejected while approval is pending.
4. An admin signs in and changes the vendor status to `ACTIVE`.
5. The approved vendor signs in successfully.
6. A customer registers, verifies the account, and signs in.
7. The customer places an order and product stock is reduced.
8. The owning vendor confirms the order.
9. An assembler confirms receipt of the items.
10. The assembler starts assembly and submits the completed box.
11. The assigned assembler marks the order as shipped and delivered.
12. The owning customer marks the order as received.

Expected final status: `RECEIVED`.

### Scenario 2: Separate persistent carts

1. Two customers register and sign in independently.
2. Each customer saves a different cart.
3. Each customer receives only their own cart and items.
4. One customer cannot access the other customer's cart.
5. Re-saving a cart replaces its old items without duplicates.
6. Updating one customer's cart does not change the other customer's cart.

## Final Automated Test Results

### Backend unit tests

Command:

```bash
./mvnw -Dtest='com.example.nexus.unit.*Test' test
```

Result:

```text
Tests run: 13, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

### Backend integration tests

Command:

```bash
./mvnw -Dtest='com.example.nexus.integration.*Test,com.example.nexus.integration.*Tests' test
```

Result:

```text
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

### Frontend unit tests

Command:

```bash
CI=true npm test -- --runInBand --watchAll=false src/__tests__/unit
```

Result:

```text
Test Suites: 11 passed, 11 total
Tests:       64 passed, 64 total
```

### Frontend component tests

Command:

```bash
CI=true npm test -- --runInBand --watchAll=false src/__tests__/component
```

Result:

```text
Test Suites: 2 passed, 2 total
Tests:       12 passed, 12 total
```

## Tools and Techniques

- JUnit 5 and Spring Boot Test for backend unit and integration tests.
- MockMvc for testing secured REST endpoints and complete multi-role workflows.
- H2 in-memory database for isolated repeatable integration tests.
- React Testing Library and Jest for frontend component and unit tests.
- State-based assertions for database records, stock, cart ownership, and final order status.
- Positive and negative testing for successful workflows and unauthorized access.
