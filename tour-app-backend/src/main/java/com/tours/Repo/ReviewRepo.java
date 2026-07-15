package com.tours.Repo;

import com.tours.Entities.Review;
import com.tours.Entities.Tour;
import com.tours.Entities.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepo extends JpaRepository<Review, Long> {
    List<Review> findByTourId(Long tourId);
    boolean existsByCustomerAndTour(Users customer, Tour tour);
}
