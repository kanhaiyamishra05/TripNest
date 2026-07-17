package com.tours.Config;

import com.tours.Entities.Users;
import com.tours.Repo.UserRepo;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Value("${app.admin.name}")
    private String adminName;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.contact}")
    private String adminContact;

    public AdminInitializer(UserRepo userRepo, PasswordEncoder passwordEncoder, JdbcTemplate jdbcTemplate) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void createDefaultAdmin() {
        // Drop outdated check constraint for PaymentStatus enum to allow CANCELLED status
        try {
            jdbcTemplate.execute("ALTER TABLE booking DROP CONSTRAINT IF EXISTS booking_payment_status_check");
        } catch (Exception e) {
            // Ignore if constraint or table is missing
        }

        if (userRepo.existsByEmail(adminEmail)) {
            return;
        }

        Users admin = new Users();
        admin.setName(adminName);
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setContactNumber(adminContact);
        admin.setRole("ROLE_ADMIN");
        admin.setEnabled(true);
        admin.setPasswordSet(true);

        userRepo.save(admin);
    }
}