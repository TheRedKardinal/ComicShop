package com.example.demo.controller;

import com.example.demo.dto.response.MessageResponse;
import com.example.demo.service.RoleAssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/roles")
@PreAuthorize("hasRole('ADMIN')")
public class UserRoleController {

    private final RoleAssignmentService roleAssignmentService;

    public UserRoleController(RoleAssignmentService roleAssignmentService) {
        this.roleAssignmentService = roleAssignmentService;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<MessageResponse> addAdminRole(@PathVariable UUID userId) {
        roleAssignmentService.addAdminRole(userId);
        return ResponseEntity.ok(new MessageResponse("Ruolo Admin assegnato con successo"));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<MessageResponse> deleteAdminRole(@PathVariable UUID userId) {
        roleAssignmentService.deleteAdminRole(userId);
        return ResponseEntity.ok(new MessageResponse("Ruolo Admin revocato con successo"));
    }
}
