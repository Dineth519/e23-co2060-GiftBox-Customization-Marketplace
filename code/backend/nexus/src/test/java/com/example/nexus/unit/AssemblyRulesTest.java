package com.example.nexus.unit;

import com.example.nexus.service.AssemblyRules;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AssemblyRulesTest {
    private static final List<Boolean> NO = Collections.nCopies(6, false);
    private static final List<Boolean> YES = Collections.nCopies(6, true);

    private AssemblyRules.Change change(String action, List<Boolean> checks, String notes, String issue) {
        return new AssemblyRules.Change(
                0,
                action,
                List.of(new AssemblyRules.Item(1, 2, "good")),
                checks,
                notes,
                issue);
    }

    @Test
    void saveKeepsTheCurrentStatus() {
        assertEquals("assembling", AssemblyRules.nextStatus(
                "assembling", true, true, change("save", NO, "", "")));
    }

    @Test
    void validWorkflowActionsMoveToTheirExpectedStatuses() {
        assertEquals("assembling", AssemblyRules.nextStatus(
                "awaiting", false, true, change("confirm", NO, "", "")));
        assertEquals("completed", AssemblyRules.nextStatus(
                "assembling", true, true, change("submit", YES, "", "")));
        assertEquals("hold", AssemblyRules.nextStatus(
                "assembling", true, false, change("report", NO, "", "Damaged item")));
        assertEquals("awaiting", AssemblyRules.nextStatus(
                "hold", false, true, change("resolve", NO, "", "")));
    }

    @Test
    void submissionRequiresEveryQualityCheck() {
        var incomplete = List.of(true, true, true, true, true, false);
        assertBadRequest(() -> AssemblyRules.nextStatus(
                "assembling", true, true, change("submit", incomplete, "", "")),
                "Complete receipts, assembly and all six quality checks before submission.");
    }

    @Test
    void qualityCheckListMustContainExactlySixValues() {
        assertBadRequest(() -> AssemblyRules.nextStatus(
                "assembling", true, true, change("save", List.of(true), "", "")),
                "Exactly six quality checks are required.");
    }

    @Test
    void issueAndNoteLengthBoundariesAreEnforced() {
        assertEquals("hold", AssemblyRules.nextStatus(
                "assembling", true, false, change("report", NO, "n".repeat(1000), "i".repeat(500))));
        assertBadRequest(() -> AssemblyRules.nextStatus(
                "assembling", true, false, change("report", NO, "n".repeat(1001), "Valid issue")),
                "Packing notes must be at most 1000 characters.");
        assertBadRequest(() -> AssemblyRules.nextStatus(
                "assembling", true, false, change("report", NO, "", "i".repeat(501))),
                "Describe the issue using 1 to 500 characters.");
    }

    @Test
    void submittedOrdersCannotBeChanged() {
        assertBadRequest(() -> AssemblyRules.nextStatus(
                "completed", true, true, change("save", YES, "", "")),
                "Completed orders are locked.");
    }

    @Test
    void unknownActionsAreRejected() {
        assertBadRequest(() -> AssemblyRules.nextStatus(
                "awaiting", false, false, change("delete", NO, "", "")),
                "Unknown assembly action.");
    }

    @Test
    void itemQuantityAcceptsItsBoundaries() {
        AssemblyRules.validateItem(new AssemblyRules.Item(1, 0, "unchecked"), 2);
        AssemblyRules.validateItem(new AssemblyRules.Item(1, 2, "good"), 2);
    }

    @Test
    void itemQuantityOutsideTheOrderedRangeIsRejected() {
        assertBadRequest(() -> AssemblyRules.validateItem(
                new AssemblyRules.Item(1, -1, "good"), 2),
                "Received quantities must be between zero and the ordered quantity.");
        assertBadRequest(() -> AssemblyRules.validateItem(
                new AssemblyRules.Item(1, 3, "good"), 2),
                "Received quantities must be between zero and the ordered quantity.");
    }

    @Test
    void unknownItemConditionIsRejected() {
        assertBadRequest(() -> AssemblyRules.validateItem(
                new AssemblyRules.Item(1, 1, "missing"), 2),
                "Choose a valid item condition.");
    }

    private void assertBadRequest(Runnable action, String message) {
        var exception = assertThrows(ResponseStatusException.class, action::run);
        assertEquals(400, exception.getStatusCode().value());
        assertEquals(message, exception.getReason());
    }
}
