package com.example.nexus.controller;

import com.example.nexus.model.User;
import com.example.nexus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Get all users
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Temporary test — add a dummy user (delete this after testing)
    @GetMapping("/add-test-user")
    public String addTestUser() {
        User newUser = new User();
        newUser.setUsername("giftbox_fan");
        newUser.setEmail("fan@giftbox.com");
        newUser.setPassword("supersecret");
        userRepository.save(newUser);
        return "User saved successfully! Go check MySQL Workbench.";
    }
}