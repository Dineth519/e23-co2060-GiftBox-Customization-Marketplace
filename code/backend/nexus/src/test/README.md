# Giftora backend test guide

The backend suite verifies security, business rules, the marketplace workflow, and the assembly persistence model. Tests are separated by testing level so the fast default suite remains independent of external services.

```text
src/test/
├── java/com/example/nexus/
│   ├── unit/
│   │   ├── AssemblyRulesTest.java
│   │   └── JwtServiceTest.java
│   └── integration/
│       ├── MarketplaceWorkflowIntegrationTest.java
│       ├── NexusApplicationTests.java
│       └── mysql/
│           └── AssemblyIntegrationTest.java
└── resources/
    └── application-integration.properties
```

## Test levels

- `unit/`: isolated business-rule and token tests; no application context or database.
- `integration/`: Spring application, secured endpoints, services, repositories, Flyway migrations, and H2 database working together.
- `integration/mysql/`: optional migration and JDBC verification against a disposable local MySQL schema. This suite stays disabled unless its required system property is supplied.

## Commands

Run unit tests only:

```bash
./mvnw -Dtest='com.example.nexus.unit.*Test' test
```

Run the automated H2 integration tests only:

```bash
./mvnw -Dtest='com.example.nexus.integration.*Test,com.example.nexus.integration.*Tests' test
```

Run unit and automated integration tests together:

```bash
./mvnw -Dtest='com.example.nexus.unit.*Test,com.example.nexus.integration.*Test,com.example.nexus.integration.*Tests' test
```

Run the optional MySQL assembly integration suite:

```bash
./mvnw -Dtest=AssemblyIntegrationTest \
  -Dassembly.test.url='jdbc:mysql://127.0.0.1:3308/assembly_test?allowPublicKeyRetrieval=true&useSSL=false' test
```

All commands are run from `code/backend/nexus`. The optional MySQL test may create and update records in the configured disposable schema, so it must never target a shared or production database.
