import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Calendar, Ticket, DollarSign, ArrowLeft, Loader2, Sparkles, MessageCircle, XCircle, Download, CloudSun, CloudRain, CloudSnow, Sun, Thermometer, Receipt, ShieldAlert, Navigation, Play, Pause, RotateCcw, Compass, Clock } from "lucide-react";
import { Header, Footer } from "../../Reusable/Banner";
import Chatbot from "../../Reusable/Chatbot";
import CurrencyConverter from "../../Reusable/CurrencyConverter";
import { userBookings, cancelBooking } from "../../../Redux/API/API";
import { toast } from "sonner";
import { useCurrency } from "../../../context/AppContext";
import { jwtDecode } from "jwt-decode";

const CountdownTimer = ({ startDate }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(startDate) - +new Date();
      let timeLeft = {};

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      } else {
        timeLeft = { completed: true };
      }
      return timeLeft;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [startDate]);

  if (!timeLeft) return null;

  if (timeLeft.completed) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-md border border-green-200/50">
        ✨ Ongoing / Completed
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-blue-50/50 dark:bg-blue-950/20 px-2 py-1 rounded-lg border border-blue-100/50 dark:border-blue-900/30">
      <span className="text-[9px] uppercase font-bold text-blue-500 dark:text-blue-400 animate-pulse">Starts In:</span>
      <div className="flex gap-0.5 text-[10px] font-black text-gray-800 dark:text-slate-200 font-mono">
        <span>{String(timeLeft.days).padStart(2, '0')}d</span>
        <span className="text-blue-500">:</span>
        <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
        <span className="text-blue-500">:</span>
        <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
        <span className="text-blue-500">:</span>
        <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
      </div>
    </div>
  );
};

const getWeatherData = (location) => {
  if (!location) return [];
  const loc = location.toLowerCase();
  if (loc.includes("bali")) {
    return [
      { dayName: "Today", temp: 31, condition: "Sunny", icon: <Sun className="w-5 h-5 text-orange-500 animate-pulse" /> },
      { dayName: "Tomorrow", temp: 29, condition: "Rainy Showers", icon: <CloudRain className="w-5 h-5 text-blue-400" /> },
      { dayName: "Day 3", temp: 30, condition: "Partly Cloudy", icon: <CloudSun className="w-5 h-5 text-yellow-500" /> },
    ];
  }
  if (loc.includes("manali") || loc.includes("alps") || loc.includes("swiss")) {
    return [
      { dayName: "Today", temp: -2, condition: "Heavy Snow", icon: <CloudSnow className="w-5 h-5 text-blue-200 animate-bounce" /> },
      { dayName: "Tomorrow", temp: 0, condition: "Snow Showers", icon: <CloudSnow className="w-5 h-5 text-blue-300" /> },
      { dayName: "Day 3", temp: 3, condition: "Sunny Peaks", icon: <CloudSun className="w-5 h-5 text-yellow-500" /> },
    ];
  }
  return [
    { dayName: "Today", temp: 24, condition: "Clear Sky", icon: <Sun className="w-5 h-5 text-orange-500" /> },
    { dayName: "Tomorrow", temp: 22, condition: "Light Rain", icon: <CloudRain className="w-5 h-5 text-blue-400" /> },
    { dayName: "Day 3", temp: 25, condition: "Scattered Clouds", icon: <CloudSun className="w-5 h-5 text-yellow-500" /> },
  ];
};

const getItineraryData = (tour, bookingId) => {
  if (!tour) return [];
  const start = new Date(tour.startDate);
  const end = new Date(tour.endDate);
  const diffTime = Math.abs(end - start);
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 3;

  const itinerary = [];
  for (let d = 0; d < days; d++) {
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + d);
    const dayLabel = dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    
    let title = "";
    let desc = "";
    if (d === 0) {
      title = "Arrival & Resort Check-In";
      desc = `Arrive at destination. Direct transfer to lodging: ${tour.lodging?.lodgingName || "Standard Accommodation"}. Check-in & guide briefing.`;
    } else if (d === days - 1) {
      title = "Checkout & Homeward Bound";
      desc = `Morning checkout from ${tour.lodging?.lodgingName || "Resort"}. Boarding transport: ${tour.transport?.transportName || "Transit vehicle"} for departure.`;
    } else {
      title = `Day ${d + 1}: Adventure & Exploration`;
      const activity = tour.activities && tour.activities[d % tour.activities.length] 
        ? tour.activities[d % tour.activities.length] 
        : "Leisure sightseeing & local exploring";
      desc = `Participate in ${activity}. Meals included: Breakfast & Dinner.`;
    }
    itinerary.push({ day: d + 1, date: dayLabel, title, desc });
  }
  return itinerary;
};

const getPackingItems = (locationName = "") => {
  const loc = String(locationName).toLowerCase();
  const baseItems = [
    { id: "id", name: "Valid Photo ID & Tickets", checked: false },
    { id: "charge", name: "Phone Chargers & Power Bank", checked: false },
    { id: "kit", name: "First-Aid & Personal Meds", checked: false },
    { id: "cash", name: "Cash & Cards Wallet", checked: false }
  ];
  
  if (loc.includes("manali") || loc.includes("alps") || loc.includes("mountain") || loc.includes("swiss") || loc.includes("snow") || loc.includes("himachal")) {
    return [
      ...baseItems,
      { id: "jacket", name: "Heavy Winter Jacket / Coat", checked: false },
      { id: "gloves", name: "Warm Gloves & Beanie", checked: false },
      { id: "boots", name: "Trekking Boots & Socks", checked: false },
      { id: "moist", name: "Cold Cream & Lip Balm", checked: false }
    ];
  } else if (loc.includes("bali") || loc.includes("goa") || loc.includes("beach") || loc.includes("tropical")) {
    return [
      ...baseItems,
      { id: "swim", name: "Swimwear & Beach Shorts", checked: false },
      { id: "sunscreen", name: "SPF 50+ Sunscreen", checked: false },
      { id: "sunglasses", name: "Sunglasses & Sun Hat", checked: false },
      { id: "slipper", name: "Slippers & Light Clothing", checked: false }
    ];
  } else if (loc.includes("paris") || loc.includes("london") || loc.includes("europe") || loc.includes("city")) {
    return [
      ...baseItems,
      { id: "shoes", name: "Comfortable Walking Shoes", checked: false },
      { id: "umbrella", name: "Compact Umbrella / Raincoat", checked: false },
      { id: "camera", name: "Camera & Gear", checked: false },
      { id: "adaptor", name: "Universal Travel Adapter", checked: false }
    ];
  } else {
    return [
      ...baseItems,
      { id: "shoes", name: "Comfortable Sneakers", checked: false },
      { id: "clothes", name: "Casual Clothes & Sun Hat", checked: false },
      { id: "bottle", name: "Reusable Water Bottle", checked: false }
    ];
  }
};

const getInteractiveMapData = (locationName = "") => {
  const loc = String(locationName).toLowerCase();
  if (loc.includes("manali") || loc.includes("himachal")) {
    return {
      title: "Manali Sightseeing Landmarks Map",
      backdrop: "bg-amber-50/70 border-amber-200/50",
      landmarks: [
        { id: 1, name: "Solang Valley", icon: "🏂", top: "25%", left: "25%", desc: "Famous for snow sports, paragliding, and cable car rides." },
        { id: 2, name: "Hadimba Temple", icon: "🛕", top: "50%", left: "45%", desc: "Ancient 1553 wooden pagoda temple surrounded by cedar forest." },
        { id: 3, name: "Rohtang Pass", icon: "🏔️", top: "15%", left: "75%", desc: "High mountain pass with snow vistas all year round." },
        { id: 4, name: "Mall Road", icon: "🛍️", top: "75%", left: "60%", desc: "Bustling central street with local handicraft markets." }
      ]
    };
  } else if (loc.includes("bali") || loc.includes("indonesia")) {
    return {
      title: "Bali Tropical Attractions Map",
      backdrop: "bg-emerald-50/70 border-emerald-200/50",
      landmarks: [
        { id: 1, name: "Uluwatu Temple", icon: "🛕", top: "75%", left: "20%", desc: "Cliff-side sea temple offering magical sunset fire dances." },
        { id: 2, name: "Ubud Monkey Forest", icon: "🐒", top: "40%", left: "45%", desc: "Sacred sanctuary with wild monkeys and ancient jungle temples." },
        { id: 3, name: "Nusa Penida", icon: "🏖️", top: "70%", left: "80%", desc: "Breathtaking island cliffs and crystal T-Rex-shaped Kelingking beach." },
        { id: 4, name: "Mount Batur", icon: "🌋", top: "15%", left: "70%", desc: "Active volcano popular for early morning sunrise trekking." }
      ]
    };
  } else if (loc.includes("paris") || loc.includes("france")) {
    return {
      title: "Paris Romantic Landmarks Map",
      backdrop: "bg-blue-50/70 border-blue-200/50",
      landmarks: [
        { id: 1, name: "Eiffel Tower", icon: "🗼", top: "45%", left: "20%", desc: "Signature wrought-iron monument with panoramic views." },
        { id: 2, name: "Louvre Museum", icon: "🎨", top: "35%", left: "55%", desc: "World's largest art museum holding the famous Mona Lisa." },
        { id: 3, name: "Notre Dame", icon: "⛪", top: "60%", left: "70%", desc: "Medieval Catholic cathedral representing high Gothic architecture." },
        { id: 4, name: "Sacré-Cœur", icon: "🏰", top: "15%", left: "50%", desc: "White stone basilica perched high on Montmartre hill." }
      ]
    };
  } else {
    return {
      title: "General Sightseeing Highlights Map",
      backdrop: "bg-gray-50/70 border-gray-200/50",
      landmarks: [
        { id: 1, name: "City Center", icon: "🏢", top: "40%", left: "30%", desc: "Explore local cultural hubs and historic town squares." },
        { id: 2, name: "Nature Preserve", icon: "🏞️", top: "20%", left: "70%", desc: "Serene walking trails and local wildlife viewpoints." },
        { id: 3, name: "Food Market", icon: "🍜", top: "70%", left: "60%", desc: "Bustling street food stalls serving traditional culinary items." }
      ]
    };
  }
};

const getTravelAdvisory = (locationName = "") => {
  const loc = String(locationName).toLowerCase();
  if (loc.includes("manali") || loc.includes("himachal")) {
    return [
      { category: "🛂 Permit Requirements", text: "Rohtang Pass visits require a special NGT permit. Please check with your driver 1 day in advance." },
      { category: "🌡️ Clothing Advisory", text: "Heavy woolen coats, gloves, thermal wear, and boots are mandatory for snow points. Rentals are available along Solang road." },
      { category: "💉 Altitude & Health", text: "Rohtang is at 13,000 ft. Carry basic mountain sickness pills (Acetazolamide) and keep hydrated. Avoid rapid climbing." }
    ];
  } else if (loc.includes("bali") || loc.includes("indonesia")) {
    return [
      { category: "🛂 Visa Guidelines", text: "Indian passport holders can obtain a Visa-on-Arrival (VoA) at Denpasar airport for 500,000 IDR (~2700 INR)." },
      { category: "🌡️ Tropical Weather", text: "Hot and humid climate. Light cotton clothes, sunscreen (SPF 50+), sunglasses, and swimwear are highly recommended." },
      { category: "💉 Food & Hydration", text: "Drink only bottled water ('Bali Belly' protection). Avoid tap water and uncooked street salads." }
    ];
  } else if (loc.includes("paris") || loc.includes("france") || loc.includes("europe")) {
    return [
      { category: "🛂 Schengen Visa", text: "A valid Schengen short-stay tourist visa is required. Ensure passport validity is at least 6 months." },
      { category: "🌡️ City Dress Code", text: "Comfortable smart-casuals and solid walking shoes. Carry a compact umbrella as brief showers are common." },
      { category: "💉 Safety & Scams", text: "Watch out for pickpockets near Eiffel Tower and Metro lines. Decline unregistered cabs at the airport terminal." }
    ];
  } else {
    return [
      { category: "🛂 Travel Visa", text: "Please verify double-entry tourist visa guidelines for your destination country prior to boarding." },
      { category: "🌡️ Attire Suggestion", text: "Wear comfortable shoes and bring seasonal outfits. Check 3-day weather predictions before packing." },
      { category: "💉 Safety Guidelines", text: "Keep a digital copy of your passport in the Digital Locker and verify emergency medical cover details." }
    ];
  }
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);
  const [checklistData, setChecklistData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [userName, setUserName] = useState("Valued Guest");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.name) {
          setUserName(decoded.name);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const [reviewsData, setReviewsData] = useState(() => {
    try {
      const saved = localStorage.getItem("bookings_reviews");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [tempRatings, setTempRatings] = useState({});
  const [tempTexts, setTempTexts] = useState({});
  const [activeLandmarks, setActiveLandmarks] = useState({});

  const [scrapbooks, setScrapbooks] = useState(() => {
    try {
      const saved = localStorage.getItem("bookings_scrapbooks");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [newMemoryCaption, setNewMemoryCaption] = useState({});
  const [newMemoryDay, setNewMemoryDay] = useState({});
  const [newMemoryImage, setNewMemoryImage] = useState({});

  const handleAddMemory = (bookingId) => {
    const caption = newMemoryCaption[bookingId] || "";
    const day = newMemoryDay[bookingId] || "Day 1";
    const image = newMemoryImage[bookingId] || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80";

    if (!caption.trim()) {
      toast.error("Please enter a caption for your polaroid!");
      return;
    }

    const currentList = scrapbooks[bookingId] || [
      {
        id: 1,
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
        caption: "Sunsets by the coast. Absolute bliss!",
        day: "Day 1"
      },
      {
        id: 2,
        image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80",
        caption: "Road trips and mountain ranges.",
        day: "Day 2"
      }
    ];

    const newEntry = {
      id: Date.now(),
      image,
      caption,
      day
    };

    const updated = {
      ...scrapbooks,
      [bookingId]: [newEntry, ...currentList]
    };

    setScrapbooks(updated);
    localStorage.setItem("bookings_scrapbooks", JSON.stringify(updated));

    // Reset fields
    setNewMemoryCaption({ ...newMemoryCaption, [bookingId]: "" });
    toast.success("Added new travel memory polaroid!");
  };

  const handleDeleteMemory = (bookingId, memoryId) => {
    const currentList = scrapbooks[bookingId] || [];
    const updatedList = currentList.filter(m => m.id !== memoryId);

    const updated = {
      ...scrapbooks,
      [bookingId]: updatedList
    };

    setScrapbooks(updated);
    localStorage.setItem("bookings_scrapbooks", JSON.stringify(updated));
    toast.success("Removed memory polaroid.");
  };

  const [simulationState, setSimulationState] = useState({});

  useEffect(() => {
    // Check if any simulation is active and playing
    const activeBookingIds = Object.keys(simulationState).filter(
      (id) => simulationState[id].isPlaying
    );
    if (activeBookingIds.length === 0) return;

    const interval = setInterval(() => {
      setSimulationState((prev) => {
        const next = { ...prev };
        activeBookingIds.forEach((id) => {
          const sim = next[id];
          if (!sim || !sim.isPlaying) return;

          let newProgress = sim.progress + 4; // increment progress by 4% every 60ms
          let newStopIndex = sim.currentStopIndex;

          if (newProgress >= 100) {
            newProgress = 0;
            newStopIndex = newStopIndex + 1;
            
            // Play audio alert when passing a stop
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.setValueAtTime(520, ctx.currentTime);
              gain.gain.setValueAtTime(0.08, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
              osc.start();
              osc.stop(ctx.currentTime + 0.3);
            } catch (e) {}
          }

          const landmarks = sim.landmarks || [];
          if (newStopIndex >= landmarks.length - 1) {
            // End of simulation!
            next[id] = {
              ...sim,
              isPlaying: false,
              currentStopIndex: landmarks.length - 1,
              progress: 0,
              x: parseFloat(landmarks[landmarks.length - 1].left),
              y: parseFloat(landmarks[landmarks.length - 1].top),
              statusMessage: `🏁 Reached final destination: ${landmarks[landmarks.length - 1].name}!`
            };
          } else {
            const startNode = landmarks[newStopIndex];
            const endNode = landmarks[newStopIndex + 1];
            const startX = parseFloat(startNode.left);
            const startY = parseFloat(startNode.top);
            const endX = parseFloat(endNode.left);
            const endY = parseFloat(endNode.top);
            const x = startX + (endX - startX) * (newProgress / 100);
            const y = startY + (endY - startY) * (newProgress / 100);

            next[id] = {
              ...sim,
              currentStopIndex: newStopIndex,
              progress: newProgress,
              x,
              y,
              statusMessage: `✈️ Departing ${startNode.name} ➔ heading towards ${endNode.name}...`
            };
          }
        });
        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [simulationState]);

  const triggerSimulation = (bookingId, landmarks) => {
    setSimulationState((prev) => ({
      ...prev,
      [bookingId]: {
        isPlaying: true,
        currentStopIndex: 0,
        progress: 0,
        landmarks,
        x: parseFloat(landmarks[0].left),
        y: parseFloat(landmarks[0].top),
        statusMessage: `🛫 Takeoff initiated from ${landmarks[0].name}...`
      }
    }));
  };

  const toggleSimulationPlay = (bookingId) => {
    setSimulationState((prev) => {
      const sim = prev[bookingId];
      if (!sim) return prev;
      return {
        ...prev,
        [bookingId]: {
          ...sim,
          isPlaying: !sim.isPlaying
        }
      };
    });
  };

  const resetSimulation = (bookingId, landmarks) => {
    setSimulationState((prev) => ({
      ...prev,
      [bookingId]: {
        isPlaying: false,
        currentStopIndex: 0,
        progress: 0,
        landmarks,
        x: parseFloat(landmarks[0].left),
        y: parseFloat(landmarks[0].top),
        statusMessage: "Simulator reset. Ready to play."
      }
    }));
  };

  const handleSaveReview = (bookingId) => {
    const rating = tempRatings[bookingId] || 5;
    const text = tempTexts[bookingId] || "";
    
    const updated = {
      ...reviewsData,
      [bookingId]: { rating, text },
    };
    setReviewsData(updated);
    localStorage.setItem("bookings_reviews", JSON.stringify(updated));
    toast.success("Thank you for your feedback! Review saved.");
  };

  const handleDeleteReview = (bookingId) => {
    const updated = { ...reviewsData };
    delete updated[bookingId];
    setReviewsData(updated);
    localStorage.setItem("bookings_reviews", JSON.stringify(updated));
    
    // Also clear input states
    const updatedRatings = { ...tempRatings };
    delete updatedRatings[bookingId];
    setTempRatings(updatedRatings);

    const updatedTexts = { ...tempTexts };
    delete updatedTexts[bookingId];
    setTempTexts(updatedTexts);

    toast.success("Review deleted successfully.");
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    // Load packing checklist progress from localStorage
    const saved = localStorage.getItem("tripnest_checklist");
    if (saved) {
      try {
        setChecklistData(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading checklist", e);
      }
    }
  }, []);

  const handleToggleChecklistItem = (bookingId, itemId, defaultItems) => {
    const currentList = checklistData[bookingId] || defaultItems.map(item => ({ ...item }));
    const updatedList = currentList.map(item => {
      if (item.id === itemId) {
        return { ...item, checked: !item.checked };
      }
      return item;
    });

    const newData = { ...checklistData, [bookingId]: updatedList };
    setChecklistData(newData);
    localStorage.setItem("tripnest_checklist", JSON.stringify(newData));
  };

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        setLoading(true);
        const response = await dispatch(userBookings()).unwrap();
        setBookings(response.bookings || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching customer bookings:", err);
        setError("Failed to load your bookings history. Please try again.");
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, [dispatch]);

  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this booking? This will restore the tickets and mark it as cancelled.");
    if (!confirmCancel) return;

    try {
      await dispatch(cancelBooking(bookingId)).unwrap();
      toast.success("Booking cancelled successfully!");
      // Reload bookings list
      const response = await dispatch(userBookings()).unwrap();
      setBookings(response.bookings || []);
    } catch (err) {
      toast.error(err?.message || "Failed to cancel booking. Please try again.");
    }
  };

  const downloadTicketPDF = (booking) => {
    const bookingId = booking.bookingId;
    const wrapper = document.getElementById("pdf-print-wrapper");
    const element = document.getElementById(`ticket-pdf-${bookingId}`);
    if (!wrapper || !element) return;

    // Temporarily bring the wrapper into viewport bounds at top-left
    const originalWrapperStyle = wrapper.style.cssText;
    wrapper.style.position = 'fixed';
    wrapper.style.left = '0px';
    wrapper.style.top = '0px';
    wrapper.style.zIndex = '99999';

    // Make only the targeted ticket visible inside the wrapper
    element.style.display = 'block';

    const opt = {
      margin:       0.1,
      filename:     `TripNest_Ticket_${bookingId}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, scrollY: 0, scrollX: 0 },
      jsPDF:        { unit: 'in', format: [8.5, 12.0], orientation: 'portrait' }
    };
    
    const runHtml2Pdf = () => {
      setTimeout(() => {
        window.html2pdf().set(opt).from(element).save().then(() => {
          // Restore off-screen hidden styles
          wrapper.style.cssText = originalWrapperStyle;
          element.style.display = 'none';
        }).catch(err => {
          console.error("PDF generation failed:", err);
          wrapper.style.cssText = originalWrapperStyle;
          element.style.display = 'none';
        });
      }, 150);
    };

    if (window.html2pdf) {
      runHtml2Pdf();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = runHtml2Pdf;
      document.body.appendChild(script);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-green-100 text-green-700 shadow-sm border border-green-200">
            Confirmed
          </span>
        );
      case "PENDING":
        return (
          <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 shadow-sm border border-yellow-200">
            Pending
          </span>
        );
      case "FAILED":
        return (
          <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-100 text-red-700 shadow-sm border border-red-200">
            Failed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-400 shadow-sm border border-gray-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 shadow-sm border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Off-screen Printable Tickets at the absolute top of document flow */}
      <div id="pdf-print-wrapper" style={{ position: "absolute", left: "-9999px", top: "-9999px", zIndex: -1 }}>
        {bookings.map((booking) => {
          const tour = booking.tour || {};
          return (
            <div
              key={`pdf-print-${booking.bookingId}`}
              id={`ticket-pdf-${booking.bookingId}`}
              style={{ display: "none", width: "700px", padding: "12px", backgroundColor: "#F3F4F6" }}
              className="font-sans text-gray-800"
            >
              {/* Ticket Container */}
              <div className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-l-blue-600 border-y border-r border-gray-200 space-y-4 relative overflow-hidden">
                
                {/* Gold Seal / Hologram Stamp watermark */}
                <div className="absolute right-8 bottom-16 border-4 border-double border-yellow-500/20 text-yellow-500/20 rounded-full p-2.5 text-center select-none uppercase tracking-widest font-black text-[9px] rotate-12 pointer-events-none">
                  TripNest<br/>Verified
                </div>

                {/* Header */}
                <div className="border-b pb-3 flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-black text-blue-600 tracking-wider">TripNest Travel Itinerary</h1>
                    <p className="text-[10px] text-gray-500 mt-0.5">Confirmed boarding folder & booking receipts</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">Booking Reference</span>
                    <span className="text-sm font-mono font-bold text-white bg-blue-600 px-3 py-0.5 rounded-lg shadow-sm">#BK-{booking.bookingId}</span>
                  </div>
                </div>

                {/* Section 1: Booking & Receipt Summary */}
                <div className="border border-gray-150 rounded-xl p-4 bg-gray-50/50">
                  <h3 className="text-[10px] font-extrabold uppercase text-gray-400 tracking-widest mb-3">📌 Booking & Passenger Details</h3>
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-6 text-[11px]">
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase text-[8px] tracking-wider">Passenger Name</span>
                      <span className="font-bold text-gray-800">{booking.customer?.name || "Passenger"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase text-[8px] tracking-wider">Email Address</span>
                      <span className="font-bold text-gray-800">{booking.customer?.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase text-[8px] tracking-wider">Contact Number</span>
                      <span className="font-bold text-gray-800">{booking.customer?.contactNumber || booking.customer?.contact || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase text-[8px] tracking-wider">Booked On</span>
                      <span className="font-bold text-gray-800">{formatDate(booking.bookingDate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase text-[8px] tracking-wider">Transaction ID</span>
                      <span className="font-mono font-bold text-gray-800">{booking.paymentTransactionId || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase text-[8px] tracking-wider">Payment Status</span>
                      <span className="font-extrabold text-green-700 uppercase">{booking.paymentStatus}</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed mt-3 pt-3 grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase text-[8px] tracking-wider">Base Price</span>
                      <span className="font-bold text-gray-800">{formatPrice(booking.totalPrice)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase text-[8px] tracking-wider">Discount Applied</span>
                      <span className="font-bold text-red-500">-{formatPrice(booking.discountApplied || 0)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase text-[8px] tracking-wider">Total Paid</span>
                      <span className="font-black text-xs text-green-700">{formatPrice(booking.finalAmount > 0 ? booking.finalAmount : booking.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Flight / Transport Details */}
                {tour.transport && (() => {
                  const flightNum = `TN-${(booking.bookingId * 137) % 900 + 100}`;
                  const gate = `B-${(booking.bookingId * 7) % 20 + 1}`;
                  const seat = `${(booking.bookingId * 3) % 28 + 1}${['A', 'B', 'C', 'D', 'E', 'F'][booking.bookingId % 6]}`;
                  return (
                    <div className="border border-gray-150 rounded-xl p-4 bg-gradient-to-r from-blue-50/20 to-white relative overflow-hidden">
                      {/* Decorative airplane trail bg */}
                      <div className="absolute right-4 bottom-4 text-[70px] text-blue-500/10 pointer-events-none leading-none select-none">✈</div>
                      
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-[10px] font-black uppercase text-blue-600 tracking-widest">
                          ✈️ Transport Boarding Pass
                        </h3>
                        <span className="text-[9px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">{tour.transport.transportType}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-[11px] mb-3">
                        <div>
                          <span className="text-gray-400 block font-semibold uppercase text-[8px] tracking-wider">Origin</span>
                          <span className="font-extrabold text-gray-800 text-xs">{tour.location?.fromLocation || "Delhi (DEL)"}</span>
                        </div>
                        <div className="text-center flex flex-col justify-center items-center">
                          <span className="text-[8px] font-mono font-black text-blue-500">{flightNum}</span>
                          <span className="text-xs text-blue-500 leading-none">➔</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-semibold uppercase text-[8px] tracking-wider">Destination</span>
                          <span className="font-extrabold text-gray-800 text-xs">{tour.location?.toLocation} ({tour.location?.country})</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 text-[10px] border-t pt-3 border-gray-100">
                        <div>
                          <span className="text-gray-400 block font-semibold uppercase text-[8px] tracking-wider">Carrier / Vehicle</span>
                          <span className="font-bold text-gray-800">{tour.transport.transportName}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-semibold uppercase text-[8px] tracking-wider">Boarding Date</span>
                          <span className="font-bold text-gray-800">{formatDate(tour.startDate)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-semibold uppercase text-[8px] tracking-wider">Gate</span>
                          <span className="font-mono font-bold text-blue-600 text-xs">{gate}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-semibold uppercase text-[8px] tracking-wider">Seat Number</span>
                          <span className="font-mono font-bold text-indigo-600 text-xs">{seat}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Section 3: Lodging / Hotel Voucher */}
                {tour.lodging && (
                  <div className="border border-gray-150 rounded-xl p-4 bg-gradient-to-r from-green-50/10 to-white flex justify-between gap-4 relative overflow-hidden">
                    <div className="flex-grow space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-[10px] font-black uppercase text-green-700 tracking-widest">🏨 Accommodation check-in folder</h3>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-amber-500 font-bold">★ {tour.lodging.rating || "5.0"}/5</span>
                          <span className="text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Reserved</span>
                        </div>
                      </div>
                      
                      <div className="text-[11px]">
                        <span className="text-gray-400 block font-semibold uppercase text-[8px] tracking-wider">Resort Stay</span>
                        <span className="font-extrabold text-gray-800 text-xs">{tour.lodging.lodgingName} ({tour.lodging.lodgingType})</span>
                        <span className="text-[10px] text-gray-500 block leading-tight mt-1">{tour.lodging.lodgingDescription}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-[10px] border-t pt-3 border-gray-100">
                        <div>
                          <span className="text-gray-400 block font-semibold uppercase text-[8px] tracking-wider">Check-In Date</span>
                          <span className="font-bold text-gray-800">{formatDate(tour.startDate)} (14:00)</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-semibold uppercase text-[8px] tracking-wider">Check-Out Date</span>
                          <span className="font-bold text-gray-800">{formatDate(tour.endDate)} (11:00)</span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-400 block font-semibold uppercase text-[8px] tracking-wider">Property Address</span>
                        <span className="font-bold text-gray-800 text-[10px]">{tour.lodging.address}</span>
                      </div>
                      
                      {/* Complimentary Amenities tags */}
                      <div className="flex gap-1.5 pt-1">
                        {["Free Wi-Fi", "Swimming Pool", "Complimentary Breakfast", "Spa Access"].map((amenity, index) => (
                          <span key={index} className="text-[8px] bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full font-bold">
                            ✓ {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* QR Code in Voucher */}
                    <div className="flex flex-col items-center justify-between border-l pl-4 border-gray-200 flex-shrink-0 text-center w-28">
                      <span className="text-[8px] uppercase font-bold text-green-700 tracking-wider block">Check-In QR</span>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=hotel_booking_${booking.bookingId}_lodging_${tour.lodging.id}`}
                        alt="Checkin QR"
                        className="w-18 h-18 my-1"
                      />
                      <span className="text-[7px] text-gray-400 leading-tight">Scan at hotel reception</span>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="border-t border-dashed pt-3 text-center text-gray-400">
                  <p className="text-[9px]">Please print this folder or keep a digital copy handy. Thank you for choosing TripNest!</p>
                  <p className="text-[9px] font-bold text-blue-500 mt-1">TripNest Vacations System • Digital Travel Folder</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Header />
      
      {/* Spacer to push down due to fixed header */}
      <div className="h-20"></div>

      <div className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <button
              onClick={() => navigate("/user/dashboard")}
              className="flex items-center text-sm font-medium hover:text-blue-600 transition-colors mb-2 group"
              style={{ color: "var(--text-secondary)" }}
            >
              <ArrowLeft className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              My Bookings
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            </h1>
            <p className="mt-1" style={{ color: "var(--text-secondary)" }}>Manage and view all your reserved travel experiences.</p>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Fetching your travel records...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl shadow-sm max-w-xl mx-auto text-center">
            <h3 className="text-red-800 font-bold text-lg mb-1">Unable to Load Data</h3>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md"
            >
              Reload Page
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100 max-w-2xl mx-auto mt-10">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Bookings Found</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You haven't booked any adventures yet. Start exploring the world with our handpicked tour packages!
            </p>
            <button
              onClick={() => navigate("/user/dashboard")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-colors"
            >
              Browse Tours
            </button>
          </div>
        ) : (
          /* Bookings List */
          <div className="space-y-6">
            {bookings.map((booking) => {
              const tour = booking.tour || {};
              const imageUrl = tour.tourImages && tour.tourImages.length > 0 ? tour.tourImages[0] : null;

              return (
                <div
                  key={booking.bookingId}
                  className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row group"
                  style={{ backgroundColor: "var(--bg-card)", border: `1px solid var(--border-color)` }}
                >
                  {/* Tour Image */}
                  <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden bg-gray-100 flex-shrink-0">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={tour.tourName}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-400 bg-gray-100">
                        No Image Available
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      {getStatusBadge(booking.paymentStatus)}
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <h2 className="text-2xl font-bold group-hover:text-blue-600 transition-colors" style={{ color: "var(--text-primary)" }}>
                            {tour.tourName || "Tour Experience"}
                          </h2>
                          <span className="text-[10px] text-gray-400 font-mono">
                            Booking ID: #{booking.bookingId}
                          </span>
                        </div>
                        <CountdownTimer startDate={tour.startDate} />
                      </div>
                      
                      <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                        {tour.tourDescription}
                      </p>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-gray-100 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">Travel Date</p>
                            <p className="text-sm font-medium text-gray-700">
                              {formatDate(tour.startDate)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Ticket className="w-5 h-5 text-purple-500" />
                          <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">Tickets</p>
                            <p className="text-sm font-medium text-gray-700">
                              {booking.numberOfTickets} Ticket{booking.numberOfTickets > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">Paid Amount</p>
                            <p className="text-sm font-bold text-green-600">
                              {formatPrice(booking.totalPrice)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-orange-500" />
                          <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase">Booked On</p>
                            <p className="text-sm font-medium text-gray-700">
                              {formatDate(booking.bookingDate)}
                            </p>
                          </div>
                      </div>
                    </div>

                      {/* Interactive Section Toggles */}
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => setExpandedSection(expandedSection === `timeline-${booking.bookingId}` ? null : `timeline-${booking.bookingId}`)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            expandedSection === `timeline-${booking.bookingId}`
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          📅 Journey Timeline
                        </button>
                        <button
                          onClick={() => setExpandedSection(expandedSection === `pack-${booking.bookingId}` ? null : `pack-${booking.bookingId}`)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            expandedSection === `pack-${booking.bookingId}`
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          🧳 Packing Checklist
                        </button>
                        <button
                          onClick={() => setExpandedSection(expandedSection === `weather-${booking.bookingId}` ? null : `weather-${booking.bookingId}`)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            expandedSection === `weather-${booking.bookingId}`
                              ? "bg-orange-500 text-white shadow-sm"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          🌤️ Destination Weather
                        </button>
                        <button
                          onClick={() => setExpandedSection(expandedSection === `docs-${booking.bookingId}` ? null : `docs-${booking.bookingId}`)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            expandedSection === `docs-${booking.bookingId}`
                              ? "bg-purple-600 text-white shadow-sm"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          💼 My Documents
                        </button>
                        <button
                          onClick={() => setExpandedSection(expandedSection === `rate-${booking.bookingId}` ? null : `rate-${booking.bookingId}`)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            expandedSection === `rate-${booking.bookingId}`
                              ? "bg-amber-500 text-white shadow-sm"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          ⭐ Rate Experience
                        </button>
                        <button
                          onClick={() => setExpandedSection(expandedSection === `map-${booking.bookingId}` ? null : `map-${booking.bookingId}`)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            expandedSection === `map-${booking.bookingId}`
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          🗺️ Travel Map
                        </button>
                        <button
                          onClick={() => setExpandedSection(expandedSection === `gallery-${booking.bookingId}` ? null : `gallery-${booking.bookingId}`)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            expandedSection === `gallery-${booking.bookingId}`
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          📸 Photo Memories
                        </button>
                        <button
                          onClick={() => setExpandedSection(expandedSection === `advisory-${booking.bookingId}` ? null : `advisory-${booking.bookingId}`)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            expandedSection === `advisory-${booking.bookingId}`
                              ? "bg-red-500 text-white shadow-sm"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          📢 Advisory
                        </button>
                      </div>

                      {/* Timeline Panel */}
                      {expandedSection === `timeline-${booking.bookingId}` && (
                        <div className="mt-3 p-4 bg-gray-50/50 border rounded-xl animate-fadeIn">
                          <h4 className="text-xs font-extrabold uppercase text-blue-600 tracking-wider mb-3">📅 Visual Day-by-Day Timeline</h4>
                          <div className="relative border-l border-blue-200 ml-2 pl-4 space-y-4 text-xs">
                            {getItineraryData(tour, booking.bookingId).map((item) => (
                              <div key={item.day} className="relative">
                                <span className="absolute -left-[22px] top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-blue-500 ring-4 ring-white"></span>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-gray-800">{item.title}</span>
                                    <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono font-bold">{item.date}</span>
                                  </div>
                                  <p className="text-gray-500 leading-normal">{item.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Destination Weather Forecast Panel */}
                      {expandedSection === `weather-${booking.bookingId}` && (
                        <div className="mt-3 p-4 bg-gray-50/50 border rounded-xl animate-fadeIn">
                          <h4 className="text-xs font-extrabold uppercase text-orange-500 tracking-wider mb-3 flex items-center gap-1.5">
                            <CloudSun className="w-4 h-4 animate-bounce" />
                            3-Day Forecast: {tour.location?.toLocation || tour.tourName}
                          </h4>
                          <div className="grid grid-cols-3 gap-3">
                            {getWeatherData(tour.location?.toLocation || tour.tourName).map((day) => (
                              <div key={day.dayName} className="bg-white border p-3 rounded-xl text-center shadow-sm flex flex-col items-center">
                                <p className="text-[9px] font-bold text-gray-400 uppercase">{day.dayName}</p>
                                <div className="my-1.5">{day.icon}</div>
                                <p className="text-xs font-black text-gray-700">{day.temp}°C</p>
                                <p className="text-[9px] font-semibold text-gray-500 mt-0.5">{day.condition}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Packing Checklist Panel */}
                      {expandedSection === `pack-${booking.bookingId}` && (
                        <div className="mt-3 p-4 bg-gray-50/50 border rounded-xl animate-fadeIn">
                          <h4 className="text-xs font-extrabold uppercase text-green-700 tracking-wider mb-2">🧳 Packing Planner & Checklist</h4>
                          <p className="text-[10px] text-gray-400 mb-3">Custom recommended gear based on your destination climate</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(() => {
                              const defaultItems = getPackingItems(tour.location?.toLocation || tour.tourName);
                              const items = checklistData[booking.bookingId] || defaultItems;
                              return items.map((item) => (
                                <label key={item.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-white p-2 rounded-lg border hover:bg-gray-50/80 transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={item.checked}
                                    onChange={() => handleToggleChecklistItem(booking.bookingId, item.id, defaultItems)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                                  />
                                  <span className={item.checked ? "line-through text-gray-400 font-medium" : "font-medium"}>
                                    {item.name}
                                  </span>
                                </label>
                              ));
                            })()}
                          </div>
                        </div>
                      )}

                      {/* My Documents Panel */}
                      {expandedSection === `docs-${booking.bookingId}` && (
                        <div className="mt-3 p-4 bg-gray-50/50 border rounded-xl animate-fadeIn space-y-3">
                          <h4 className="text-xs font-extrabold uppercase text-purple-600 tracking-wider mb-2 flex items-center gap-1.5">
                            <Ticket className="w-4 h-4" />
                            Digital Travel Locker
                          </h4>
                          <p className="text-[10px] text-gray-400 mb-2">Access your electronic check-in documents and tickets</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="bg-white border p-3 rounded-xl flex flex-col justify-between items-center text-center shadow-sm">
                              <span className="text-[9px] font-bold text-gray-400 uppercase">Resort Voucher</span>
                              <div className="my-2 bg-gray-100 p-2 rounded">
                                <span className="font-mono text-xs font-bold">QR_HOTEL_CHECKIN</span>
                              </div>
                              <button
                                onClick={() => toast.success("Opening Hotel Voucher. Standard QR scan is active on the print ticket!")}
                                className="w-full py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-[10px] font-bold"
                              >
                                View Voucher
                              </button>
                            </div>
                            <div className="bg-white border p-3 rounded-xl flex flex-col justify-between items-center text-center shadow-sm">
                              <span className="text-[9px] font-bold text-gray-400 uppercase">Flight Pass</span>
                              <div className="my-2 bg-gray-100 p-2 rounded">
                                <span className="font-mono text-xs font-bold">SEAT 14B / GATE A3</span>
                              </div>
                              <button
                                onClick={() => toast.success("Boarding pass is integrated in your ticket PDF download!")}
                                className="w-full py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-[10px] font-bold"
                              >
                                View Boarding Pass
                              </button>
                            </div>
                            <div className="bg-white border p-3 rounded-xl flex flex-col justify-between items-center text-center shadow-sm">
                              <span className="text-[9px] font-bold text-gray-400 uppercase">Travel Insurance</span>
                              <div className="my-2 bg-gray-100 p-2 rounded">
                                <span className="font-mono text-[9px] font-bold">POLICY: #TP-9824-X</span>
                              </div>
                              <button
                                onClick={() => toast.info("Travel insurance coverage up to $50,000 is active for this booking.")}
                                className="w-full py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-[10px] font-bold"
                              >
                                View Coverage
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Customer Rating & Review Panel */}
                      {expandedSection === `rate-${booking.bookingId}` && (
                        <div className="mt-3 p-4 bg-gray-50/50 border rounded-xl animate-fadeIn">
                          <h4 className="text-xs font-extrabold uppercase text-amber-500 tracking-wider mb-2 flex items-center gap-1.5">
                            ⭐ Tour Feedback & Reviews
                          </h4>
                          <p className="text-[10px] text-gray-400 mb-3">Tell us about your experience during this vacation</p>
                          
                          {/* If review exists, show it */}
                          {reviewsData[booking.bookingId] ? (
                            <div className="bg-white border p-3.5 rounded-xl shadow-sm">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span key={star} className={`text-sm ${star <= reviewsData[booking.bookingId].rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
                                ))}
                                <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold font-mono">
                                  {reviewsData[booking.bookingId].rating} / 5
                                </span>
                              </div>
                              <p className="text-xs text-gray-700 italic">"{reviewsData[booking.bookingId].text || "No written comments."}"</p>
                              <button
                                onClick={() => handleDeleteReview(booking.bookingId)}
                                className="mt-3 text-[9px] font-bold text-red-500 hover:text-red-700 uppercase"
                              >
                                Delete Review
                              </button>
                            </div>
                          ) : (
                            /* Else, show input form */
                            <div className="space-y-3 bg-white border p-3.5 rounded-xl shadow-sm">
                              <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">
                                  Rating
                                </label>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setTempRatings({ ...tempRatings, [booking.bookingId]: star })}
                                      className={`text-xl focus:outline-none transition-colors ${
                                        star <= (tempRatings[booking.bookingId] || 5) ? "text-amber-400" : "text-gray-200 hover:text-amber-300"
                                      }`}
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">
                                  Write Comments
                                </label>
                                <textarea
                                  value={tempTexts[booking.bookingId] || ""}
                                  onChange={(e) => setTempTexts({ ...tempTexts, [booking.bookingId]: e.target.value })}
                                  placeholder="How was the resort? Were the tour activities fun?"
                                  rows="2"
                                  className="w-full px-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                              </div>
                              <button
                                onClick={() => handleSaveReview(booking.bookingId)}
                                className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors"
                              >
                                Save Review
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Animated Journey Map Panel */}
                      {expandedSection === `map-${booking.bookingId}` && (
                        <div className="mt-3 p-4 bg-gray-50/50 dark:bg-slate-950/20 border dark:border-slate-800 rounded-xl animate-fadeIn space-y-6">
                          <div>
                            <h4 className="text-xs font-extrabold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider mb-1 flex items-center gap-1.5">
                              🗺️ Animated Journey Route Map & Sightseeing Explorer
                            </h4>
                            <p className="text-[10px] text-gray-400">Complete transit route schedule & interactive destination map</p>
                          </div>
                          
                          {/* Part 1: Transit Route Timeline */}
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-stretch gap-6 md:gap-4 pt-4 relative border-b pb-6 border-gray-200/50 dark:border-slate-800">
                            {/* Desktop Connecting Progress Line */}
                            <div className="hidden md:block absolute left-8 right-8 top-10 h-0.5 bg-gray-200 dark:bg-slate-800 z-0">
                              <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 w-full rounded animate-pulse"></div>
                            </div>

                            {/* Stop 1 */}
                            <div className="flex flex-row md:flex-col items-center md:items-center gap-3 md:gap-2 flex-1 z-10 relative">
                              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
                                <span className="text-sm">🛫</span>
                              </div>
                              <div className="text-left md:text-center space-y-0.5">
                                <span className="block text-[10px] font-bold text-gray-700 dark:text-slate-300">Delhi (Origin)</span>
                                <span className="block text-[9px] font-bold text-blue-500 dark:text-blue-400 font-mono">08:00 AM Departure</span>
                                <p className="text-[10px] text-gray-500 max-w-[150px]">Boarding & security check-in at IGI Airport.</p>
                              </div>
                            </div>

                            {/* Stop 2 */}
                            <div className="flex flex-row md:flex-col items-center md:items-center gap-3 md:gap-2 flex-1 z-10 relative">
                              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/50 border-2 border-indigo-500 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-sm">✈️</span>
                              </div>
                              <div className="text-left md:text-center space-y-0.5">
                                <span className="block text-[10px] font-bold text-gray-700 dark:text-slate-300">Transit Hub</span>
                                <span className="block text-[9px] font-bold text-indigo-500 dark:text-indigo-400 font-mono">In-Transit</span>
                                <p className="text-[10px] text-gray-500 max-w-[150px]">Premium airline flight path schedule.</p>
                              </div>
                            </div>

                            {/* Stop 3 */}
                            <div className="flex flex-row md:flex-col items-center md:items-center gap-3 md:gap-2 flex-1 z-10 relative">
                              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/50 border-2 border-purple-500 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-sm">🏨</span>
                              </div>
                              <div className="text-left md:text-center space-y-0.5">
                                <span className="block text-[10px] font-bold text-gray-700 dark:text-slate-300">Resort Check-In</span>
                                <span className="block text-[9px] font-bold text-purple-500 dark:text-purple-400 font-mono">02:00 PM Arrival</span>
                                <p className="text-[10px] text-gray-500 max-w-[150px]">Welcome drinks and room allotment at {tour.lodging?.lodgingName || "Resort Stay"}.</p>
                              </div>
                            </div>

                            {/* Stop 4 */}
                            <div className="flex flex-row md:flex-col items-center md:items-center gap-3 md:gap-2 flex-1 z-10 relative">
                              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-sm">🏄</span>
                              </div>
                              <div className="text-left md:text-center space-y-0.5">
                                <span className="block text-[10px] font-bold text-gray-700 dark:text-slate-300">Activities Spot</span>
                                <span className="block text-[9px] font-bold text-emerald-500 dark:text-emerald-400 font-mono">Day 2-3 Outings</span>
                                <p className="text-[10px] text-gray-500 max-w-[150px]">Local sightseeing and vacation outings in {tour.location?.toLocation || "Agra"}.</p>
                              </div>
                            </div>
                          </div>

                          {/* Part 2: Interactive Landmarks Mini-Map */}
                          {(() => {
                            const mapData = getInteractiveMapData(tour.location?.toLocation || tour.tourName);
                            const selectedLandmark = activeLandmarks[booking.bookingId] || mapData.landmarks[0];
                            const sim = simulationState[booking.bookingId];
                            return (
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <h5 className="text-[11px] font-extrabold uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                                    <Navigation className="w-3.5 h-3.5" />
                                    {mapData.title}
                                  </h5>
                                </div>

                                {/* Simulator Control Panel Dashboard */}
                                <div className="bg-slate-950 text-slate-100 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 border border-slate-800 shadow-md">
                                  <div className="space-y-1 text-center md:text-left flex-grow w-full">
                                    <div className="flex items-center justify-center md:justify-start gap-1.5">
                                      <span className="text-[8px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-black uppercase tracking-widest border border-indigo-500/30 flex items-center gap-1">
                                        <Compass className="w-2.5 h-2.5 animate-spin" />
                                        Transit simulator
                                      </span>
                                      {sim?.isPlaying && (
                                        <span className="flex h-2 w-2 relative">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                      )}
                                    </div>
                                    <h6 className="text-[11px] font-bold text-slate-200 mt-1 leading-snug">
                                      {sim?.statusMessage || "Simulate real-time vehicle movement across the map!"}
                                    </h6>
                                    {sim && (
                                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2 border border-slate-800">
                                        <div
                                          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-75"
                                          style={{ width: `${((sim.currentStopIndex + sim.progress / 100) / (mapData.landmarks.length - 1)) * 100}%` }}
                                        ></div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2 shrink-0 w-full md:w-auto justify-center">
                                    {!sim ? (
                                      <button
                                        onClick={() => triggerSimulation(booking.bookingId, mapData.landmarks)}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg text-[9px] uppercase tracking-wider transition-colors active:scale-95 shadow flex items-center gap-1"
                                      >
                                        <Play className="w-3 h-3 fill-white" />
                                        Launch Simulator
                                      </button>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => toggleSimulationPlay(booking.bookingId)}
                                          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-extrabold rounded-lg text-[9px] uppercase tracking-wider transition-colors active:scale-95 border border-slate-800 flex items-center gap-1"
                                        >
                                          {sim.isPlaying ? <Pause className="w-3 h-3 fill-slate-300" /> : <Play className="w-3 h-3 fill-slate-300" />}
                                          {sim.isPlaying ? "Pause" : "Resume"}
                                        </button>
                                        <button
                                          onClick={() => resetSimulation(booking.bookingId, mapData.landmarks)}
                                          className="px-3.5 py-2 bg-red-650 hover:bg-red-700 text-white font-extrabold rounded-lg text-[9px] uppercase tracking-wider transition-colors active:scale-95 flex items-center gap-1"
                                        >
                                          <RotateCcw className="w-3 h-3" />
                                          Reset
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {/* Map Canvas Box */}
                                  <div className={`relative h-48 md:col-span-2 rounded-xl border ${mapData.backdrop} overflow-hidden shadow-inner`}>
                                    {/* Grid background pattern */}
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                                    
                                    {/* Path Connector lines */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                                      <polyline
                                        points={mapData.landmarks.map(l => `${parseFloat(l.left) * 3.5} , ${parseFloat(l.top) * 1.5}`).join(" ")}
                                        fill="none"
                                        stroke="rgba(99, 102, 241, 0.6)"
                                        strokeWidth="2"
                                        strokeDasharray="4 4"
                                      />
                                    </svg>

                                    {/* Moving Vehicle Simulator */}
                                    {sim && (
                                      <div
                                        className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 border-2 border-white rounded-full flex items-center justify-center text-sm shadow-xl z-20 transition-all duration-75 animate-bounce"
                                        style={{ left: `${sim.x}%`, top: `${sim.y}%` }}
                                      >
                                        {tour.transport?.transportType?.toLowerCase()?.includes("flight") || tour.transport?.transportType?.toLowerCase()?.includes("air") ? "✈️" : "🚌"}
                                      </div>
                                    )}

                                    {/* Map markers */}
                                    {mapData.landmarks.map((l) => (
                                      <button
                                        key={l.id}
                                        onClick={() => setActiveLandmarks({ ...activeLandmarks, [booking.bookingId]: l })}
                                        className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md transition-all z-10 ${
                                          selectedLandmark?.id === l.id
                                            ? "bg-indigo-600 text-white ring-4 ring-indigo-200 scale-110"
                                            : "bg-white text-gray-700 hover:scale-105 border border-indigo-200"
                                        }`}
                                        style={{ top: l.top, left: l.left }}
                                        title={l.name}
                                      >
                                        {l.icon}
                                      </button>
                                    ))}
                                    <span className="absolute bottom-2 right-2 text-[8px] bg-white/60 dark:bg-black/60 px-1.5 py-0.5 rounded font-bold font-mono">TripNest Map Canvas</span>
                                  </div>

                                  {/* Landmark Details sidebar */}
                                  <div className="bg-white border rounded-xl p-3.5 flex flex-col justify-between shadow-sm">
                                    {selectedLandmark ? (
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-lg">{selectedLandmark.icon}</span>
                                          <h6 className="text-xs font-black text-gray-800">{selectedLandmark.name}</h6>
                                        </div>
                                        <p className="text-[10px] text-gray-500 leading-normal">{selectedLandmark.desc}</p>
                                        <span className="inline-block text-[8px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Sightseeing Hub</span>
                                      </div>
                                    ) : (
                                      <p className="text-[10px] text-gray-400 italic">Select a marker on the map to view tourist spot details.</p>
                                    )}
                                    <p className="text-[8px] text-gray-400 mt-2 border-t pt-2">Distance included in daily guide transit itinerary.</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Photo Memories & Gallery Panel */}
                      {expandedSection === `gallery-${booking.bookingId}` && (() => {
                        const presets = [
                          { name: "🏝️ Beach", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" },
                          { name: "🏔️ Alps", url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80" },
                          { name: "🏰 Palace", url: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80" },
                          { name: "🗼 Paris", url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80" },
                          { name: "🌲 Forest", url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80" }
                        ];

                        const activeMemories = scrapbooks[booking.bookingId] || [
                          {
                            id: 1,
                            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
                            caption: "Sunsets by the coast. Absolute bliss!",
                            day: "Day 1"
                          },
                          {
                            id: 2,
                            image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80",
                            caption: "Road trips and mountain ranges.",
                            day: "Day 2"
                          }
                        ];

                        const selectedPreset = newMemoryImage[booking.bookingId] || presets[0].url;

                        return (
                          <div className="mt-3 p-4 bg-gray-50/50 border dark:border-slate-800 rounded-xl animate-fadeIn space-y-5">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="text-xs font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                                  📸 Interactive Travel Scrapbook & Polaroid Journal
                                </h4>
                                <p className="text-[10px] text-gray-400">Save day-wise diary logs with polaroid snapshot mockups</p>
                              </div>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(`Hey! Check out my upcoming TripNest vacation itinerary to ${tour.location?.toLocation || tour.tourName}!`);
                                  toast.success("Itinerary share link copied to clipboard!");
                                }}
                                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-bold shadow-sm transition-colors"
                              >
                                Share Itinerary
                              </button>
                            </div>

                            {/* Diary Add Memory Board */}
                            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-4 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2 md:col-span-2">
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider">
                                  Write Polaroid Diary Entry
                                </label>
                                <textarea
                                  value={newMemoryCaption[booking.bookingId] || ""}
                                  onChange={(e) => setNewMemoryCaption({ ...newMemoryCaption, [booking.bookingId]: e.target.value })}
                                  placeholder="What was the highlight of your day? (e.g. Tried local food, paragliding adventure...)"
                                  rows="2"
                                  className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-slate-950 dark:border-slate-800"
                                />
                                
                                <div className="flex gap-4 items-center">
                                  <div className="flex-grow">
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">
                                      Select Day
                                    </label>
                                    <select
                                      value={newMemoryDay[booking.bookingId] || "Day 1"}
                                      onChange={(e) => setNewMemoryDay({ ...newMemoryDay, [booking.bookingId]: e.target.value })}
                                      className="w-full px-2.5 py-1 border rounded text-xs focus:outline-none dark:bg-slate-950 dark:border-slate-800"
                                    >
                                      {[...Array(tour.duration || 4)].map((_, i) => (
                                        <option key={i} value={`Day ${i + 1}`}>Day {i + 1}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="pt-4 shrink-0">
                                    <button
                                      onClick={() => handleAddMemory(booking.bookingId)}
                                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all active:scale-95 shadow"
                                    >
                                      📸 Add Memory
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Preset Image Picker */}
                              <div className="space-y-2">
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider">
                                  Select Photo Theme
                                </label>
                                <div className="grid grid-cols-5 gap-1">
                                  {presets.map((p, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => setNewMemoryImage({ ...newMemoryImage, [booking.bookingId]: p.url })}
                                      className={`relative aspect-square rounded-lg overflow-hidden border transition-all ${
                                        selectedPreset === p.url ? "ring-2 ring-emerald-500 scale-105 border-transparent" : "border-gray-200"
                                      }`}
                                      title={p.name}
                                    >
                                      <img src={p.url} className="object-cover w-full h-full" alt="Theme" />
                                    </button>
                                  ))}
                                </div>
                                <div className="border border-dashed p-1.5 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-slate-950 h-16">
                                  <img src={selectedPreset} className="object-cover h-full rounded shadow-sm" alt="Preview" />
                                </div>
                              </div>
                            </div>

                            {/* Polaroid Scrapbook Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
                              {activeMemories.map((mem, idx) => {
                                const rotation = 
                                  idx % 3 === 0 ? "-rotate-2" :
                                  idx % 3 === 1 ? "rotate-2" :
                                  "rotate-1";

                                return (
                                  <div
                                    key={mem.id}
                                    className={`relative bg-[#FDFBF7] dark:bg-slate-900 p-3 pb-6 border border-gray-200/60 dark:border-slate-800 shadow-xl rounded-sm transform ${rotation} hover:rotate-0 hover:scale-105 duration-300 hover:z-20 transition-all text-slate-800 dark:text-slate-100`}
                                  >
                                    {/* Masking Tape effect */}
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-yellow-100/40 border-dashed border-x border-yellow-200/50 rotate-3 backdrop-blur-[1px] select-none"></div>

                                    {/* Action button: delete */}
                                    <button
                                      onClick={() => handleDeleteMemory(booking.bookingId, mem.id)}
                                      className="absolute top-2 right-2 w-5 h-5 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] transition-colors z-20"
                                      title="Delete memory"
                                    >
                                      ✕
                                    </button>

                                    {/* Polaroid Image */}
                                    <div
                                      onClick={() => setZoomedImage(mem.image)}
                                      className="relative aspect-video overflow-hidden border border-gray-200/50 dark:border-slate-800 cursor-pointer shadow-inner mb-3 group"
                                    >
                                      <img
                                        src={mem.image}
                                        alt={mem.caption}
                                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                      />
                                      <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-0.5 rounded text-[8px] font-bold font-mono tracking-widest uppercase">
                                        {mem.day}
                                      </div>
                                    </div>

                                    {/* Captions font */}
                                    <div className="px-1 text-center">
                                      <p className="text-xs font-medium italic font-serif leading-relaxed line-clamp-2">
                                        "{mem.caption}"
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Travel Advisory Panel */}
                      {expandedSection === `advisory-${booking.bookingId}` && (
                        <div className="mt-3 p-4 bg-gray-50/50 dark:bg-slate-950/20 border dark:border-slate-800 rounded-xl animate-fadeIn space-y-3">
                          <h4 className="text-xs font-extrabold uppercase text-red-600 dark:text-red-400 tracking-wider mb-2 flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
                            Official Travel Advisory & Guidelines
                          </h4>
                          <p className="text-[10px] text-gray-400 mb-2">Important local regulations and packing warnings for your journey</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {getTravelAdvisory(tour.location?.toLocation || tour.tourName).map((adv, index) => (
                              <div key={index} className="bg-white border rounded-xl p-3 shadow-sm space-y-1.5 flex flex-col justify-start">
                                <span className="text-[9px] font-black text-gray-800 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                                  {adv.category}
                                </span>
                                <p className="text-[10px] text-gray-500 leading-normal">{adv.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Booking Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-5 mt-6">
                      <div className="text-xs text-gray-500">
                        {booking.paymentTransactionId && (
                          <span className="font-mono bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded text-[10px] text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-slate-700">
                            Txn ID: {booking.paymentTransactionId}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-2 w-full sm:w-auto">
                        {booking.paymentStatus === "SUCCESS" && (
                          <>
                            <button
                              onClick={() => downloadTicketPDF(booking)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Ticket PDF
                            </button>
                            <button
                              onClick={() => setActiveInvoice(booking)}
                              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              E-Invoice
                            </button>
                            <button
                              onClick={() => handleCancelBooking(booking.bookingId)}
                              className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Cancel Booking
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => navigate(`/user/tour/${tour.id}`)}
                          className="px-3 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-bold transition-all active:scale-95"
                        >
                          View Tour
                        </button>
                        <button
                          onClick={() => window.open(`https://api.whatsapp.com/send?phone=919006894885&text=Hello, I need help with booking ID #${booking.bookingId} for the tour: ${tour.tourName}`, "_blank")}
                          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Support
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
      <Chatbot />
      <CurrencyConverter />

      {/* Zoomed Image Modal Overlay */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
        >
          <div className="relative max-w-3xl w-full max-h-[85vh] rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border shadow-2xl p-1 cursor-default" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 flex items-center justify-center transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
            <img src={zoomedImage} alt="Zoomed view" className="w-full h-auto max-h-[80vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Active E-Invoice Modal Overlay */}
      {activeInvoice && (() => {
        const tour = activeInvoice.tour || {};
        const totalPrice = activeInvoice.totalPrice || 0;
        const basePrice = totalPrice / 1.18;
        const gst = totalPrice - basePrice;
        const total = totalPrice;
        return (
          <div
            onClick={() => setActiveInvoice(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
          >
            <div
              className="relative max-w-md w-full bg-white text-gray-800 rounded-2xl shadow-2xl overflow-hidden border p-6 space-y-5 cursor-default font-sans"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveInvoice(null)}
                className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-1.5 flex items-center justify-center transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>

              {/* Receipt Header */}
              <div className="text-center border-b pb-4 space-y-1">
                <span className="text-2xl font-black tracking-tight text-blue-600">TripNest</span>
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Official Electronic Receipt</p>
                <span className="inline-block text-[8px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                  Payment Status: PAID
                </span>
              </div>

              {/* Invoice Meta */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 border-b pb-4">
                <div>
                  <span className="block font-semibold">Booking ID:</span>
                  <span className="font-mono font-bold text-gray-700">#BK-{activeInvoice.bookingId}</span>
                </div>
                <div className="text-right">
                  <span className="block font-semibold">Transaction Date:</span>
                  <span className="font-bold text-gray-700">{new Date(activeInvoice.bookingDate).toLocaleDateString()}</span>
                </div>
                <div className="mt-1">
                  <span className="block font-semibold">Guest Name:</span>
                  <span className="font-bold text-gray-700">{userName}</span>
                </div>
                <div className="text-right mt-1">
                  <span className="block font-semibold">Payment Gateway:</span>
                  <span className="font-mono font-bold text-gray-700">Razorpay API</span>
                </div>
              </div>

              {/* Bill Details */}
              <div className="space-y-2 border-b pb-4 text-xs">
                <span className="block text-[9px] font-black uppercase text-gray-400 tracking-wider">Billing Items</span>
                <div className="flex justify-between items-center py-1">
                  <span className="font-semibold text-gray-700">{tour.tourName} ({tour.location?.toLocation})</span>
                  <span className="font-mono font-bold text-gray-800">{formatPrice(basePrice)}</span>
                </div>
                <div className="flex justify-between items-center py-1 text-[11px] text-gray-500">
                  <span>SGST + CGST (18%)</span>
                  <span className="font-mono">{formatPrice(gst)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 font-bold text-sm border-t border-dashed">
                  <span className="text-gray-800">Total Paid</span>
                  <span className="font-mono text-blue-600">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Mock Barcode & Footer */}
              <div className="text-center space-y-3">
                <div className="flex flex-col items-center gap-1">
                  {/* Styled Barcode Lines */}
                  <div className="flex items-stretch justify-center h-10 w-44 bg-white border border-gray-200 p-1 gap-[2px]">
                    {[2,1,3,1,2,4,1,2,3,1,4,2,1,3,2,1,4,1,3,2,4,1].map((w, idx) => (
                      <div key={idx} className="bg-black" style={{ width: `${w}px` }}></div>
                    ))}
                  </div>
                  <span className="font-mono text-[8px] text-gray-400">TXN_{activeInvoice.paymentTransactionId || "MOCK_TRANSACTION_ID"}</span>
                </div>
                <p className="text-[9px] text-gray-400 leading-normal">
                  Thank you for booking with TripNest Vacations. This is an electronically generated tax invoice and requires no physical signature.
                </p>
                <button
                  onClick={() => window.print()}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-md"
                >
                  Print E-Invoice
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Bookings;
