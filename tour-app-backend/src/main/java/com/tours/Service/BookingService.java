package com.tours.Service;

import com.tours.Entities.Booking;
import com.tours.Entities.Tour;
import com.tours.Entities.Users;
import com.tours.Entities.Coupon;
import com.tours.Repo.BookingRepo;
import com.tours.Repo.TourRepo;
import com.tours.Repo.CouponRepo;
import com.tours.Exception.InsufficientTicketsException;
import com.tours.Exception.BookingNotFoundException;
import com.tours.Exception.PaymentFailedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);

    @Autowired
    private BookingRepo bookingRepository;

    @Autowired
    private TourRepo tourRepository;

    @Autowired
    private CouponRepo couponRepository;

    // Method to create a booking
    public Booking createBooking(Users customer, Long tourId, int numberOfTickets) {
        return createBooking(customer, tourId, numberOfTickets, null);
    }

    public Booking createBooking(Users customer, Long tourId, int numberOfTickets, String couponCode) {
        logger.info("Creating booking for customer: {}, Tour ID: {}, Tickets: {}, Coupon: {}", 
                customer.getName(), tourId, numberOfTickets, couponCode);

        if (bookingRepository.existsByCustomerAndTourIdAndPaymentStatus(customer, tourId, Booking.PaymentStatus.SUCCESS)) {
            logger.error("Customer {} has already booked Tour ID {}", customer.getEmail(), tourId);
            throw new IllegalArgumentException("You have already booked this tour successfully.");
        }

        Optional<Tour> optionalTour = tourRepository.findById(tourId);
        if (optionalTour.isPresent()) {
            Tour tour = optionalTour.get();

            if (tour.getTicketsAvailable() >= numberOfTickets) {
                double totalPrice = tour.getPrice() * numberOfTickets;
                double discountApplied = 0.0;
                double finalAmount = totalPrice;

                if (couponCode != null && !couponCode.trim().isEmpty()) {
                    Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCase(couponCode.trim());
                    if (couponOpt.isPresent() && couponOpt.get().isActive()) {
                        double pct = couponOpt.get().getDiscountPercentage();
                        discountApplied = totalPrice * (pct / 100.0);
                        finalAmount = totalPrice - discountApplied;
                        logger.info("Applied coupon {} with discount %: {}", couponCode, pct);
                    } else {
                        throw new IllegalArgumentException("Invalid or inactive coupon code");
                    }
                }

                Booking booking = Booking.builder()
                        .customer(customer)
                        .tour(tour)
                        .numberOfTickets(numberOfTickets)
                        .totalPrice(totalPrice)
                        .discountApplied(discountApplied)
                        .finalAmount(finalAmount)
                        .paymentStatus(Booking.PaymentStatus.PENDING)
                        .bookingDate(new Date())
                        .isBookingConfirmed(false)
                        .build();

                logger.debug("Booking created with details: {}", booking);
                return bookingRepository.save(booking);
            } else {
                logger.error("Insufficient tickets available for Tour ID: {}", tourId);
                throw new InsufficientTicketsException("Not enough tickets available.");
            }
        } else {
            logger.error("Tour not found for ID: {}", tourId);
            throw new BookingNotFoundException("Tour not found.");
        }
    }

    // Confirm booking after payment
    public Booking confirmBooking(Long bookingId, String paymentIntent) {
        logger.info("Confirming booking ID: {}, Payment Intent: {}", bookingId, paymentIntent);

        Optional<Booking> optionalBooking = bookingRepository.findById(bookingId);
        if (optionalBooking.isPresent()) {
            Booking booking = optionalBooking.get();
            Tour tour = booking.getTour();

            if (booking.getPaymentStatus() == Booking.PaymentStatus.PENDING) {
                booking.setPaymentStatus(Booking.PaymentStatus.SUCCESS);
                booking.confirmBooking();
                booking.setPaymentTransactionId(paymentIntent);

                logger.debug("Booking confirmed for Booking ID: {}", bookingId);

                int ticketsAvailable = tour.getTicketsAvailable();
                if (ticketsAvailable >= booking.getNumberOfTickets()) {
                    tourRepository.save(tour);
                } else {
                    logger.error("Not enough tickets available for Booking ID: {}", bookingId);
                    throw new InsufficientTicketsException("Not enough tickets available.");
                }
                return bookingRepository.save(booking);
            } else {
                logger.error("Payment not successful or already processed for Booking ID: {}", bookingId);
                throw new PaymentFailedException("Payment not successful or already processed.");
            }
        } else {
            logger.error("Booking not found for ID: {}", bookingId);
            throw new BookingNotFoundException("Booking not found.");
        }
    }

    // Get ticket summary per tour
    public List<Map<String, Object>> getTicketSummaryPerTour() {
        logger.info("Generating ticket summary per tour");
        List<Tour> tours = tourRepository.findAll();
        List<Map<String, Object>> summary = tours.stream().map(tour -> {
            int ticketsSold = Optional.ofNullable(
                    bookingRepository.countTicketsSoldForTourWithSuccessfulPayment(tour.getId(),
                            Booking.PaymentStatus.SUCCESS)
            ).orElse(0);

            int ticketsCancelled = Optional.ofNullable(
                    bookingRepository.countTicketsSoldForTourWithSuccessfulPayment(tour.getId(),
                            Booking.PaymentStatus.CANCELLED)
            ).orElse(0);

            Map<String, Object> tourSummary = new HashMap<>();
            tourSummary.put("tourId", tour.getId());
            tourSummary.put("tourName", tour.getTourName());
            tourSummary.put("ticketsSold", ticketsSold);
            tourSummary.put("ticketsCancelled", ticketsCancelled);
            tourSummary.put("ticketsAvailable", tour.getTicketsAvailable());
            tourSummary.put("totalRevenue", ticketsSold * tour.getPrice());

            logger.debug("Summary for Tour ID {}: {}", tour.getId(), tourSummary);
            return tourSummary;
        }).toList();

        logger.info("Ticket summary generation completed");
        return summary;
    }

    // Get bookings count this week (stable seed + actual confirmed bookings)
    public int getBookingsCountThisWeek(Long tourId) {
        List<Booking> bookings = bookingRepository.findByTourIdAndPaymentStatus(tourId, Booking.PaymentStatus.SUCCESS);
        int actualCount = (bookings != null) ? bookings.size() : 0;
        int seed = (int) (tourId % 15) + 3;
        return seed + actualCount;
    }

    // Get detailed booking and customer data for a specific tour
    public Map<String, Object> getTourDetailsWithBookings(Long tourId) {
        logger.info("Fetching tour details with bookings for Tour ID: {}", tourId);

        Optional<Tour> optionalTour = tourRepository.findById(tourId);
        if (optionalTour.isPresent()) {
            Tour tour = optionalTour.get();

            List<Booking> bookings = bookingRepository.findByTourIdAndPaymentStatus(
                    tourId, Booking.PaymentStatus.SUCCESS);

            int ticketsSold = Optional.ofNullable(
                    bookingRepository.countTicketsSoldForTourWithSuccessfulPayment(tour.getId(),
                            Booking.PaymentStatus.SUCCESS)
            ).orElse(0);

            List<Map<String, Object>> bookingDetails = bookings.stream().map(booking -> {
                Map<String, Object> bookingInfo = new HashMap<>();
                bookingInfo.put("bookingId", booking.getBookingId());
                bookingInfo.put("customerName", booking.getCustomer().getName());
                bookingInfo.put("customerEmail", booking.getCustomer().getEmail());
                bookingInfo.put("numberOfTickets", booking.getNumberOfTickets());
                bookingInfo.put("totalPrice", booking.getTotalPrice());
                bookingInfo.put("bookingDate", booking.getBookingDate());
                bookingInfo.put("paymentStatus", booking.getPaymentStatus());
                return bookingInfo;
            }).toList();

            Map<String, Object> tourDetails = new HashMap<>();
            tourDetails.put("tourId", tour.getId());
            tourDetails.put("tourName", tour.getTourName());
            tourDetails.put("tourDescription", tour.getTourDescription());
            tourDetails.put("ticketsSold", ticketsSold);
            tourDetails.put("bookings", bookingDetails);

            logger.debug("Tour details with bookings for Tour ID {}: {}", tourId, tourDetails);
            return tourDetails;
        } else {
            logger.error("Tour not found for ID: {}", tourId);
            return null;
        }
    }

    // Filter tours based on criteria
    public List<Tour> filterTours(String country, String lodgingType, String transportType, Double minPrice, Double maxPrice) {
        logger.info("Filtering tours with criteria - Country: {}, Lodging: {}, Transport: {}, Min Price: {}, Max Price: {}",
                country, lodgingType, transportType, minPrice, maxPrice);

        return bookingRepository.filterTours(country, lodgingType, transportType, minPrice, maxPrice);
    }

    // Fetch all bookings for a specific customer
    public List<Booking> getCustomerBookings(Users customer) {
        logger.info("Fetching bookings for customer: {}", customer.getEmail());
        return bookingRepository.findByCustomer(customer).stream()
                .filter(b -> b.getPaymentStatus() == Booking.PaymentStatus.SUCCESS || b.getPaymentStatus() == Booking.PaymentStatus.CANCELLED)
                .toList();
    }

    @org.springframework.transaction.annotation.Transactional
    public Booking cancelBooking(Users customer, Long bookingId) {
        logger.info("Cancelling booking ID: {} for customer: {}", bookingId, customer.getEmail());
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found"));

        if (booking.getCustomer().getId() != customer.getId()) {
            throw new IllegalStateException("You are not authorized to cancel this booking");
        }

        if (booking.getPaymentStatus() != Booking.PaymentStatus.SUCCESS) {
            throw new IllegalStateException("Only successful bookings can be cancelled");
        }

        booking.setPaymentStatus(Booking.PaymentStatus.CANCELLED);
        booking.setBookingConfirmed(false);

        Tour tour = booking.getTour();
        tour.setTicketsAvailable(tour.getTicketsAvailable() + booking.getNumberOfTickets());
        tourRepository.save(tour);

        return bookingRepository.save(booking);
    }

    //To delete associated bookings, if any tour gets delete
    public void deleteBookingsByTourId(Long tourId) {
        logger.info("Deleting all bookings for Tour ID: {}", tourId);
        List<Booking> bookings = bookingRepository.findByTourId(tourId);
        bookingRepository.deleteAll(bookings);
        logger.info("Successfully deleted {} bookings for Tour ID: {}", bookings.size(), tourId);
    }
}
