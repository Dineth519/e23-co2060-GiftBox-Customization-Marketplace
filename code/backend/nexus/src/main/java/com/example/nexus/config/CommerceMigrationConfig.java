package com.example.nexus.config;

import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;

/**
 * Applies checkout schema repairs separately from the disabled legacy migration
 * history. The production database predates multi-vendor parent orders.
 */
@Configuration
public class CommerceMigrationConfig {
    @Bean
    @DependsOn("entityManagerFactory")
    public Flyway commerceFlyway(DataSource dataSource,
            @Value("${app.commerce-migrations.enabled:true}") boolean enabled) {
        Flyway flyway = Flyway.configure().dataSource(dataSource)
                .locations("classpath:db/migration/commerce")
                .table("commerce_schema_history")
                .baselineOnMigrate(true).baselineVersion("0")
                .validateOnMigrate(true).outOfOrder(false).load();
        if (enabled) flyway.migrate();
        return flyway;
    }
}
