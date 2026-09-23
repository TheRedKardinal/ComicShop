package com.example.demo.service;

import com.example.demo.exception.DuplicateResourceException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.UserRoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class RoleAssignmentService {

    public static final String ADMIN_ROLE = "Admin";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;

    public RoleAssignmentService(UserRepository userRepository,
                                  RoleRepository roleRepository,
                                  UserRoleRepository userRoleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
    }

    @Transactional
    public void addAdminRole(UUID userId) {
        User user = findUser(userId);
        Role adminRole = findAdminRole();

        if (userRoleRepository.existsByUserAndRole(user, adminRole)) {
            throw new DuplicateResourceException("L'utente ha già il ruolo Admin");
        }

        userRoleRepository.save(new UserRole(user, adminRole));
    }

    @Transactional
    public void deleteAdminRole(UUID userId) {
        User user = findUser(userId);
        Role adminRole = findAdminRole();

        if (!userRoleRepository.existsByUserAndRole(user, adminRole)) {
            throw new ResourceNotFoundException("L'utente non ha il ruolo Admin");
        }

        userRoleRepository.deleteByUserAndRole(user, adminRole);
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato: " + userId));
    }

    private Role findAdminRole() {
        return roleRepository.findByRole(ADMIN_ROLE)
                .orElseThrow(() -> new ResourceNotFoundException("Ruolo Admin non trovato"));
    }
}
