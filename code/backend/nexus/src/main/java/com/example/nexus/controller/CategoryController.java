package com.example.nexus.controller;

import com.example.nexus.model.Category;
import com.example.nexus.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * Fetches all root categories, including their nested subcategories.
     */
    @GetMapping
    public List<Category> getCategoryTree() {
        return categoryRepository.findByParentIsNull();
    }

    /**
     * Fetches a flat list of all subcategories (where parent is not NULL).
     */
    @GetMapping("/subcategories")
    public List<Category> getFlatSubcategories() {
        return categoryRepository.findAll().stream()
                .filter(c -> c.getParent() != null)
                .collect(Collectors.toList());
    }
}
