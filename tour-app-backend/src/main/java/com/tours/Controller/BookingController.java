package com.tours.Controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import com.tours.Entities.Booking;
import com.tours.Entities.Tour;
import com.tours.Entities.Users;
import com.tours.Repo.TourRepo;
import com.tours.Repo.UserRepo;
import com.tours.Service.BookingService;
import com.tours.Service.TourService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
@Tag(name = "Booking Controller", description = "Manage bookings, payments, and tours for customers and admins.")
public class BookingController {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Autowired
    private TourService tourService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private TourRepo tourRepository;

    private Users getLoggedInUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (userDetails == null) {
            return null;
        }
        return userRepo.getUserByEmail(userDetails.getUsername());
    }

    @Operation(summary = "Get all available tours", description = "Fetches all tours available for booking.")
    @GetMapping("customer/tours")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getAllTours() {
        Users loggedInUser = getLoggedInUser();
        if (loggedInUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not logged in.");
        }

        List<Tour> tours = tourService.getAllToursWithDetails();
        for (Tour tour : tours) {
            tour.setBookingsThisWeek(bookingService.getBookingsCountThisWeek(tour.getId()));
        }
        return ResponseEntity.ok(Map.of(
                "message", "User: " + loggedInUser.getEmail() + " is viewing the tours.",
                "availableTours", tours
        ));
    }

    @Operation(summary = "Get tour by ID", description = "Fetches details of a specific tour by its ID.")
    @GetMapping("customer/tours/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getTourById(@PathVariable Long id) {
        Users loggedInUser = getLoggedInUser();
        if (loggedInUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User is not logged in."));
        }

        return tourService.getTourById(id)
                .map(tour -> {
                    tour.setBookingsThisWeek(bookingService.getBookingsCountThisWeek(tour.getId()));
                    return ResponseEntity.ok(Map.of(
                            "message", "User: " + loggedInUser.getEmail() + " is viewing the tour.",
                            "tourDetails", tour
                    ));
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Tour not found with ID: " + id)));
    }

    @Operation(summary = "Create payment intent", description = "Generates a payment intent for booking a tour.")
    @PostMapping("customer/create-payment-intent/{tourId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createPaymentIntent(
            @PathVariable Long tourId,
            @RequestParam int numberOfTickets,
            @RequestParam(required = false) String couponCode) {
        Users loggedInUser = getLoggedInUser();
        if (loggedInUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User is not logged in.");
        }

        try {
            // Create a preliminary booking with required tour and ticket details
            Booking preliminaryBooking = bookingService.createBooking(loggedInUser, tourId, numberOfTickets, couponCode);
            double chargeAmount = preliminaryBooking.getFinalAmount() > 0 ? preliminaryBooking.getFinalAmount() : preliminaryBooking.getTotalPrice();
            double chargeAmountInINR = chargeAmount * 83.5;

            // Check if Razorpay keys are placeholders
            if (razorpayKeyId == null || razorpayKeyId.trim().isEmpty() || razorpayKeyId.contains("your-razorpay") || razorpayKeyId.startsWith("<")) {
                String mockIntentId = "mock_intent_" + System.currentTimeMillis();
                return ResponseEntity.ok(Map.of(
                        "paymentIntentId", mockIntentId,
                        "bookingId", preliminaryBooking.getBookingId(),
                        "totalAmount", chargeAmountInINR,
                        "isMock", true,
                        "keyId", "rzp_test_mock",
                        "checkoutUrl", "http://localhost:5173/success?paymentIntentId=" + mockIntentId + "&bookingId=" + preliminaryBooking.getBookingId()
                ));
            }

            // Real Razorpay Order Creation
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            // Razorpay expects amount in paise (1 INR = 100 paise)
            orderRequest.put("amount", (int) Math.round(chargeAmountInINR * 100));
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "booking_" + preliminaryBooking.getBookingId());

            Order order = client.orders.create(orderRequest);
            String razorpayOrderId = order.get("id");

            java.util.Map<String, Object> responseMap = new java.util.HashMap<>();
            responseMap.put("paymentIntentId", razorpayOrderId);
            responseMap.put("orderId", razorpayOrderId);
            responseMap.put("keyId", razorpayKeyId);
            responseMap.put("bookingId", preliminaryBooking.getBookingId());
            responseMap.put("totalAmount", chargeAmountInINR);
            responseMap.put("amount", (int) Math.round(chargeAmountInINR * 100));
            responseMap.put("currency", "INR");
            responseMap.put("customerName", loggedInUser.getName() != null ? loggedInUser.getName() : "Customer");
            responseMap.put("customerEmail", loggedInUser.getEmail());
            responseMap.put("customerContact", loggedInUser.getContactNumber() != null ? loggedInUser.getContactNumber() : "9999999999");
            responseMap.put("isMock", false);

            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }


    @Operation(summary = "Confirm booking", description = "Confirms a booking after successful payment.")
    @PostMapping("customer/confirm-payment/{bookingId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> confirmPayment(
            @PathVariable Long bookingId,
            @RequestParam String paymentIntentId) {
        Users loggedInUser = getLoggedInUser();
        if (loggedInUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User is not logged in.");
        }

        try {
            Booking confirmedBooking = bookingService.confirmBooking(bookingId, paymentIntentId);

            return ResponseEntity.ok(Map.of(
                    "message", "Booking confirmed successfully",
                    "booking", confirmedBooking
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Get user bookings", description = "Fetches all bookings made by the currently logged-in customer.")
    @GetMapping("customer/bookings")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getCustomerBookings() {
        Users loggedInUser = getLoggedInUser();
        if (loggedInUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User is not logged in.");
        }

        try {
            List<Booking> bookings = bookingService.getCustomerBookings(loggedInUser);
            return ResponseEntity.ok(Map.of(
                    "message", "Bookings fetched successfully for customer: " + loggedInUser.getEmail(),
                    "bookings", bookings
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Cancel booking", description = "Cancels a successful booking.")
    @PostMapping("customer/bookings/{bookingId}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId) {
        Users loggedInUser = getLoggedInUser();
        if (loggedInUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User is not logged in.");
        }

        try {
            Booking booking = bookingService.cancelBooking(loggedInUser, bookingId);
            return ResponseEntity.ok(Map.of(
                    "message", "Booking cancelled successfully",
                    "booking", booking
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Filter tours", description = "Filters tours based on specified criteria.")
    @GetMapping("customer/filterTours")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> filterTours(
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String lodgingType,
            @RequestParam(required = false) String transportType,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        Users loggedInUser = getLoggedInUser();
        if (loggedInUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not logged in.");
        }




        List<Tour> filteredTours = bookingService.filterTours(country, lodgingType, transportType, minPrice, maxPrice);

        if (filteredTours.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No tours found matching the specified criteria."));
        }

        for (Tour tour : filteredTours) {
            tour.setBookingsThisWeek(bookingService.getBookingsCountThisWeek(tour.getId()));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Filtered tours fetched successfully.",
                "filteredTours", filteredTours
        ));
    }

    @Operation(summary = "Get ticket summary", description = "Fetches ticket sales summary for each tour.")
    @GetMapping("admin/tourTicketSummary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getTicketSummaryPerTour() {
        Users loggedInUser = getLoggedInUser();
        if (loggedInUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not logged in.");
        }

        try {
            List<Map<String, Object>> ticketSummary = bookingService.getTicketSummaryPerTour();
            return ResponseEntity.ok(Map.of(
                    "message", "Admin: " + loggedInUser.getEmail() + " is viewing ticket summary.",
                    "summary", ticketSummary
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Get tour details with bookings", description = "Fetches tour and associated booking details.")
    @GetMapping("admin/tourDetails/{tourId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getTourDetailsWithBookings(@PathVariable Long tourId) {
        Users loggedInUser = getLoggedInUser();
        if (loggedInUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not logged in.");
        }

        try {
            Map<String, Object> tourDetails = bookingService.getTourDetailsWithBookings(tourId);
            if (tourDetails != null) {
                return ResponseEntity.ok(Map.of(
                        "message", "Admin: " + loggedInUser.getEmail() + " is viewing tour details.",
                        "details", tourDetails
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "message", "Tour not found with ID: " + tourId
                ));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}
