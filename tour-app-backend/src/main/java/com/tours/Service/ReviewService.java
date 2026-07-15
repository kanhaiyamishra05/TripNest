package com.tours.Service;

import com.tours.Entities.Review;
import com.tours.Entities.Tour;
import com.tours.Entities.Users;
import com.tours.Repo.ReviewRepo;
import com.tours.Repo.TourRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepo reviewRepo;

    @Autowired
    private TourRepo tourRepo;

    public Review addReview(Users customer, Long tourId, int rating, String comment) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5 stars");
        }
        Tour tour = tourRepo.findById(tourId)
            .orElseThrow(() -> new IllegalArgumentException("Tour not found"));

        Review review = Review.builder()
            .customer(customer)
            .tour(tour)
            .rating(rating)
            .comment(comment)
            .createdAt(new Date())
            .build();

        return reviewRepo.save(review);
    }

    public List<Review> getReviewsByTour(Long tourId) {
        return reviewRepo.findByTourId(tourId);
    }

    public double getAverageRatingForTour(Long tourId) {
        List<Review> reviews = reviewRepo.findByTourId(tourId);
        if (reviews.isEmpty()) {
            return 0.0;
        }
        double sum = 0;
        for (Review r : reviews) {
            sum += r.getRating();
        }
        return sum / reviews.size();
    }
}
