package com.example.demo.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class AuthResponse {

    private String token;
    private UUID userId;
    private String username;
    private List<String> roles;

    public AuthResponse(String token, UUID userId, String username, List<String> roles) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.roles = roles;
    }
}
