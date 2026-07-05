package com.example.nexus.repository;

import com.example.nexus.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    
    /**
     * Finds all root categories (categories where parent is NULL).
     */
    List<Category> findByParentIsNull();
}
