import React, { useState, useEffect, useMemo } from "react";
import { Eye, MapPin, Building, Train, DollarSign, Search, X, Flame, Compass, Map, Sparkles, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header, Footer, Banner } from "../../Reusable/Banner";
import Chatbot from "../../Reusable/Chatbot";
import CurrencyConverter from "../../Reusable/CurrencyConverter";
import { useDispatch } from "react-redux";
import { userTours } from "../../../Redux/API/API";
import whatsapp from "../../../assets/Images/whatsapp.png";
import BookTour from "./BookTour";
import { useTheme, useCurrency } from "../../../context/AppContext";
import { toast } from "sonner";

// ─── Social Proof Helper ──────────────────────────────────────────────────────
// Deterministic "bookings this week" seeded from tourId so it's consistent
const getBookingsThisWeek = (tourId) => {
  const seed = typeof tourId === "number" ? tourId : parseInt(String(tourId).replace(/\D/g, "0") || "0", 10);
  return (seed % 30) + 5; // 5 – 34
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const FilterInput = ({ icon: Icon, label, ...props }) => (
  <div className="relative">
    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
      </div>
      <input
        {...props}
        className="pl-10 w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out shadow-sm"
        style={{
          backgroundColor: "var(--bg-input)",
          borderColor: "var(--border-color)",
          color: "var(--text-primary)",
        }}
      />
    </div>
  </div>
);

const FilterSelect = ({ icon: Icon, label, children, ...props }) => (
  <div className="relative">
    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
      </div>
      <select
        {...props}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          backgroundColor: "var(--bg-input)",
          borderColor: "var(--border-color)",
          color: "var(--text-primary)",
        }}
        className="pl-10 w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out shadow-sm"
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const UserDashboard = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tourImages, setTourImages] = useState({});
  const [selectedTour, setSelectedTour] = useState(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [countriesList, setCountriesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const [filters, setFilters] = useState({
    country: "",
    lodgingType: "",
    transportType: "",
    minPrice: "",
    maxPrice: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { formatPrice } = useCurrency();

  // ── Live search filter ────────────────────────────────────────────────────
  const displayedTours = useMemo(() => {
    if (!searchQuery.trim()) return tours;
    const q = searchQuery.toLowerCase();
    return tours.filter(
      (t) =>
        t.tourName?.toLowerCase().includes(q) ||
        t.tourDescription?.toLowerCase().includes(q) ||
        t.location?.toLocation?.toLowerCase().includes(q) ||
        t.location?.country?.toLowerCase().includes(q)
    );
  }, [tours, searchQuery]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    setIsFiltered(true);
    await fetchFilteredTours();
  };

  const handleClearFilters = async () => {
    setFilters({ country: "", lodgingType: "", transportType: "", minPrice: "", maxPrice: "" });
    setSearchQuery("");
    setIsFiltered(false);
    await fetchAllTours();
  };

  const handleViewDetails = (tourId) => navigate(`/user/tour/${tourId}`);
  const handleBookTour = (tour) => setSelectedTour(tour);
  const handleCloseModal = () => setSelectedTour(null);

  const handleQuickExplore = (destinationName) => {
    setSearchQuery(destinationName);
    toast.success(`⚡ Quick filter applied: showing tours for "${destinationName}"!`);
    const toursListHeader = document.getElementById("tours-list-header");
    if (toursListHeader) {
      toursListHeader.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleContactSupport = () => {
    window.open(
      "https://api.whatsapp.com/send?phone=919006894885&text=Hello, Welcome to tours chat support!",
      "_blank"
    );
  };

  const fetchAllTours = async () => {
    try {
      setLoading(true);
      const response = await dispatch(userTours());
      const data = response.payload.data.availableTours;
      setTours(data);

      const imageMap = {};
      const countries = [];
      data.forEach((tour) => {
        if (tour.tourImages?.length > 0) imageMap[tour.id] = tour.tourImages[0];
        if (tour.location?.country) countries.push(tour.location.country);
      });

      setCountriesList(Array.from(new Set(countries)));
      setTourImages(imageMap);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tours:", error);
      setError("Failed to load tours");
      setLoading(false);
    }
  };

  const fetchFilteredTours = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.country) queryParams.append("country", filters.country);
      if (filters.lodgingType) queryParams.append("lodgingType", filters.lodgingType);
      if (filters.transportType) queryParams.append("transportType", filters.transportType);
      if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
      if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);

      const response = await fetch(`${baseUrl}/customer/filterTours?${queryParams}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) throw new Error("Failed to fetch filtered tours");
      const data = await response.json();
      setTours(data.filteredTours);

      const imageMap = {};
      data.filteredTours.forEach((tour) => {
        if (tour.tourImages?.length > 0) imageMap[tour.id] = tour.tourImages[0];
      });
      setTourImages(imageMap);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching filtered tours:", error);
      setError("No tours found matching the specified criteria");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTours();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="w-full max-w-md p-8 space-y-4 text-center rounded-xl shadow-lg" style={{ backgroundColor: "var(--bg-card)" }}>
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p style={{ color: "var(--text-secondary)" }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header />
      <Banner tours={tours} tourImages={tourImages} />

      <div className="container relative px-4 py-6 mx-auto">
        {/* ── Live Search Bar ───────────────────────────────────────────── */}
        <div className="mb-4 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-blue-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tours by name, destination, or country..."
            className="w-full pl-12 pr-10 py-3.5 rounded-xl border-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all"
            style={{
              backgroundColor: "var(--bg-input)",
              borderColor: searchQuery ? "#3b82f6" : "var(--border-color)",
              color: "var(--text-primary)",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ─── 🔥 Top Must-Visit Destinations & Landmarks ────────────────── */}
        <div className="mb-10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-3.5">
            <div className="space-y-1">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <Compass className="w-5.5 h-5.5 text-blue-500 animate-spin" style={{ animationDuration: '3s' }} />
                Must-Visit Destinations & Top Attractions
              </h3>
              <p className="text-[10px] text-gray-400">Handpicked global destinations with highlights you absolutely must experience</p>
            </div>
            <div className="shrink-0 flex">
              <span className="text-[8px] bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full font-black uppercase tracking-widest animate-pulse shadow-sm">
                🔥 You Can't Miss
              </span>
            </div>
          </div>

          {/* Custom style for destinations scroll */}
          <style>{`
            .dest-scroll::-webkit-scrollbar {
              height: 6px;
            }
            .dest-scroll::-webkit-scrollbar-track {
              background: transparent;
            }
            .dest-scroll::-webkit-scrollbar-thumb {
              background: rgba(59, 130, 246, 0.15);
              border-radius: 99px;
            }
            .dest-scroll::-webkit-scrollbar-thumb:hover {
              background: rgba(59, 130, 246, 0.35);
            }
          `}</style>

          <div className="flex flex-row gap-6 overflow-x-auto whitespace-nowrap pb-4.5 pt-1.5 dest-scroll">
            {[
              {
                name: "Bali, Indonesia 🌴",
                key: "Bali",
                attractions: [
                  { label: "Ubud Sacred Forest", icon: "🐵" },
                  { label: "Uluwatu Cliff Temple", icon: "🛕" },
                  { label: "Nusa Penida Beach", icon: "🌊" }
                ],
                rating: "4.9",
                reviews: "12.4k",
                tag: "Best Seller",
                badgeBg: "bg-emerald-500 text-white",
                image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80"
              },
              {
                name: "Paris, France 🗼",
                key: "Paris",
                attractions: [
                  { label: "Eiffel Tower Climb", icon: "🗼" },
                  { label: "Louvre Art Museum", icon: "🖼️" },
                  { label: "Seine Cruise Sunset", icon: "⛵" }
                ],
                rating: "4.8",
                reviews: "8.9k",
                tag: "Romantic Getaway",
                badgeBg: "bg-blue-600 text-white",
                image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80"
              },
              {
                name: "Swiss Alps, Switzerland 🏔️",
                key: "Swiss",
                attractions: [
                  { label: "Jungfraujoch Sphinx", icon: "❄️" },
                  { label: "Zermatt Matterhorn", icon: "🏔️" },
                  { label: "Interlaken Lakes", icon: "⛵" }
                ],
                rating: "4.9",
                reviews: "6.1k",
                tag: "Premium Winter",
                badgeBg: "bg-cyan-500 text-white",
                image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80"
              },
              {
                name: "Taj Mahal, Agra 🕌",
                key: "Taj Mahal",
                attractions: [
                  { label: "Taj Mahal Sunrise", icon: "🕌" },
                  { label: "Agra Red Fort View", icon: "🧱" },
                  { label: "Fatehpur Sikri", icon: "🏛️" }
                ],
                rating: "4.7",
                reviews: "4.3k",
                tag: "Heritage Culture",
                badgeBg: "bg-amber-500 text-white",
                image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=400&q=80"
              }
            ].map((dest, i) => (
              <div
                key={i}
                className="group relative w-[260px] sm:w-[280px] lg:w-[calc(25%-18px)] shrink-0 rounded-2xl overflow-hidden border border-gray-200/60 dark:border-slate-800 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 bg-gradient-to-b from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-950/20 whitespace-normal"
              >
                {/* Image Section */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent"></div>
                  
                  {/* Floating Tag */}
                  <span className={`absolute top-2.5 left-2.5 text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-sm ${dest.badgeBg}`}>
                    {dest.tag}
                  </span>

                  {/* Rating Badge */}
                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-[10px] font-extrabold text-white">{dest.rating}</span>
                    <span className="text-[8px] text-gray-300">({dest.reviews})</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-3.5">
                    <h4 className="font-black text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5 leading-snug">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      {dest.name}
                    </h4>
                    
                    {/* Must-See attractions list */}
                    <div className="space-y-1.5 text-left bg-gray-50/50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-gray-100 dark:border-slate-900/50">
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Attractions:</span>
                      <ul className="space-y-1.5">
                        {dest.attractions.map((att, idx) => (
                          <li key={idx} className="text-[10px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                            <span className="text-xs select-none shrink-0">{att.icon}</span>
                            <span className="truncate">{att.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => handleQuickExplore(dest.key)}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-750 text-white font-extrabold rounded-xl text-[9px] uppercase tracking-widest transition-all active:scale-95 shadow-md hover:shadow-indigo-500/20 flex items-center justify-center gap-1 group-hover:scale-[1.01]"
                  >
                    <Compass className="w-3.5 h-3.5 fill-white/10" />
                    Explore Destination
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Advanced Filters Panel ────────────────────────────────────── */}
        <div className="mb-10 rounded-2xl shadow-xl overflow-hidden border dark:border-slate-800 transition-all duration-300" style={{ backgroundColor: "var(--bg-card)" }}>
          <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 p-6 flex justify-between items-center text-white">
            <div className="space-y-1">
              <h2 className="text-2xl font-black uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                Find Your Perfect Adventure
              </h2>
              <p className="text-blue-100/80 text-xs">Filter and customize your search parameters for available tours</p>
            </div>
            {(isFiltered || searchQuery) && (
              <button
                onClick={handleClearFilters}
                className="flex items-center px-4 py-2 text-xs font-black uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all duration-200 active:scale-95 shadow-sm"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </button>
            )}
          </div>

          <form onSubmit={handleFilterSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FilterSelect
                icon={MapPin}
                label="Destination Country"
                name="country"
                value={filters.country}
                onChange={handleFilterChange}
              >
                <option value="">Select country</option>
                {countriesList.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </FilterSelect>

              <FilterSelect
                icon={Building}
                label="Accommodation Type"
                name="lodgingType"
                value={filters.lodgingType}
                onChange={handleFilterChange}
              >
                <option value="">Select accommodation</option>
                <option value="Hotel">Luxury Hotel</option>
                <option value="Resort">Beach Resort</option>
                <option value="Hostel">Boutique Hostel</option>
              </FilterSelect>

              <FilterSelect
                icon={Train}
                label="Transport Mode"
                name="transportType"
                value={filters.transportType}
                onChange={handleFilterChange}
              >
                <option value="">Choose transport</option>
                <option value="Train">Scenic Train</option>
                <option value="Bus">Luxury Bus</option>
                <option value="Flight">Flight</option>
              </FilterSelect>

              <FilterInput
                icon={DollarSign}
                label="Minimum Budget"
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min price"
              />

              <FilterInput
                icon={DollarSign}
                label="Maximum Budget"
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max price"
              />

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                >
                  <Search className="w-5 h-5" />
                  <span>Search Tours</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ── Tours List Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <h1 id="tours-list-header" className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            {searchQuery
              ? `Results for "${searchQuery}" (${displayedTours.length})`
              : isFiltered
              ? `Filtered Tours (${displayedTours.length})`
              : `All Tours (${displayedTours.length})`}
          </h1>
        </div>

        {/* ── Tour Cards Grid ───────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 border-4 border-t-4 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : displayedTours.length === 0 ? (
          <div className="py-10 text-center" style={{ color: "var(--text-secondary)" }}>
            {searchQuery
              ? `No tours match your search "${searchQuery}".`
              : isFiltered
              ? "No tours match your filter criteria."
              : "No tours available."}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedTours.map((tour, idx) => {
              const bookings = tour.bookingsThisWeek !== undefined && tour.bookingsThisWeek !== null
                ? tour.bookingsThisWeek
                : getBookingsThisWeek(tour.id);
              return (
                <div
                  key={tour.id}
                  className="overflow-hidden transition transform shadow-lg rounded-2xl hover:-translate-y-1 hover:shadow-2xl animate-fadeIn group border dark:border-slate-800"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    animationDelay: `${idx * 40}ms`,
                  }}
                >
                  {/* Tour Image */}
                  <div className="relative h-48 overflow-hidden">
                    {tourImages[tour.id] ? (
                      <img
                        src={tourImages[tour.id]}
                        alt={tour.tourName}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-500 bg-gray-200">
                        No Image
                      </div>
                    )}

                    {/* Social Proof Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="social-proof-badge animate-bounceBadge">
                        🔥 {bookings} booked this week
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="space-y-1.5 text-left">
                      <h2 className="flex items-center justify-between text-lg font-black text-slate-800 dark:text-slate-100">
                        <span className="truncate">{tour.tourName}</span>
                      </h2>
                      
                      {/* Package inclusion Tags */}
                      <div className="flex gap-1.5 flex-wrap">
                        {tour.transport && (
                          <span className="text-[8px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-black uppercase tracking-wider border border-blue-100 dark:border-blue-900/40 flex items-center gap-1">
                            ✈️ {tour.transport.transportType}
                          </span>
                        )}
                        {tour.lodging && (
                          <span className="text-[8px] bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded font-black uppercase tracking-wider border border-purple-100 dark:border-purple-900/40 flex items-center gap-1">
                            🏨 {tour.lodging.lodgingType}
                          </span>
                        )}
                        <span className="text-[8px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-black uppercase tracking-wider border border-emerald-100 dark:border-emerald-900/40">
                          ✓ Guaranteed
                        </span>
                      </div>
                    </div>

                    <p className="line-clamp-2 text-xs text-left" style={{ color: "var(--text-secondary)" }}>
                      {tour.tourDescription}
                    </p>

                    <div className="flex items-center justify-between pt-3.5 border-t border-gray-100 dark:border-slate-800/60">
                      <div className="text-left">
                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-none">
                          {formatPrice(tour.price)}
                        </p>
                        <p className="text-[10px] mt-1 font-bold" style={{ color: "var(--text-muted)" }}>
                          {tour.ticketsAvailable} tickets left
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleBookTour(tour)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-650 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow hover:shadow-md"
                        >
                          Book Now
                        </button>
                        <button
                          onClick={() => handleViewDetails(tour.id)}
                          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow hover:shadow-md gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* In-App Chatbot Support */}
        <Chatbot />
        <CurrencyConverter />
      </div>
      <Footer />

      {selectedTour && (
        <BookTour
          tourId={selectedTour.id}
          isOpen={!!selectedTour}
          onClose={handleCloseModal}
          ticketsAvailable={selectedTour.ticketsAvailable}
          price={selectedTour.price}
        />
      )}
    </div>
  );
};

export default UserDashboard;