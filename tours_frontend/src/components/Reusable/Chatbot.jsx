import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { userBookings } from "../../Redux/API/API";
import { jwtDecode } from "jwt-decode";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [userName, setUserName] = useState("Traveler");
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    // Load bookings and user info once on mount
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.name) setUserName(decoded.name.split(" ")[0]);
        
        dispatch(userBookings())
          .unwrap()
          .then((res) => {
            setBookings(res.bookings || []);
          })
          .catch((err) => console.log("Chatbot bookings fetch failed", err));
      } catch (e) {
        console.error(e);
      }
    }
  }, [dispatch]);

  useEffect(() => {
    // Initial welcome message (preserves history if already populated)
    setMessages((prev) => {
      if (prev.length > 0) return prev;
      return [
        {
          id: 1,
          sender: "bot",
          text: `Hello ${userName}! 👋 I'm your TripNest Travel Companion. You can type any question about your tours, destinations, hotels, flights, or cancellation policies here!`,
        },
      ];
    });
  }, [userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsTyping(true);

    // Simulate bot response after short delay
    setTimeout(() => {
      let botResponse = "";
      const query = text.toLowerCase().trim();

      // Greetings
      if (query === "hi" || query === "hello" || query === "hey" || query.includes("good morning") || query.includes("good afternoon")) {
        botResponse = `Hello there! How can I assist you with your travels today? You can ask me about tours like Bali, Manali, Paris, or queries about hotel and flight tickets!`;
      }
      // Destinations
      else if (query.includes("bali")) {
        botResponse = "🌴 **Bali (Indonesia):** A stunning tropical destination famous for sandy beaches, cultural temples, volcano treks, and luxury villas. Best package starts at $999. Inclusions: Hotel beach resort, flights, and snorkeling activity.";
      } else if (query.includes("manali")) {
        botResponse = "🏔️ **Manali (Himachal Pradesh):** A gorgeous mountain valley in India. Famous for snow points, Rohtang Pass, paragliding, and cozy wooden cottages. Best time to visit is Oct-Mar. Inclusions: 3-Star cottage, local transit, and bonfire dinners.";
      } else if (query.includes("paris")) {
        botResponse = "🗼 **Paris (France):** The global center of art, fashion, and romance. Famous for Eiffel Tower tours, Seine River cruises, and Louvre Museum visits. Packages start at $1499.";
      } else if (query.includes("taj mahal") || query.includes("agra") || query.includes("tajmahal")) {
        botResponse = "🕌 **Taj Mahal (Agra, India):** One of the 7 Wonders of the World! Famous for its stunning white marble architecture, Mughal gardens, and deep historical romance. Highly recommended for couples.";
      } else if (query.includes("swiss") || query.includes("alps")) {
        botResponse = "❄️ **Swiss Alps (Switzerland):** Spectacular snow peaks, cable car journeys, ski resorts, and alpine scenery. Perfect for luxury honeymoons and winter sports.";
      }
      // Inclusions & Bookings
      else if (query.includes("hotel") || query.includes("lodging") || query.includes("resort") || query.includes("stay") || query.includes("room") || query.includes("कमरा") || query.includes("होटल")) {
        botResponse = "🏨 **Lodging Support:** All packages include handpicked premium stays (3-Star to 5-Star). Your checked-in hotel address and a scanable check-in QR code are printed directly on your ticket PDF! Go to the 'My Bookings' tab to download it.";
      } else if (query.includes("flight") || query.includes("transport") || query.includes("cab") || query.includes("transit") || query.includes("train") || query.includes("bus") || query.includes("गाड़ी") || query.includes("फ्लाइट")) {
        botResponse = "✈️ **Transport Support:** Travel transit is fully integrated. We handle airline boarding details, vehicle transfers, and timing routes. Check the 'Transport & Transit' section on your ticket folder.";
      } else if (query.includes("food") || query.includes("meal") || query.includes("breakfast") || query.includes("dinner") || query.includes("khana") || query.includes("खाना")) {
        botResponse = "🍽️ **Meals:** Daily breakfast at the hotel is 100% complimentary in all tours. Some luxury packages also include local buffet dinners. Check inclusions under your tour details page!";
      } else if (query.includes("price") || query.includes("cost") || query.includes("pay") || query.includes("money") || query.includes("bill") || query.includes("charge") || query.includes("किराया") || query.includes("प्राइस")) {
        botResponse = "💳 **Payments:** Payments are processed securely via Razorpay. We accept all major Credit/Debit Cards, UPI, Netbanking, and Wallets.";
      }
      // Cancellation & Refund
      else if (query.includes("cancel") || query.includes("delete") || query.includes("radd") || query.includes("cancle") || query.includes("रद्द") || query.includes("कैंसिल")) {
        botResponse = "❌ **Cancellation Policy:** You can cancel your trip directly from your 'My Bookings' dashboard. Cancellations made 48 hours prior to departure receive a **100% Refund**. Under 48 hours, a 15% cancellation fee applies.";
      } else if (query.includes("refund") || query.includes("paisa") || query.includes("paise") || query.includes("rupay") || query.includes("rupee") || query.includes("वापस") || query.includes("पैसे")) {
        botResponse = "💰 **Refund Timeline:** Once cancelled, refunds are instantly triggered back to your source account (Razorpay) and will reflect in your bank account in **5 to 7 business days**.";
      }
      // My booking status
      else if (query.includes("booking") || query.includes("status") || query.includes("trip") || query.includes("ticket") || query.includes("my booking") || query.includes("my status") || query.includes("my trip") || query.includes("my ticket") || query.includes("बुकिंग") || query.includes("टिकट")) {
        if (bookings.length === 0) {
          botResponse = "You do not have any active bookings at the moment. Explore our latest destinations on the home dashboard to reserve your next trip!";
        } else {
          const active = bookings[0];
          botResponse = `🔍 **Booking Status Found:**\nTour: **${active.tour?.tourName}**\nDestination: **${active.tour?.location?.toLocation}**\nDate: **${new Date(active.tour?.startDate).toLocaleDateString()}**\nStatus: **Confirmed (Payment Success)**!`;
        }
      }
      // Support / WhatsApp / Human
      else if (query.includes("support") || query.includes("human") || query.includes("agent") || query.includes("help") || query.includes("contact") || query.includes("whatsapp") || query.includes("number") || query.includes("मदद") || query.includes("सपोर्ट")) {
        botResponse = "💬 Sure! For customized tour adjustments, booking modifications, or custom queries, you can connect directly with our Support Executive on WhatsApp! Click the **WhatsApp Chat** button below.";
      }
      // Fallback
      else {
        botResponse = `I'm not fully sure about "${text}". But I can help you check booking status, cancellation policies, weather details, and info on Bali, Manali, Paris, or Taj Mahal! \n\nFor custom inquiries, please connect directly to our agent on WhatsApp using the button below.`;
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "bot", text: botResponse },
      ]);
      setIsTyping(false);
    }, 700);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const openWhatsApp = () => {
    window.open(
      "https://api.whatsapp.com/send?phone=919006894885&text=Hello%20TripNest%20Support,%20I%20need%20help%20with%20my%20tour%20booking.",
      "_blank"
    );
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full px-5 py-3.5 shadow-2xl flex items-center gap-2.5 transition-all duration-300 transform hover:scale-105 active:scale-95 group relative"
          style={{
            boxShadow: "0 10px 30px -5px rgba(79, 70, 229, 0.4)",
          }}
          title="Open TripNest AI Assistant"
        >
          {/* Pulse Glow Effect Ring */}
          <span className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping group-hover:animate-none opacity-75"></span>
          
          <Bot className="w-5 h-5 text-white animate-pulse" />
          <span className="text-xs font-bold tracking-wide uppercase select-none">Ask TripNest AI</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-fadeIn"
          style={{
            width: "330px",
            height: "460px",
            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* Chat Header */}
          <div className="bg-blue-600 px-4 py-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">TripNest AI Companion</h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                  <span className="text-[10px] text-blue-100 font-medium">Virtual Assistant</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg flex-shrink-0 flex items-center justify-center h-7 w-7 ${
                    msg.sender === "user" ? "bg-blue-100 text-blue-600" : "bg-white text-gray-500 border border-gray-200"
                  }`}
                >
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-blue-500" />}
                </div>
                <div
                  className={`rounded-2xl px-3 py-2 text-xs leading-normal shadow-sm ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white text-gray-700 rounded-tl-none border border-gray-100"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 max-w-[80%] mr-auto">
                <div className="p-1.5 rounded-lg flex-shrink-0 flex items-center justify-center h-7 w-7 bg-white text-gray-500 border border-gray-200">
                  <Bot className="w-4 h-4 text-blue-500" />
                </div>
                <div className="rounded-2xl rounded-tl-none px-3 py-2 bg-white text-gray-400 border border-gray-100 flex items-center gap-1 text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>AI typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sticky WhatsApp Redirect Banner */}
          <div className="bg-green-50 border-t border-green-100 px-4 py-2 flex items-center justify-between">
            <span className="text-[10px] text-green-700 font-semibold">Need Human Support?</span>
            <button
              onClick={openWhatsApp}
              className="bg-[#25D366] hover:bg-[#128C7E] text-white px-2.5 py-1 rounded-full text-[9px] font-bold flex items-center gap-1 transition-colors shadow-sm"
            >
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M12.012 2c-5.506 0-9.988 4.479-9.988 9.984 0 1.76.459 3.479 1.332 5.006L2 22l5.163-1.354c1.472.802 3.125 1.222 4.819 1.222 5.508 0 9.99-4.479 9.99-9.984 0-5.508-4.482-9.984-9.96-9.984zm6.657 14.168c-.273.768-1.357 1.39-1.859 1.488-.387.078-.891.139-1.428-.035-.335-.111-.77-.258-2.316-.922-2.187-.932-3.606-3.156-3.717-3.303-.109-.148-.896-1.191-.896-2.279 0-1.088.568-1.625.77-1.839.2-.215.438-.268.583-.268l.42-.008c.119.002.277-.045.433.326.162.385.556 1.357.604 1.455.049.098.082.213.016.342-.066.131-.098.215-.2.326-.098.115-.209.256-.299.344-.102.102-.209.213-.092.414.117.2.521.859 1.119 1.391.77.684 1.42.896 1.621.996.2.1.32.084.441-.053.119-.137.518-.602.656-.807.139-.205.275-.172.465-.102.191.07.121.082 1.408.723.129.066.215.098.277.201.066.098.066.574-.207 1.34z"/>
              </svg>
              WhatsApp Support
            </button>
          </div>

          {/* Chat Open Message Input Footer */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about tours..."
              className="flex-grow border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={() => handleSend()}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-2.5 flex items-center justify-center transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
