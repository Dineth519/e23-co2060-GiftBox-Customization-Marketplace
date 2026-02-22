package com.example.nexus.repository;

import com.example.nexus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    User findByEmail(String email);

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    
    // Used for Logging In
    Optional<User> findByUsername(String username);
    
    // Used for Password Recovery and Registration checks
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
}