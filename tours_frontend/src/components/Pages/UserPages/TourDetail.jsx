import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  CalendarDays,
  Users,
  DollarSign,
  Building2,
  Bus,
  Star,
  Utensils,
  Target,
  Heart,
  Map,
  MessageSquare,
  Flame,
  Sun,
  Coffee,
  Sunset,
  Moon as MoonIcon,
  Cloud,
  CloudRain,
  Snowflake,
} from "lucide-react";
import { UserTourDetail, toggleWishlist, fetchWishlist, addReview, fetchReviews } from "../../../Redux/API/API";
import { toast } from "sonner";
import { useCurrency } from "../../../context/AppContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getBookingsThisWeek = (tourId) => {
  const seed = typeof tourId === "number" ? tourId : parseInt(String(tourId).replace(/\D/g, "0") || "0", 10);
  return (seed % 30) + 5;
};

const getWeatherData = (locationName = "") => {
  const loc = String(locationName).toLowerCase();
  if (loc.includes("bali") || loc.includes("goa") || loc.includes("beach") || loc.includes("tropical") || loc.includes("taj") || loc.includes("india")) {
    return {
      temp: 29,
      status: "Sunny",
      humidity: "72%",
      wind: "12 km/h",
      icon: "sun",
      desc: "Perfect beach weather. Don't forget sunscreen!"
    };
  } else if (loc.includes("manali") || loc.includes("alps") || loc.includes("mountain") || loc.includes("swiss") || loc.includes("snow") || loc.includes("himachal")) {
    return {
      temp: 6,
      status: "Snowy",
      humidity: "85%",
      wind: "18 km/h",
      icon: "snow",
      desc: "Fresh snow falling. Heavy winter gear required."
    };
  } else if (loc.includes("paris") || loc.includes("london") || loc.includes("europe") || loc.includes("rain") || loc.includes("france")) {
    return {
      temp: 16,
      status: "Light Rain",
      humidity: "90%",
      wind: "15 km/h",
      icon: "rain",
      desc: "Intermittent showers. We recommend carrying an umbrella."
    };
  } else {
    return {
      temp: 22,
      status: "Partly Cloudy",
      humidity: "60%",
      wind: "9 km/h",
      icon: "cloud",
      desc: "Pleasant sightseeing conditions. Comfortable walking temperature."
    };
  }
};

const getDurationDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 3;
  const start = new Date(startDate);
  const end   = new Date(endDate);
  const days  = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  return days;
};

const DAY_ICONS = [Sun, Coffee, Target, Sunset, MoonIcon, Map, Utensils];

/** Build a day-by-day itinerary from the tour data */
const buildItinerary = (tour) => {
  const days = getDurationDays(tour.startDate, tour.endDate);
  const activities = tour.activities || [];
  const meals      = tour.meals || [];
  const itinerary  = [];

  const startDateObj = tour.startDate ? new Date(tour.startDate) : new Date();

  for (let d = 0; d < days; d++) {
    const date = new Date(startDateObj);
    date.setDate(date.getDate() + d);
    const dayLabel = date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

    const activity = activities[d % activities.length] || "Leisure & Exploration";
    const meal     = meals.length > 0 ? meals.join(", ") : "Local Cuisine";

    let specialNote = "";
    if (d === 0) specialNote = `Arrival & check-in at ${tour.lodging?.lodgingName || "accommodation"}. Meet your guide ${tour.tourGuide || ""}.`;
    if (d === days - 1) specialNote = `Check-out from ${tour.lodging?.lodgingName || "accommodation"}. Departure via ${tour.transport?.transportName || "transport"}.`;

    itinerary.push({ day: d + 1, date: dayLabel, activity, meal, specialNote });
  }
  return itinerary;
};

// ─── Rating Breakdown Bars ────────────────────────────────────────────────────
const RatingBars = ({ reviews }) => {
  if (!reviews || reviews.length === 0) return null;

  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const max = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div className="space-y-1.5 mb-4">
      {counts.map(({ star, count }) => (
        <div key={star} className="flex items-center gap-2 text-xs">
          <span className="w-4 text-right font-semibold text-yellow-500">{star}</span>
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <div
            className="flex-1 h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: "var(--border-color)" }}
          >
            <div
              className="rating-bar-fill"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span style={{ color: "var(--text-muted)", minWidth: "18px" }}>{count}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const UserTourDetails = () => {
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [tourImages, setTourImages] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "itinerary" | "reviews"

  // Wishlist and Reviews State
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const { tourId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const bookings = tour?.bookingsThisWeek !== undefined && tour?.bookingsThisWeek !== null
    ? tour.bookingsThisWeek
    : getBookingsThisWeek(tourId);

  const fetchReviewsData = async () => {
    try {
      const response = await dispatch(fetchReviews(tourId)).unwrap();
      setReviews(response.reviews || []);
      setAvgRating(response.averageRating || 0);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  useEffect(() => {
    const fetchTourData = async () => {
      try {
        const response = await dispatch(UserTourDetail(tourId));
        const tourDetails = response.payload.tourDetails;
        setTour(tourDetails);
        if (tourDetails.tourImages?.length > 0) setTourImages(tourDetails.tourImages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tour details:", error);
        setError("Failed to load tour details");
        setLoading(false);
      }
    };

    const checkWishlist = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await dispatch(fetchWishlist()).unwrap();
        const inWishlist = response.some((t) => String(t.id) === String(tourId));
        setIsInWishlist(inWishlist);
      } catch (err) {
        console.error("Error checking wishlist:", err);
      }
    };

    fetchTourData();
    fetchReviewsData();
    checkWishlist();
  }, [tourId, dispatch]);

  const handleWishlistToggle = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please Sign In first to save items to your wishlist.");
      navigate("/login");
      return;
    }
    try {
      const response = await dispatch(toggleWishlist(tourId)).unwrap();
      setIsInWishlist(response.isAdded);
      toast.success(response.message);
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      toast.error(err?.message || "Failed to update wishlist");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please Sign In first to submit a review.");
      navigate("/login");
      return;
    }
    if (!userComment.trim()) { toast.error("Please enter a comment"); return; }
    setSubmittingReview(true);
    try {
      await dispatch(addReview({ tourId, rating: userRating, comment: userComment })).unwrap();
      toast.success("Review submitted successfully");
      setUserComment("");
      setUserRating(5);
      fetchReviewsData();
    } catch (err) {
      toast.error(err?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev === tourImages.length - 1 ? 0 : prev + 1));
  const prevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? tourImages.length - 1 : prev - 1));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="w-16 h-16 border-4 border-t-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="p-8 rounded-2xl shadow-lg text-center space-y-4 max-w-md" style={{ backgroundColor: "var(--bg-card)" }}>
          <h2 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Error Loading Tour</h2>
          <p style={{ color: "var(--text-secondary)" }}>{error}</p>
          <button onClick={() => navigate(-1)} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Return to Previous Page
          </button>
        </div>
      </div>
    );
  }

  const itinerary = tour ? buildItinerary(tour) : [];

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="container mx-auto px-4 max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center transition-colors hover:text-blue-500"
          style={{ color: "var(--text-secondary)" }}
        >
          <ChevronLeft className="mr-2" /> Back to Tours
        </button>

        <div className="grid md:grid-cols-2 gap-10">
          {/* ── Image Section (sticky) ───────────────────────────────── */}
          <div className="md:sticky md:top-12 h-fit">
            {tourImages.length > 0 ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={tourImages[currentImageIndex]}
                  alt={`Tour image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {tourImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/50 rounded-full p-2 hover:bg-white/75 transition-all"
                    >
                      <ChevronLeft className="text-gray-800" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/50 rounded-full p-2 hover:bg-white/75 transition-all"
                    >
                      <ChevronRight className="text-gray-800" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {tourImages.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-2 rounded-full ${index === currentImageIndex ? "bg-blue-500" : "bg-white/50"}`}
                    />
                  ))}
                </div>

                {/* Social proof on image */}
                <div className="absolute top-4 left-4">
                  <span className="social-proof-badge animate-bounceBadge">
                    🔥 {bookings} booked this week
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full aspect-video bg-gray-200 flex items-center justify-center text-gray-500 rounded-2xl">
                No Images Available
              </div>
            )}

            {/* Quick stats below image */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl p-3 text-center shadow-sm" style={{ backgroundColor: "var(--bg-card)", border: `1px solid var(--border-color)` }}>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Duration</p>
                <p className="text-lg font-bold text-blue-500">{getDurationDays(tour.startDate, tour.endDate)}D</p>
              </div>
              <div className="rounded-xl p-3 text-center shadow-sm" style={{ backgroundColor: "var(--bg-card)", border: `1px solid var(--border-color)` }}>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Price</p>
                <p className="text-lg font-bold text-green-600">{formatPrice(tour.price)}</p>
              </div>
              <div className="rounded-xl p-3 text-center shadow-sm" style={{ backgroundColor: "var(--bg-card)", border: `1px solid var(--border-color)` }}>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Rating</p>
                <p className="text-lg font-bold text-yellow-500">
                  {avgRating > 0 ? `${avgRating.toFixed(1)}★` : "New"}
                </p>
              </div>
            </div>

            {/* Weather Widget */}
            {tour && (
              (() => {
                const weather = getWeatherData(tour.location?.toLocation || tour.tourName);
                return (
                  <div 
                    className="mt-4 rounded-xl p-4 shadow-sm border flex items-center justify-between transition-all"
                    style={{ 
                      backgroundColor: "var(--bg-card)", 
                      borderColor: "var(--border-color)",
                    }}
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 block">Destination Weather</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>{weather.temp}°C</span>
                        <span className="text-xs font-bold text-gray-500">{weather.status}</span>
                      </div>
                      <p className="text-[11px] max-w-[220px] leading-snug" style={{ color: "var(--text-secondary)" }}>
                        {weather.desc}
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 text-center">
                      <div className="p-2.5 bg-blue-50 rounded-xl text-blue-500 border border-blue-100 shadow-inner">
                        {weather.icon === "sun" && <Sun className="w-7 h-7" />}
                        {weather.icon === "snow" && <Snowflake className="w-7 h-7" />}
                        {weather.icon === "rain" && <CloudRain className="w-7 h-7 animate-bounce" />}
                        {weather.icon === "cloud" && <Cloud className="w-7 h-7" />}
                      </div>
                      <div className="text-[9px] font-medium text-gray-400">
                        💧 {weather.humidity} | 💨 {weather.wind}
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          {/* ── Details Panel ────────────────────────────────────────── */}
          <div className="md:max-h-[calc(100vh-160px)] md:overflow-y-auto pr-1 space-y-4">
            {/* Tour title + wishlist */}
            <div className="flex items-start justify-between">
              <div className="space-y-1 mr-4">
                <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{tour.tourName}</h1>
                <p style={{ color: "var(--text-secondary)" }}>{tour.tourDescription}</p>
              </div>
              <button
                onClick={handleWishlistToggle}
                className="p-2.5 rounded-full bg-white hover:bg-red-50 text-red-500 shadow-md border border-gray-100 transition-all flex-shrink-0"
                title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart className={`w-6 h-6 ${isInWishlist ? "fill-red-500" : ""}`} />
              </button>
            </div>

            {/* ── Tabs ─────────────────────────────────────────────── */}
            <div className="flex border-b" style={{ borderColor: "var(--border-color)" }}>
              {[
                { id: "overview",  label: "Overview",  Icon: Map },
                { id: "itinerary", label: "Itinerary", Icon: CalendarDays },
                { id: "reviews",   label: `Reviews (${reviews.length})`, Icon: MessageSquare },
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`tab-btn flex items-center gap-1.5 ${activeTab === id ? "active" : ""}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* ══ TAB: Overview ═════════════════════════════════════ */}
            {activeTab === "overview" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Location */}
                  <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: "var(--bg-card)", border: `1px solid var(--border-color)` }}>
                    <div className="flex items-center mb-3">
                      <MapPin className="mr-2 text-blue-500" />
                      <h3 className="text-md font-semibold" style={{ color: "var(--text-primary)" }}>Location</h3>
                    </div>
                    <div className="space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <p className="font-bold text-md" style={{ color: "var(--text-primary)" }}>{tour.location.locationDescription}</p>
                      <p>From: {tour.location.fromLocation}</p>
                      <p>To: {tour.location.toLocation}</p>
                      <p>Country: {tour.location.country}</p>
                      <p>Distance: {tour.location.distance} km</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: "var(--bg-card)", border: `1px solid var(--border-color)` }}>
                    <div className="flex items-center mb-3">
                      <CalendarDays className="mr-2 text-blue-500" />
                      <h3 className="text-md font-semibold" style={{ color: "var(--text-primary)" }}>Date</h3>
                    </div>
                    <div className="space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <p>Start: {tour.startDate}</p>
                      <p>End: {tour.endDate}</p>
                      <p className="font-semibold text-blue-500 mt-2">{getDurationDays(tour.startDate, tour.endDate)} days total</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Pricing */}
                  <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: "var(--bg-card)", border: `1px solid var(--border-color)` }}>
                    <div className="flex items-center mb-3">
                      <DollarSign className="mr-2 text-green-500" />
                      <h3 className="text-md font-semibold" style={{ color: "var(--text-primary)" }}>Pricing</h3>
                    </div>
                    <div className="space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <p className="text-xl font-bold text-blue-600">{formatPrice(tour.price)}</p>
                      <p>{tour.ticketsAvailable} tickets available</p>
                    </div>
                  </div>

                  {/* Guide */}
                  <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: "var(--bg-card)", border: `1px solid var(--border-color)` }}>
                    <div className="flex items-center mb-3">
                      <Users className="mr-2 text-purple-500" />
                      <h3 className="text-md font-semibold" style={{ color: "var(--text-primary)" }}>Guide</h3>
                    </div>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{tour.tourGuide}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Meals */}
                  <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: "var(--bg-card)", border: `1px solid var(--border-color)` }}>
                    <div className="flex items-center mb-3">
                      <Utensils className="mr-2 text-purple-500" />
                      <h3 className="text-md font-semibold" style={{ color: "var(--text-primary)" }}>Meals</h3>
                    </div>
                    <ul className="list-disc list-inside text-sm space-y-1" style={{ color: "var(--text-secondary)" }}>
                      {tour.meals.map((meal, index) => <li key={index}>{meal}</li>)}
                    </ul>
                  </div>

                  {/* Activities */}
                  <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: "var(--bg-card)", border: `1px solid var(--border-color)` }}>
                    <div className="flex items-center mb-3">
                      <Target className="mr-2 text-blue-500" />
                      <h3 className="text-md font-semibold" style={{ color: "var(--text-primary)" }}>Activities</h3>
                    </div>
                    <ul className="list-disc list-inside text-sm space-y-1" style={{ color: "var(--text-secondary)" }}>
                      {tour.activities.map((activity, index) => <li key={index}>{activity}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Lodging */}
                  <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: "var(--bg-card)", border: `1px solid var(--border-color)` }}>
                    <div className="flex items-center mb-3">
                      <Building2 className="mr-2 text-blue-500" />
                      <h3 className="text-md font-semibold" style={{ color: "var(--text-primary)" }}>Lodging</h3>
                    </div>
                    <div className="space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <p className="font-bold text-md" style={{ color: "var(--text-primary)" }}>{tour.lodging.lodgingDescription || "No description available"}</p>
                      <p>Name: {tour.lodging.lodgingName}</p>
                      <p>Type: {tour.lodging.lodgingType}</p>
                      <div className="flex items-center">
                        <MapPin className="mr-1 text-red-500" size={16} />
                        <p>{tour.lodging.address}</p>
                      </div>
                      <p className="flex items-center">
                        <Star className="mr-1 text-yellow-500" size={16} />
                        {tour.lodging.rating} / 5
                      </p>
                    </div>
                  </div>

                  {/* Transport */}
                  <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: "var(--bg-card)", border: `1px solid var(--border-color)` }}>
                    <div className="flex items-center mb-3">
                      <Bus className="mr-2 text-blue-500" />
                      <h3 className="text-md font-semibold" style={{ color: "var(--text-primary)" }}>Transport</h3>
                    </div>
                    <div className="space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <p className="font-bold text-md" style={{ color: "var(--text-primary)" }}>{tour.transport.transportDescription || "No description available"}</p>
                      <p>Name: {tour.transport.transportName}</p>
                      <p>Type: {tour.transport.transportType}</p>
                      <p>Travel Time: {tour.transport.estimatedTravelTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ TAB: Itinerary ════════════════════════════════════ */}
            {activeTab === "itinerary" && (
              <div className="animate-fadeIn space-y-4">
                <div className="rounded-xl p-5 shadow-md" style={{ backgroundColor: "var(--bg-card)", border: `1px solid var(--border-color)` }}>
                  <h3 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                    Day-by-Day Itinerary
                  </h3>
                  <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
                    {getDurationDays(tour.startDate, tour.endDate)}-day trip from {tour.location?.fromLocation} to {tour.location?.toLocation}
                  </p>

                  <div className="space-y-5">
                    {itinerary.map(({ day, date, activity, meal, specialNote }) => {
                      const DayIcon = DAY_ICONS[(day - 1) % DAY_ICONS.length];
                      return (
                        <div key={day} className="itinerary-day-card animate-slideRight" style={{ animationDelay: `${day * 60}ms` }}>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                              D{day}
                            </span>
                            <div>
                              <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Day {day}</p>
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{date}</p>
                            </div>
                          </div>

                          <div className="ml-11 space-y-1.5">
                            <div className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                              <Target className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                              <span><strong>Activity:</strong> {activity}</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                              <Utensils className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                              <span><strong>Meal:</strong> {meal}</span>
                            </div>
                            {specialNote && (
                              <div
                                className="text-xs rounded-lg px-3 py-2 mt-1"
                                style={{ backgroundColor: "var(--badge-bg)", color: "var(--text-secondary)" }}
                              >
                                ℹ️ {specialNote}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ══ TAB: Reviews ══════════════════════════════════════ */}
            {activeTab === "reviews" && (
              <div className="animate-fadeIn">
                <div className="rounded-xl p-5 shadow-md space-y-4" style={{ backgroundColor: "var(--bg-card)", border: `1px solid var(--border-color)` }}>
                  {/* Rating Summary */}
                  <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border-color)" }}>
                    <h3 className="text-md font-semibold flex items-center" style={{ color: "var(--text-primary)" }}>
                      <Star className="mr-2 text-yellow-500 fill-yellow-500" />
                      Customer Reviews ({reviews.length})
                    </h3>
                    {avgRating > 0 && (
                      <span className="text-sm font-semibold bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                        {avgRating.toFixed(1)} / 5.0
                      </span>
                    )}
                  </div>

                  {/* ★ Rating Breakdown Bars */}
                  {reviews.length > 0 && <RatingBars reviews={reviews} />}

                  {/* Review List */}
                  {reviews.length > 0 ? (
                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="p-3 rounded-lg border" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                {rev.customer?.name ? rev.customer.name.charAt(0).toUpperCase() : "U"}
                              </div>
                              <div>
                                <span className="font-semibold text-xs" style={{ color: "var(--text-primary)" }}>
                                  {rev.customer?.name || "Customer"}
                                </span>
                                <span className="text-[10px] block" style={{ color: "var(--text-muted)" }}>
                                  {new Date(rev.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center text-yellow-500">
                              {Array.from({ length: rev.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-yellow-500" />
                              ))}
                              {Array.from({ length: 5 - rev.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-gray-300" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs pl-10" style={{ color: "var(--text-secondary)" }}>{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>
                      No reviews yet. Be the first to leave a review!
                    </p>
                  )}

                  {/* Submit Review Form */}
                  <form onSubmit={handleReviewSubmit} className="border-t pt-4 space-y-3" style={{ borderColor: "var(--border-color)" }}>
                    <h4 className="font-semibold text-xs" style={{ color: "var(--text-primary)" }}>Leave a Review:</h4>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Rating:</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button type="button" key={star} onClick={() => setUserRating(star)} className="focus:outline-none">
                            <Star className={`w-5 h-5 ${star <= userRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder="Share your experience on this tour..."
                      className="w-full p-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 h-16 resize-none"
                      style={{
                        backgroundColor: "var(--bg-input)",
                        borderColor: "var(--border-color)",
                        color: "var(--text-primary)",
                      }}
                      required
                    />
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTourDetails;
