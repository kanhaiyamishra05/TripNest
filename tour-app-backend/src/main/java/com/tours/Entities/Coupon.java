package com.tours.Entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coupon")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // Promo coupon code (e.g. WELCOME10)

    @Column(nullable = false)
    private double discountPercentage; // Discount percentage (e.g. 15.0 for 15%)

    @Column(nullable = false)
    private boolean isActive; // Coupon active status
}
