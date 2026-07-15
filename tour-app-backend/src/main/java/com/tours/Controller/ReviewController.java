package com.tours.Controller;

import com.tours.Entities.Review;
import com.tours.Entities.Users;
import com.tours.Repo.UserRepo;
import com.tours.Service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserRepo userRepo;

    private Users getLoggedInUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (userDetails == null) {
            return null;
        }
        return userRepo.getUserByEmail(userDetails.getUsername());
    }

    @PostMapping("/customer/reviews/{tourId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> addReview(
            @PathVariable Long tourId,
            @RequestBody Map<String, Object> payload) {
        Users loggedInUser = getLoggedInUser();
        if (loggedInUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not logged in.");
        }

        try {
            int rating = Integer.parseInt(payload.get("rating").toString());
            String comment = payload.get("comment").toString();
            Review review = reviewService.addReview(loggedInUser, tourId, rating, comment);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/public/reviews/tour/{tourId}")
    public ResponseEntity<?> getReviewsByTour(@PathVariable Long tourId) {
        try {
            List<Review> reviews = reviewService.getReviewsByTour(tourId);
            double avgRating = reviewService.getAverageRatingForTour(tourId);
            return ResponseEntity.ok(Map.of("reviews", reviews, "averageRating", avgRating));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}
