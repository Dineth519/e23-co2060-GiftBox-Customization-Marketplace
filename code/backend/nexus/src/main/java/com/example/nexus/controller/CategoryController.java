package com.example.nexus.controller;

import com.example.nexus.model.Category;
import com.example.nexus.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * Returns all root (parent) categories with their subcategories as a safe DTO tree.
     */
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> getCategoryTree() {
        try {
            List<Category> roots = categoryRepository.findByParentIsNull();
            List<Map<String, Object>> result = new ArrayList<>();

            for (Category root : roots) {
                Map<String, Object> parentMap = new LinkedHashMap<>();
                parentMap.put("id", root.getId());
                parentMap.put("name", root.getName());

                List<Map<String, Object>> subs = new ArrayList<>();
                if (root.getSubcategories() != null) {
                    for (Category sub : root.getSubcategories()) {
                        Map<String, Object> subMap = new LinkedHashMap<>();
                        subMap.put("id", sub.getId());
                        subMap.put("name", sub.getName());
                        subs.add(subMap);
                    }
                }
                parentMap.put("subcategories", subs);
                result.add(parentMap);
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            Map<String, String> err = new LinkedHashMap<>();
            err.put("error", e.getClass().getSimpleName());
            err.put("message", e.getMessage());
            return ResponseEntity.status(500).body(err);
        }
    }

    /**
     * Returns a flat list of all subcategories (where parent is not NULL).
     */
    @GetMapping("/subcategories")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getFlatSubcategories() {
        List<Map<String, Object>> result = new ArrayList<>();
        categoryRepository.findAll().stream()
                .filter(c -> c.getParent() != null)
                .forEach(c -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", c.getId());
                    m.put("name", c.getName());
                    result.add(m);
                });
        return result;
    }
}
