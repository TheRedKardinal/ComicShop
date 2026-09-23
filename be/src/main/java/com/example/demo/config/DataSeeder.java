package com.example.demo.config;

import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.UserRoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(1)
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private static final String ROLE_USER = "Utente";
    private static final String ROLE_ADMIN = "Admin";

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    private final String adminUsername;
    private final String adminEmail;
    private final String adminPassword;

    public DataSeeder(RoleRepository roleRepository,
                       UserRepository userRepository,
                       UserRoleRepository userRoleRepository,
                       PasswordEncoder passwordEncoder,
                       @Value("${app.admin.username}") String adminUsername,
                       @Value("${app.admin.email}") String adminEmail,
                       @Value("${app.admin.password}") String adminPassword) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminUsername = adminUsername;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Role userRole = seedRole(ROLE_USER);
        Role adminRole = seedRole(ROLE_ADMIN);
        seedAdminUser(userRole, adminRole);
    }

    private Role seedRole(String roleName) {
        return roleRepository.findByRole(roleName)
                .orElseGet(() -> {
                    Role role = roleRepository.save(new Role(roleName));
                    log.info("Ruolo '{}' creato", roleName);
                    return role;
                });
    }

    private void seedAdminUser(Role userRole, Role adminRole) {
        if (userRepository.existsByUsername(adminUsername)) {
            return;
        }

        User admin = new User(adminUsername, adminEmail, passwordEncoder.encode(adminPassword));
        userRepository.save(admin);

        userRoleRepository.save(new UserRole(admin, userRole));
        userRoleRepository.save(new UserRole(admin, adminRole));

        log.info("Utente admin '{}' creato con ruoli Utente e Admin", adminUsername);
    }
}
