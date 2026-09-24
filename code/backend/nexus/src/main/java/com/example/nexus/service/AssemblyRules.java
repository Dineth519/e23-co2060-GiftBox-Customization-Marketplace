package com.example.nexus.service;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Validates workflow changes independently of the browser. */
public final class AssemblyRules {
    private AssemblyRules() {}
    public record Item(Integer id, Integer received, String condition) {}
    public record Change(Integer revision, String action, List<Item> items, List<Boolean> checks,
                         String notes, String issue) {}

    public static String nextStatus(String current, boolean confirmed, boolean ready, Change change) {
        require(change != null && change.action() != null, "Choose an assembly action.");
        require(change.checks() != null && change.checks().size() == 6
                        && change.checks().stream().noneMatch(Objects::isNull),
                "Exactly six quality checks are required.");
        require(change.notes() != null && change.notes().length() <= 1000, "Packing notes must be at most 1000 characters.");
        require(!"completed".equals(current), "Completed orders are locked.");
        return switch (change.action()) {
            case "save" -> current;
            case "confirm" -> {
                require(ready && !"hold".equals(current), "Receive and inspect every item and resolve holds first.");
                yield "assembling";
            }
            case "submit" -> {
                require(confirmed && ready && "assembling".equals(current) && change.checks().stream().allMatch(Boolean.TRUE::equals),
                        "Complete receipts, assembly and all six quality checks before submission.");
                yield "completed";
            }
            case "report" -> {
                require(change.issue() != null && !change.issue().isBlank() && change.issue().length() <= 500,
                        "Describe the issue using 1 to 500 characters.");
                yield "hold";
            }
            case "resolve" -> {
                require("hold".equals(current) && ready, "Receive all items in good condition before clearing the hold.");
                yield "awaiting";
            }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown assembly action.");
        };
    }

    public static void validateItem(Item item, int expected) {
        require(item != null && item.received() != null && item.received() >= 0 && item.received() <= expected,
                "Received quantities must be between zero and the ordered quantity.");
        require(item.condition() != null && Set.of("unchecked", "good", "damaged", "incorrect").contains(item.condition()),
                "Choose a valid item condition.");
    }

    public static void require(boolean condition, String message) {
        if (!condition) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
