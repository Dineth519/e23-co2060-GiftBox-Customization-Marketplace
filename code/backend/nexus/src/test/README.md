# Backend test organization

Tests are separated by testing level.

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
- `integration/`: Spring application, secured endpoints, services, repositories, and H2 database working together.
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

