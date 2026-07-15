package com.tours.Controller;

import com.tours.Entities.Booking;
import com.tours.Entities.Tour;
import com.tours.Entities.Users;
import com.tours.Repo.BookingRepo;
import com.tours.Repo.TourRepo;
import com.tours.Repo.UserRepo;
import com.tours.Repo.CouponRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private BookingRepo bookingRepository;

    @Autowired
    private TourRepo tourRepository;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private CouponRepo couponRepo;

    private Users getLoggedInUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (userDetails == null) {
            return null;
        }
        return userRepo.getUserByEmail(userDetails.getUsername());
    }

    @GetMapping("/admin/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAnalytics() {
        Users loggedInUser = getLoggedInUser();
        if (loggedInUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not logged in.");
        }

        try {
            List<Booking> bookings = bookingRepository.findAll();
            List<Tour> tours = tourRepository.findAll();
            List<Users> users = userRepo.findAll();

            // Filter successful bookings
            List<Booking> successfulBookings = bookings.stream()
                    .filter(b -> b.getPaymentStatus() == Booking.PaymentStatus.SUCCESS)
                    .collect(Collectors.toList());

            // 1. Basic Stats
            double totalRevenue = successfulBookings.stream()
                    .mapToDouble(b -> b.getFinalAmount() != null && b.getFinalAmount() > 0 ? b.getFinalAmount() : b.getTotalPrice())
                    .sum();

            long totalBookings = successfulBookings.size();
            long totalTours = tours.size();
            long totalCustomers = users.stream()
                    .filter(u -> "ROLE_CUSTOMER".equalsIgnoreCase(u.getRole()))
                    .count();

            // Compute total tickets sold
            long totalTicketsSold = successfulBookings.stream()
                    .mapToLong(Booking::getNumberOfTickets)
                    .sum();

            // Compute total coupons
            long totalCoupons = couponRepo.count();

            // 2. Monthly Revenue (Group by Month - output as Map for frontend Object.entries)
            SimpleDateFormat df = new SimpleDateFormat("MMM yyyy");
            Map<String, Double> monthlyRevenueMap = new LinkedHashMap<>();
            
            // Initialize last 6 months with 0.0
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.MONTH, -5);
            for (int i = 0; i < 6; i++) {
                monthlyRevenueMap.put(df.format(cal.getTime()), 0.0);
                cal.add(Calendar.MONTH, 1);
            }

            for (Booking b : successfulBookings) {
                if (b.getBookingDate() != null) {
                    String monthKey = df.format(b.getBookingDate());
                    if (monthlyRevenueMap.containsKey(monthKey)) {
                        double amt = b.getFinalAmount() != null && b.getFinalAmount() > 0 ? b.getFinalAmount() : b.getTotalPrice();
                        monthlyRevenueMap.put(monthKey, monthlyRevenueMap.get(monthKey) + amt);
                    }
                }
            }

            // 3. Tour Popularity (Group by Tour, calculating ticketsSold and revenue)
            Map<Tour, Long> ticketsSoldMap = successfulBookings.stream()
                    .filter(b -> b.getTour() != null)
                    .collect(Collectors.groupingBy(Booking::getTour, Collectors.summingLong(Booking::getNumberOfTickets)));

            Map<Tour, Double> revenueMap = successfulBookings.stream()
                    .filter(b -> b.getTour() != null)
                    .collect(Collectors.groupingBy(Booking::getTour, Collectors.summingDouble(b -> 
                        b.getFinalAmount() != null && b.getFinalAmount() > 0 ? b.getFinalAmount() : b.getTotalPrice()
                    )));

            List<Map<String, Object>> popularToursList = ticketsSoldMap.entrySet().stream()
                    .map(entry -> {
                        Tour tour = entry.getKey();
                        Map<String, Object> m = new HashMap<>();
                        m.put("tourName", tour.getTourName());
                        m.put("ticketsSold", entry.getValue());
                        m.put("revenue", revenueMap.getOrDefault(tour, 0.0));
                        return m;
                    })
                    .sorted((m1, m2) -> Long.compare((Long) m2.get("ticketsSold"), (Long) m1.get("ticketsSold")))
                    .limit(5)
                    .collect(Collectors.toList());

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalRevenue", totalRevenue);
            stats.put("totalBookings", totalBookings);
            stats.put("totalTours", totalTours);
            stats.put("totalCustomers", totalCustomers);
            stats.put("totalTicketsSold", totalTicketsSold);
            stats.put("totalCoupons", totalCoupons);
            stats.put("monthlyRevenue", monthlyRevenueMap);
            stats.put("popularTours", popularToursList);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
