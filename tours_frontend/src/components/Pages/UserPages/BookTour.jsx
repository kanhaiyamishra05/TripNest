import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { userBook, validateCoupon, confirmBooking, fetchCustomerCoupons, getUserProfile, updateUserProfile } from '../../../Redux/API/API';
import { toast } from 'sonner';
import { useCurrency } from '../../../context/AppContext';
import { Ticket, Gift, User, ShieldAlert } from 'lucide-react';

const BookTour = ({ tourId, isOpen, onClose, ticketsAvailable, price }) => {
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Profile State
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    contactNumber: "",
    passportNumber: "",
    preferredMeal: "Veg",
    address: "",
    emergencyContactName: "",
    emergencyContactNumber: ""
  });
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [validatedCoupon, setValidatedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  const dispatch = useDispatch();
  const { formatPrice } = useCurrency();

  const basePrice = (price || 0) * numberOfTickets;
  const discountPercentage = validatedCoupon ? validatedCoupon.discountPercentage : 0;
  const discountAmount = basePrice * (discountPercentage / 100);
  const grandTotal = basePrice - discountAmount;

  useEffect(() => {
    if (isOpen) {
      const getCouponsAndProfile = async () => {
        setLoadingProfile(true);
        try {
          const couponRes = await dispatch(fetchCustomerCoupons()).unwrap();
          setAvailableCoupons(couponRes || []);

          const profileRes = await dispatch(getUserProfile()).unwrap();
          if (profileRes) {
            setProfile({
              name: profileRes.name || "",
              email: profileRes.email || "",
              contactNumber: profileRes.contactNumber || "",
              passportNumber: profileRes.passportNumber || "",
              preferredMeal: profileRes.preferredMeal || "Veg",
              address: profileRes.address || "",
              emergencyContactName: profileRes.emergencyContactName || "",
              emergencyContactNumber: profileRes.emergencyContactNumber || ""
            });
          }
        } catch (err) {
          console.error("Error loading booking details context:", err);
        } finally {
          setLoadingProfile(false);
        }
      };
      getCouponsAndProfile();
    }
  }, [isOpen, dispatch]);

  const handleSelectCoupon = async (code) => {
    setCouponCode(code);
    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const response = await dispatch(validateCoupon(code)).unwrap();
      setValidatedCoupon(response);
      toast.success(`Coupon applied! ${response.discountPercentage}% discount`);
    } catch (err) {
      setCouponError(err?.message || "Invalid or inactive coupon code");
      setValidatedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const response = await dispatch(validateCoupon(couponCode)).unwrap();
      setValidatedCoupon(response);
      toast.success(`Coupon applied! ${response.discountPercentage}% discount`);
    } catch (err) {
      setCouponError(err?.message || "Invalid or inactive coupon code");
      setValidatedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setValidatedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation checks
    if (numberOfTickets <= 0) {
      setError('Please select at least 1 ticket');
      return;
    }

    if (numberOfTickets > ticketsAvailable) {
      setError(`Only ${ticketsAvailable} tickets are available`);
      return;
    }

    // Traveler Profile validations
    if (!profile.address.trim()) {
      setError("Traveler Address is required to book a ticket.");
      return;
    }
    if (!profile.passportNumber.trim()) {
      setError("Passport Number is required to book a ticket.");
      return;
    }
    if (!profile.emergencyContactName.trim()) {
      setError("Emergency Contact Name is required to book a ticket.");
      return;
    }
    if (!/^[0-9]{10}$/.test(profile.emergencyContactNumber)) {
      setError("Please enter a valid 10-digit emergency contact phone number.");
      return;
    }

    setIsLoading(true);
    setError(null);
  
    try {
      // 1. Update user profile first inline
      await dispatch(updateUserProfile(profile)).unwrap();

      // 2. Perform booking
      const response = await dispatch(
        userBook({ 
          tourId, 
          numberOfTickets, 
          couponCode: validatedCoupon ? validatedCoupon.code : null 
        })
      ).unwrap();

      if (response) {
        if (response.isMock) {
          window.location.href = response.checkoutUrl;
        } else {
          // Dynamically load Razorpay SDK script
          const loadRazorpayScript = () => {
            return new Promise((resolve) => {
              const script = document.createElement("script");
              script.src = "https://checkout.razorpay.com/v1/checkout.js";
              script.onload = () => resolve(true);
              script.onerror = () => resolve(false);
              document.body.appendChild(script);
            });
          };

          const isLoaded = await loadRazorpayScript();
          if (!isLoaded) {
            toast.error("Failed to load Razorpay payment gateway. Please check your internet connection.");
            setIsLoading(false);
            return;
          }

          const options = {
            key: response.keyId,
            amount: response.amount,
            currency: response.currency,
            name: "TripNest",
            description: "Tour Package Booking Confirmation",
            order_id: response.orderId,
            handler: async function (paymentRes) {
              try {
                setIsLoading(true);
                await dispatch(
                  confirmBooking({
                    bookingId: response.bookingId,
                    paymentIntentId: paymentRes.razorpay_payment_id,
                  })
                ).unwrap();
                
                toast.success("Payment Successful!");
                window.location.href = `/success?paymentIntentId=${paymentRes.razorpay_payment_id}&bookingId=${response.bookingId}`;
              } catch (confirmErr) {
                console.error("Confirmation error:", confirmErr);
                toast.error("Payment was successful but booking confirmation failed. Please contact customer support.");
              } finally {
                setIsLoading(false);
              }
            },
            prefill: {
              name: response.customerName || "",
              email: response.customerEmail || "",
              contact: response.customerContact || "",
            },
            theme: {
              color: "#3B82F6",
            },
          };

          console.log("Razorpay Checkout Options:", {
            amount: options.amount,
            currency: options.currency,
            order_id: options.order_id
          });

          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      }
    } catch (err) {
      setError(err?.message || 'Booking failed. Please try again.');
      console.error("Booking error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-950 border border-gray-150 dark:border-slate-800 shadow-2xl rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-y-auto transform transition-all duration-300 p-6 md:p-8">
        
        {/* Modal Header */}
        <div className="relative -mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-6 px-6 md:px-8 py-5 bg-gradient-to-r from-blue-600 to-violet-600 rounded-t-3xl text-white flex justify-between items-center shadow-md">
          <div className="relative">
            <h2 className="text-xl font-black tracking-tight">Book Tour Package</h2>
            <p className="text-[11px] text-blue-100 mt-0.5 font-semibold">Complete traveler profile and select tickets</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-white/80 hover:text-white transition-colors text-lg p-1.5 hover:bg-white/10 rounded-xl backdrop-blur-sm border border-white/10"
          >
            ✕
          </button>
        </div>

        {loadingProfile ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Fetching traveler profile context...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Ticket Selection & Pricing */}
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 mb-3 flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-blue-600" /> 1. Ticket Selection
                  </h3>
                  
                  <div className="bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-850/80 rounded-2xl p-4">
                    <label 
                      htmlFor="ticketCount" 
                      className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400"
                    >
                      Number of Tickets
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        id="ticketCount"
                        value={numberOfTickets}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setNumberOfTickets(value);
                          setError(null);
                        }}
                        min="1"
                        max={ticketsAvailable}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Available tickets: <span className="text-blue-600 dark:text-blue-400 font-bold">{ticketsAvailable}</span>
                    </p>
                  </div>
                </div>

                {/* Coupon Section */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 mb-3 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-blue-600" /> 2. Apply Offers
                  </h3>
                  
                  <div className="bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-850/80 rounded-2xl p-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">
                      Promo Coupon Code
                    </label>
                    {validatedCoupon ? (
                      <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 px-3.5 py-2.5 rounded-xl text-xs">
                        <div>
                          <span className="font-extrabold uppercase tracking-wide">{validatedCoupon.code}</span>
                          <span className="text-[10px] ml-1.5 opacity-80 font-bold">({validatedCoupon.discountPercentage}% Off Applied)</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-xs text-red-500 hover:text-red-750 dark:hover:text-red-400 font-bold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. TRIP20"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value);
                              setCouponError(null);
                            }}
                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={validatingCoupon}
                            className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-all disabled:bg-gray-400"
                          >
                            {validatingCoupon ? "..." : "Apply"}
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-xs text-red-655 font-bold">{couponError}</p>
                        )}

                        {/* Available Coupons list */}
                        {availableCoupons.length > 0 && (
                          <div className="pt-2 border-t border-gray-200 dark:border-slate-800">
                            <span className="block text-[10px] font-bold text-gray-450 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                              Available Offers
                            </span>
                            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                              {availableCoupons.map((coupon) => (
                                <button
                                  key={coupon.id}
                                  type="button"
                                  onClick={() => handleSelectCoupon(coupon.code)}
                                  className="px-2 py-1 text-[10px] font-bold border border-dashed border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/10 transition-all flex items-center gap-1"
                                >
                                  <span className="font-mono uppercase">{coupon.code}</span>
                                  <span className="opacity-75">({coupon.discountPercentage}%)</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-850/80 rounded-2xl p-4 space-y-2.5 text-xs text-gray-650 dark:text-gray-300">
                  <span className="block text-[10px] font-bold text-gray-450 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Payment Breakdown
                  </span>
                  <div className="flex justify-between">
                    <span>Per Ticket Price:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{formatPrice(price || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Fare ({numberOfTickets} Tickets):</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{formatPrice(basePrice)}</span>
                  </div>
                  {discountPercentage > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400 font-bold">
                      <span>Discount Coupon ({discountPercentage}%):</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-gray-200 dark:border-slate-800 font-black text-sm text-gray-900 dark:text-white">
                    <span>Total Amount</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 font-black text-base">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Traveler Details Form */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 mb-3 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-600" /> 3. Traveler Information
                  </h3>
                  
                  <div className="bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-850/80 rounded-2xl p-4 space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
                        Passport Number
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="A1234567"
                        value={profile.passportNumber}
                        onChange={(e) => setProfile(prev => ({ ...prev, passportNumber: e.target.value }))}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
                        Preferred Meal Option
                      </label>
                      <select
                        value={profile.preferredMeal}
                        onChange={(e) => setProfile(prev => ({ ...prev, preferredMeal: e.target.value }))}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                      >
                        <option value="Veg">Vegetarian (Veg)</option>
                        <option value="Non-Veg">Non-Vegetarian (Non-Veg)</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Gluten-Free">Gluten-Free</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
                        Traveler Billing Address
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="123 Street, City, Country"
                        value={profile.address}
                        onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div className="pt-2 border-t border-gray-205 dark:border-slate-800 mt-2">
                      <span className="block text-[10px] font-bold text-gray-450 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Emergency Contact Details
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
                            Contact Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Contact Person Name"
                            value={profile.emergencyContactName}
                            onChange={(e) => setProfile(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="10-digit number"
                            pattern="[0-9]{10}"
                            value={profile.emergencyContactNumber}
                            onChange={(e) => setProfile(prev => ({ ...prev, emergencyContactNumber: e.target.value.replace(/\D/g, "") }))}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 text-xs text-red-750 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-950/40 rounded-xl font-bold">
                ⚠️ {error}
              </div>
            )}

            {/* Form Action Controls */}
            <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-slate-800 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-750 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-850 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-violet-650 hover:from-blue-700 hover:to-violet-755 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:bg-gray-400"
              >
                {isLoading ? "Updating Profile & Booking..." : "Proceed to Payment"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookTour;