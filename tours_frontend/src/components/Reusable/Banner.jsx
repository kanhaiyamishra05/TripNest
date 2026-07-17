import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  LogOut,
  MapPin,
  Bus,
  Building2,
  User,
  ChevronRight,
  ChevronLeft,
  Ticket,
  ChevronDown,
  CircleUserRound,
  Heart,
  BarChart2,
  Tag,
  Sun,
  Moon,
  DollarSign,
  Bell,
  ShieldAlert,
  Gift,
  Sparkles,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Import your banner images
import banner1 from "../../assets/Images/banner1.jpg";
import banner2 from "../../assets/Images/banner2.jpg";
import banner3 from "../../assets/Images/banner3.jpg";
import { jwtDecode } from "jwt-decode";
import { useTheme, useCurrency } from "../../context/AppContext";
import { useDispatch } from "react-redux";
import { fetchWishlist } from "../../Redux/API/API";
import { toast } from "sonner";

const banners = [
  {
    id: 1,
    image: banner1,
    title: "Explore Beautiful Beaches",
    description:
      "Discover pristine beaches with turquoise waters and golden sands.",
  },
  {
    id: 2,
    image: banner2,
    title: "Mountain Adventures",
    description:
      "Conquer breathtaking peaks and embrace thrilling outdoor experiences.",
  },
  {
    id: 3,
    image: banner3,
    title: "Urban Escapes",
    description:
      "Experience the vibrant energy of bustling cityscapes and cultural wonders.",
  },
];

const Banner = ({ tours = [], tourImages = {}, isAdmin = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Create slides dynamically: first 4 available tours, or fallback to static banners if not loaded yet
  const activeSlides = useMemo(() => {
    if (tours && tours.length > 0) {
      return tours.slice(0, 4).map((tour) => ({
        id: tour.id,
        tourId: tour.id,
        image: tourImages[tour.id] || banner1,
        title: tour.tourName,
        description: tour.tourDescription,
      }));
    }
    return banners;
  }, [tours, tourImages]);

  useEffect(() => {
    if (activeSlides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeSlides.length]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? activeSlides.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % activeSlides.length);
  };

  return (
    <div className="relative w-full h-[600px] overflow-hidden group shadow-md">
      <div
        className="flex transition-transform duration-1000 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {activeSlides.map((banner) => (
          <div
            key={banner.id}
            className="min-w-full h-full bg-cover bg-center relative"
            style={{ backgroundImage: `url(${banner.image})` }}
          >
            {/* Reverted back to the original clean text-overlay directly on image with drop shadow */}
            <div className="absolute inset-0 bg-black/45 flex flex-col justify-center items-center text-center text-white px-6">
              <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg text-white">
                {banner.title}
              </h2>
              <p className="text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md text-white mb-6">
                {banner.description}
              </p>
              
              {/* If it's a dynamic tour, add an interactive CTA button (only if not admin) */}
              {banner.tourId && !isAdmin && (
                <div className="pt-2">
                  <button
                    onClick={() => navigate(`/user/tour/${banner.tourId}`)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all active:scale-95 shadow flex items-center gap-1.5"
                  >
                    Book This Tour
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={handlePrevious}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="text-white" />
      </button>
      <button
        onClick={handleNext}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="text-white" />
      </button>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {activeSlides.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
              currentIndex === index
                ? "bg-white scale-125 shadow"
                : "bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const Header = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const dropdownRef = useRef(null);
  const currencyRef = useRef(null);
  const notificationRef = useRef(null);

  const dispatch = useDispatch();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "❄️ Switzerland Early Bird Deal",
      message: "Get flat 15% discount on the brand new Swiss Alps winter packages! Use code: SWISS15.",
      time: "2 hours ago",
      isNew: true,
      category: "offer"
    },
    {
      id: 2,
      title: "🌴 Bali Beachfront Resorts",
      message: "We've added premium Beachfront lodging options in Nusa Dua for Bali packages.",
      time: "1 day ago",
      isNew: true,
      category: "tour"
    },
    {
      id: 3,
      title: "🧭 Advisory Updated",
      message: "Local travel regulations and visa guidelines for Bali packages have been updated.",
      time: "2 days ago",
      isNew: false,
      category: "advisory"
    }
  ]);

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => n.isNew).length;

  useEffect(() => {
    // Disable simulated promotional notifications for administrators
    if (userRole === "ROLE_ADMIN") return;

    // Simulating a new offer notification after 15 seconds!
    const timer = setTimeout(() => {
      const newOffer = {
        id: Date.now(),
        title: "⚡ Monsoon Special Offer",
        message: "Grab flat 20% discount on Bali tropical tours with coupon code MONSOON20!",
        time: "Just now",
        isNew: true,
        category: "offer"
      };
      setNotifications(prev => [newOffer, ...prev]);
      toast.info("⚡ New travel offer released! Check notification center.");
    }, 15000);

    return () => clearTimeout(timer);
  }, [userRole]);

  // Dark mode & currency from context
  const { isDark, toggleTheme } = useTheme();
  const { currency, setCurrency, EXCHANGE_RATES } = useCurrency();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && userRole === "ROLE_CUSTOMER") {
      const getWishlistCount = async () => {
        try {
          const res = await dispatch(fetchWishlist()).unwrap();
          setWishlistCount(res ? res.length : 0);
        } catch (err) {
          console.error("Error loading wishlist count:", err);
        }
      };
      getWishlistCount();

      window.addEventListener("wishlistUpdated", getWishlistCount);
      return () => {
        window.removeEventListener("wishlistUpdated", getWishlistCount);
      };
    }
  }, [userRole, dispatch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setIsCurrencyOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserRole(decodedToken.role);
        setUserEmail(decodedToken.sub);
      } catch (error) {
        console.error("Invalid token", error);
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // Menu items for different roles
  const adminMenuItems = [
    {
      label: "Dashboard",
      icon: <CircleUserRound className="mr-2 w-4 h-4" />,
      onClick: () => navigate("/admin/dashboard"),
    },
    {
      label: "Analytics",
      icon: <BarChart2 className="mr-2 w-4 h-4 text-blue-500" />,
      onClick: () => navigate("/admin/analytics"),
    },
    {
      label: "Coupons",
      icon: <Tag className="mr-2 w-4 h-4 text-green-500" />,
      onClick: () => navigate("/admin/coupons"),
    },
    {
      label: "Tickets",
      icon: <Ticket className="mr-2 w-4 h-4" />,
      onClick: () => navigate("/admin/tickets"),
    },
    {
      label: "Locations",
      icon: <MapPin className="mr-2 w-4 h-4" />,
      onClick: () => navigate("/admin/locations"),
    },
    {
      label: "Transport",
      icon: <Bus className="mr-2 w-4 h-4" />,
      onClick: () => navigate("/admin/transport"),
    },
    {
      label: "Lodging",
      icon: <Building2 className="mr-2 w-4 h-4" />,
      onClick: () => navigate("/admin/lodging"),
    },
  ];

  const customerMenuItems = [
    {
      label: "Dashboard",
      icon: <CircleUserRound className="mr-2 w-4 h-4" />,
      onClick: () => navigate("/user/dashboard"),
    },
    {
      label: "My Bookings",
      icon: <Ticket className="mr-2 w-4 h-4" />,
      onClick: () => navigate("/user/bookings"),
    },
    {
      label: "Wishlist",
      icon: <Heart className="mr-2 w-4 h-4 text-red-500 fill-red-500" />,
      onClick: () => navigate("/user/wishlist"),
    },
    {
      label: "My Profile",
      icon: <User className="mr-2 w-4 h-4 text-blue-500" />,
      onClick: () => navigate("/user/profile"),
    },
  ];

  const menuItems =
    userRole === "ROLE_ADMIN"
      ? adminMenuItems
      : userRole === "ROLE_CUSTOMER"
      ? customerMenuItems
      : [];

  const showDropdown = !!localStorage.getItem("token");

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-black/60 to-transparent py-4 px-6 text-white">
      <nav className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div
          className="text-2xl font-bold flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          TripNest
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">

          {/* ── Currency Switcher ── */}
          {showDropdown && (
            <div ref={currencyRef} className="relative">
              <button
                onClick={() => setIsCurrencyOpen((v) => !v)}
                className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-semibold transition-all backdrop-blur-sm border border-white/20"
                title="Switch currency"
              >
                <DollarSign className="w-3.5 h-3.5" />
                {currency}
                <ChevronDown className="w-3 h-3" />
              </button>

              {isCurrencyOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white text-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-100 animate-fadeIn z-50">
                  {Object.entries(EXCHANGE_RATES).map(([code, info]) => (
                    <button
                      key={code}
                      onClick={() => {
                        setCurrency(code);
                        setIsCurrencyOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-blue-50 transition-colors flex items-center justify-between ${
                        currency === code ? "bg-blue-50 text-blue-600 font-bold" : ""
                      }`}
                    >
                      <span>{info.label}</span>
                      {currency === code && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 block" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Wishlist Badge Counter ── */}
          {showDropdown && userRole === "ROLE_CUSTOMER" && (
            <button
              onClick={() => navigate("/user/wishlist")}
              className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 transition-all text-white group"
              title="View Wishlist"
            >
              <Heart className="w-4.5 h-4.5 text-red-500 fill-red-500 group-hover:scale-110 transition-transform" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </button>
          )}

          {/* ── Notification Bell Center ── */}
          {showDropdown && userRole === "ROLE_CUSTOMER" && (
            <div ref={notificationRef} className="relative">
              <button
                onClick={() => setIsNotificationOpen((v) => !v)}
                className={`relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 transition-all text-white group ${
                  unreadCount > 0 ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950 animate-pulse" : ""
                }`}
                title="Notifications"
              >
                <Bell className={`w-4.5 h-4.5 group-hover:rotate-12 transition-all ${unreadCount > 0 ? "text-yellow-300 animate-bounce" : ""}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-ping">
                    {unreadCount}
                  </span>
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md z-10">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-950/95 backdrop-blur-xl text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden border border-slate-800/80 animate-fadeIn z-50">
                  {/* Custom CSS to inject to style the scrollbar */}
                  <style>{`
                    .notify-scroll::-webkit-scrollbar {
                      width: 5px;
                      height: 0px;
                    }
                    .notify-scroll::-webkit-scrollbar-track {
                      background: transparent;
                    }
                    .notify-scroll::-webkit-scrollbar-thumb {
                      background: rgba(99, 102, 241, 0.25);
                      border-radius: 99px;
                    }
                    .notify-scroll::-webkit-scrollbar-thumb:hover {
                      background: rgba(99, 102, 241, 0.45);
                    }
                  `}</style>

                  {/* Header Gradient */}
                  <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800/60 flex justify-between items-center text-white">
                    <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                      Live Broadcasts
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[9px] text-indigo-300 hover:text-white font-extrabold uppercase bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-lg transition-all active:scale-95 shadow-sm"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  
                  {/* Notifications list */}
                  <div className="max-h-72 overflow-y-auto overflow-x-hidden notify-scroll py-2 space-y-2">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 italic space-y-1">
                        <p>No new broadcasts available.</p>
                        <p className="text-[9px] opacity-75">Check back later for new tours & discounts!</p>
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const icon = 
                          n.category === 'offer' ? <Gift className="w-3.5 h-3.5 text-emerald-400" /> :
                          n.category === 'tour' ? <Sparkles className="w-3.5 h-3.5 text-blue-400" /> :
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />;
                        
                        const border = 
                          n.category === 'offer' ? 'border-l-4 border-l-emerald-500' :
                          n.category === 'tour' ? 'border-l-4 border-l-blue-500' :
                          'border-l-4 border-l-amber-500';

                        return (
                          <div
                            key={n.id}
                            className={`mx-2.5 p-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/85 border border-slate-900 hover:border-slate-800 hover:translate-x-0.5 transition-all duration-300 relative text-left ${border} ${
                              n.isNew ? "bg-indigo-950/10" : ""
                            }`}
                          >
                            {n.isNew && (
                              <span className="absolute top-4 right-4 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                              </span>
                            )}
                            <div className="flex justify-between items-start pr-4 mb-1">
                              <span className="block text-[11px] font-extrabold text-slate-100 flex items-center gap-1.5 leading-snug">
                                {icon}
                                {n.title}
                              </span>
                              <button
                                onClick={() => deleteNotification(n.id)}
                                className="text-[9px] text-slate-500 hover:text-red-400 font-bold uppercase transition-colors"
                                title="Dismiss"
                              >
                                ✕
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-medium mb-2 pr-2">{n.message}</p>
                            <div className="flex gap-2 items-center pt-2 border-t border-slate-800/40">
                              <span className="text-[8px] font-mono text-slate-500 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {n.time}
                              </span>
                              <span className={`text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                                n.category === 'offer' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                n.category === 'tour' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {n.category}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  
                  {/* Dropdown Footer */}
                  <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-900 text-center flex items-center justify-center gap-1.5">
                    <Sparkles className="w-2.5 h-2.5 text-yellow-500 animate-spin" />
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">TripNest Live Broadcasting Center</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Dark Mode Toggle ── */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 transition-all"
          >
            {isDark ? (
              <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-yellow-300" />
            ) : (
              <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
            )}
          </button>

          {/* ── User / Admin Dropdown ── */}
          {showDropdown && (
            <div ref={dropdownRef} className="relative">
              <div
                className="flex items-center hover:text-blue-300 transition-colors cursor-pointer text-xs sm:text-sm"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {userRole === "ROLE_ADMIN" ? (
                  <span className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/20">
                    <CircleUserRound className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-indigo-400" />
                    <span className="hidden sm:inline">Admin</span>
                  </span>
                ) : (
                  <CircleUserRound className="w-7 h-7 sm:w-8 sm:h-8" />
                )}
                <ChevronDown className="ml-1 w-3 h-3 sm:ml-2 sm:w-4 sm:h-4" />
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-black shadow-lg rounded-xl overflow-hidden border border-gray-100 animate-fadeIn">
                  <div className="px-4 py-2 bg-gray-50 border-b">
                    <p className="text-sm font-medium truncate text-gray-700">{userEmail}</p>
                  </div>
                  {menuItems.map((item) => (
                    <div
                      key={item.label}
                      className="px-4 py-2.5 hover:bg-gray-50 flex items-center cursor-pointer text-sm"
                      onClick={() => {
                        item.onClick();
                        setIsDropdownOpen(false);
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </div>
                  ))}
                  <div
                    className="px-4 py-2.5 hover:bg-red-50 flex items-center cursor-pointer text-red-500 border-t text-sm"
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 w-4 h-4" />
                    Logout
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const footerLinks = [
    { label: "Terms of Service", to: "/terms-of-service" },
    { label: "Privacy Policy", to: "/privacy-policy" },
  ];

  const socials = [
    { icon: Facebook, name: "Facebook", href: "#" },
    { icon: Instagram, name: "Instagram", href: "#" },
    { icon: Youtube, name: "Youtube", href: "#" },
    { icon: Twitter, name: "Twitter", href: "#" },
    { icon: Linkedin, name: "LinkedIn", href: "#" }
  ];

  return (
    <footer className="bg-gray-900 text-white py-8 px-6 border-t border-slate-800">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Copyright */}
        <div className="text-sm text-gray-400">
          &copy; {currentYear} TripNest System. All Rights Reserved.
        </div>

        {/* Social Media Icons */}
        <div className="flex items-center space-x-3.5">
          {socials.map((soc, idx) => {
            const Icon = soc.icon;
            return (
              <a
                key={idx}
                href={soc.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-slate-800 hover:bg-blue-600 rounded-full transition-all duration-300 text-gray-300 hover:text-white transform hover:scale-110 active:scale-95 shadow-sm border border-slate-700/50 hover:border-transparent"
                title={soc.name}
              >
                <Icon className="w-4 h-4" />
              </a>
            );
          })}
        </div>

        {/* Links */}
        <div className="flex space-x-6 text-sm">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-gray-400 hover:text-blue-300 transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export { Banner, Header, Footer };
