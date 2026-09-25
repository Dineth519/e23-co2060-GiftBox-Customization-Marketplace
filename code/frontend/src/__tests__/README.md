# Giftora frontend test guide

The frontend suite verifies shared utilities and the Customer, Vendor, Assembler, and Administrator experiences. Tests in `src/__tests__` are grouped first by testing level and then by application role; a small number of page-focused tests are colocated with their components.

```text
__tests__/
├── unit/
│   ├── admin/       Admin rules, payloads, and mocked API requests
│   ├── assembler/   Assembly rules and mocked API requests
│   ├── customer/    Selection, ordering, and mocked API requests
│   ├── shared/      Cross-role utilities such as authentication
│   └── vendor/      Product, inventory, order, and mocked API rules
└── component/
    ├── assembler/   React assembler component behaviour
    └── customer/    React cart-provider behaviour
```

Colocated tests currently cover assembler dashboard/profile presentation and monthly-output calculations under `src/pages/assembler`.

## Placement rules

- Put pure function, validation, calculation, payload, and mocked request tests in `unit/<role>`.
- Put tests that render React components or providers in `component/<role>`.
- Keep a test beside its page only when it is tightly coupled to that single page; shared behaviour belongs in `src/__tests__`.
- Name every test file `*.test.js` or `*.test.jsx` so React Scripts discovers it automatically.
- Do not connect unit tests to the live database, Stripe, email, Cloudinary, or backend server.
- Backend API and database integration workflows are stored separately in
  `code/backend/nexus/src/test/java/com/example/nexus/integration`.

## Commands

Run all frontend tests once:

```bash
CI=true npm test -- --runInBand --watchAll=false
```

Run frontend unit tests only:

```bash
CI=true npm test -- --runInBand --watchAll=false src/__tests__/unit
```

Run frontend component tests only:

```bash
CI=true npm test -- --runInBand --watchAll=false src/__tests__/component
```

Run with coverage:

```bash
CI=true npm test -- --runInBand --coverage --watchAll=false
```

All commands are run from `code/frontend`. The suite uses Jest and React Testing Library through React Scripts and must not require the live backend or third-party services.
