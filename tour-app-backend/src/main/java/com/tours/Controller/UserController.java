package com.tours.Controller;

import com.tours.Entities.Users;
import com.tours.Service.JwtService;
import com.tours.Service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
@Tag(name = "User Authentication", description = "APIs for User Signup, Login, and Role-Based Dashboards")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Operation(summary = "Register a new user", description = "Allows users to sign up with their details")
    @PostMapping("/signup")
    public ResponseEntity<String> registerUser(@Valid @RequestBody Users user) {
        try {
            if (!user.isEnabled()) { // Assuming `enabled` is a boolean field in the Users class
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Please agree to the terms and conditions");
            }
            userService.register(user);
            return ResponseEntity.ok("User registered successfully!");
        } catch (Exception e) {
            String message = e.getMessage();
            if (e.getCause() != null) {
                message = e.getCause().getMessage();
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
        }
    }

    @Operation(summary = "Login user", description = "Authenticate user and return a JWT token")
    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@RequestBody Users loginUser) {
        try {
            Authentication authentication = authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(loginUser.getEmail(), loginUser.getPassword()));

            if (authentication.isAuthenticated()) {
                String token = jwtService.generateToken(loginUser.getEmail());
                return ResponseEntity.ok(token); // Return the token to the client
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login Failed");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Email or Password");
        }
    }

    @Operation(summary = "Admin Dashboard", description = "Accessible only to users with the ADMIN role")
    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> adminDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = getUsername(authentication);
        return ResponseEntity.ok("Welcome to the Admin Dashboard, " + username);
    }

    @Operation(summary = "Customer Dashboard", description = "Accessible only to users with the CUSTOMER role")
    @GetMapping("/customer/dashboard")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<String> customerDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = getUsername(authentication);
        return ResponseEntity.ok("Welcome to the Customer Dashboard, " + username);
    }

    private static final java.util.Map<String, String> otpMap = new java.util.concurrent.ConcurrentHashMap<>();

    @Operation(summary = "Send OTP", description = "Generates and returns a 6-digit OTP for signup verification")
    @PostMapping("/send-otp")
    public ResponseEntity<java.util.Map<String, String>> sendOtp(@RequestParam String phone) {
        String otp = String.format("%06d", new java.util.Random().nextInt(900000) + 100000);
        otpMap.put(phone, otp);
        
        System.out.println("----------------------------------------");
        System.out.println("SIGNUP OTP FOR PHONE " + phone + " IS: " + otp);
        System.out.println("----------------------------------------");
        
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "OTP sent successfully to " + phone);
        response.put("otp", otp);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Verify OTP", description = "Verifies the 6-digit OTP entered by the user")
    @PostMapping("/verify-otp")
    public ResponseEntity<java.util.Map<String, String>> verifyOtp(@RequestParam String phone, @RequestParam String otp) {
        java.util.Map<String, String> response = new java.util.HashMap<>();
        String storedOtp = otpMap.get(phone);
        
        if (storedOtp != null && storedOtp.equals(otp)) {
            otpMap.remove(phone);
            response.put("status", "SUCCESS");
            response.put("message", "OTP verified successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "FAILURE");
            response.put("message", "Invalid OTP. Please try again.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @Operation(summary = "Get user profile", description = "Fetch details of the currently authenticated user")
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = getUsername(authentication);
            if (email == null || email.equals("Unknown User")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
            }
            Users user = userService.getProfile(email);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @Operation(summary = "Update user profile", description = "Update details of the currently authenticated user")
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Users profileDetails) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = getUsername(authentication);
            if (email == null || email.equals("Unknown User")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
            }
            Users updatedUser = userService.updateProfile(email, profileDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
     }

    @Operation(summary = "Change user password", description = "Allows authenticated users to change or set a password")
    @PutMapping("/profile/password")
    public ResponseEntity<?> changePassword(@RequestBody java.util.Map<String, String> request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = getUsername(authentication);
            if (email == null || email.equals("Unknown User")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
            }
            
            String newPassword = request.get("newPassword");
            if (newPassword == null || newPassword.length() < 5) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Password must be at least 5 characters long!");
            }
            
            userService.changePassword(email, newPassword);
            return ResponseEntity.ok(java.util.Map.of("message", "Password updated successfully!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    private String getUsername(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return "Unknown User";
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        return principal.toString();
    }
}
