package com.example.nexus.config;

import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;

/**
 * The hosted schema was also managed by Hibernate and its legacy Flyway history
 * records only V1/V2. Never replay the unrelated legacy cleanup scripts here.
 * Keep assembly changes in a separate namespace without rewriting old history.
 */
@Configuration
public class AssemblyMigrationConfig {
    @Bean
    @DependsOn("entityManagerFactory")
    public Flyway assemblyFlyway(DataSource dataSource,
            @Value("${app.assembly-migrations.enabled:true}") boolean enabled) {
        Flyway flyway = Flyway.configure().dataSource(dataSource)
                .locations("classpath:db/migration/assembly")
                .table("assembly_schema_history")
                .baselineOnMigrate(true).baselineVersion("0")
                .validateOnMigrate(true).outOfOrder(false).load();
        // Hibernate ensures the existing Order fields (including V22 fields) exist first.
        if (enabled) flyway.migrate();
        return flyway;
    }
}
