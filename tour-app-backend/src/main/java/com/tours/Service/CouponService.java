package com.tours.Service;

import com.tours.Entities.Coupon;
import com.tours.Repo.CouponRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CouponService {

    @Autowired
    private CouponRepo couponRepo;

    public Coupon createCoupon(String code, double discountPercentage) {
        if (discountPercentage <= 0 || discountPercentage > 100) {
            throw new IllegalArgumentException("Discount percentage must be between 0 and 100");
        }
        Coupon coupon = Coupon.builder()
            .code(code.toUpperCase().trim())
            .discountPercentage(discountPercentage)
            .isActive(true)
            .build();
        return couponRepo.save(coupon);
    }

    public List<Coupon> getAllCoupons() {
        return couponRepo.findAll();
    }

    public void deleteCoupon(Long id) {
        couponRepo.deleteById(id);
    }

    public Coupon validateCoupon(String code) {
        return couponRepo.findByCodeIgnoreCase(code.trim())
            .filter(Coupon::isActive)
            .orElseThrow(() -> new IllegalArgumentException("Invalid or inactive coupon code"));
    }
}
