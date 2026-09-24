# Frontend test organization

Tests are grouped first by testing level and then by application role.

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

## Placement rules

- Put pure function, validation, calculation, payload, and mocked request tests in `unit/<role>`.
- Put tests that render React components or providers in `component/<role>`.
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
