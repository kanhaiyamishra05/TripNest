package com.tours.Controller;

import com.tours.Entities.Tour;
import com.tours.Entities.Users;
import com.tours.Repo.TourRepo;
import com.tours.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Set;

@RestController
@CrossOrigin(origins = "*")
public class WishlistController {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private TourRepo tourRepo;

    private Users getLoggedInUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (userDetails == null) {
            return null;
        }
        return userRepo.getUserByEmail(userDetails.getUsername());
    }

    @PostMapping("/customer/wishlist/toggle/{tourId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> toggleWishlist(@PathVariable Long tourId) {
        Users loggedInUser = getLoggedInUser();
        if (loggedInUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not logged in.");
        }

        try {
            Tour tour = tourRepo.findById(tourId)
                    .orElseThrow(() -> new IllegalArgumentException("Tour not found"));

            Set<Tour> wishlist = loggedInUser.getWishlist();
            boolean isAdded;
            if (wishlist.contains(tour)) {
                wishlist.remove(tour);
                isAdded = false;
            } else {
                wishlist.add(tour);
                isAdded = true;
            }
            userRepo.save(loggedInUser);

            return ResponseEntity.ok(Map.of(
                    "isAdded", isAdded,
                    "message", isAdded ? "Added to wishlist" : "Removed from wishlist"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/customer/wishlist")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getWishlist() {
        Users loggedInUser = getLoggedInUser();
        if (loggedInUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not logged in.");
        }
        try {
            return ResponseEntity.ok(loggedInUser.getWishlist());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}
