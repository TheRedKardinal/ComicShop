package com.example.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "Username o email obbligatori")
    private String usernameOrEmail;

    @NotBlank(message = "La password è obbligatoria")
    private String password;
}
