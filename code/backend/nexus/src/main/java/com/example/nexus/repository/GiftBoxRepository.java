package com.example.nexus.repository;

import com.example.nexus.model.GiftBox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GiftBoxRepository extends JpaRepository<GiftBox, Integer> {
    // මූලික CRUD operations මෙහි අන්තර්ගත වේ
}