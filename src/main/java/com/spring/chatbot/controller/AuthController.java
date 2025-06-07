package com.spring.chatbot.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    private static final String COMMON_PASSWORD = "@letmein123"; // shared password

    @PostMapping("/api/authenticate")
    public ResponseEntity<?> authenticate(@RequestBody AuthRequest request) {
        if (COMMON_PASSWORD.equals(request.getPassword())) {
            return ResponseEntity.ok().build(); // allow any username with correct password
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // wrong password
    }

    static class AuthRequest {
        private String username;
        private String password;

        // Getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
