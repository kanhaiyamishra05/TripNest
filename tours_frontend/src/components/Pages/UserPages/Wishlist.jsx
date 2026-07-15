import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, Loader2, MapPin } from "lucide-react";
import { Header, Footer } from "../../Reusable/Banner";
import { fetchWishlist, toggleWishlist } from "../../../Redux/API/API";
import { toast } from "sonner";
import { useCurrency } from "../../../context/AppContext";

const Wishlist = () => {
  const [wishlistTours, setWishlistTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const getWishlistTours = async () => {
    try {
      setLoading(true);
      const response = await dispatch(fetchWishlist()).unwrap();
      setWishlistTours(response || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError("Failed to load your wishlist. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    getWishlistTours();
  }, [dispatch]);

  const handleRemove = async (e, tourId) => {
    e.stopPropagation();
    try {
      const response = await dispatch(toggleWishlist(tourId)).unwrap();
      toast.success(response.message);
      window.dispatchEvent(new Event("wishlistUpdated"));
      getWishlistTours();
    } catch (err) {
      toast.error(err?.message || "Failed to remove from wishlist");
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header />

      {/* Spacer to push down due to fixed header */}
      <div className="h-20"></div>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <button
          onClick={() => navigate("/user/dashboard")}
          className="mb-6 flex items-center transition-colors hover:text-blue-500"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center space-x-3 mb-8">
          <Heart className="w-8 h-8 text-red-500 fill-red-500 animate-pulse" />
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            My Saved Tours
          </h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Loading wishlist...</p>
          </div>
        ) : error ? (
          <div className="border p-4 rounded-xl text-center max-w-md mx-auto" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
            {error}
          </div>
        ) : wishlistTours.length === 0 ? (
          <div className="rounded-2xl p-12 text-center shadow-sm border max-w-lg mx-auto space-y-4" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
            <Heart className="w-16 h-16 text-gray-300 mx-auto" />
            <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Your wishlist is empty</h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Discover amazing destinations and save them here for quick booking.
            </p>
            <button
              onClick={() => navigate("/user/dashboard")}
              className="px-6 py-2 bg-blue-500 text-white rounded-xl font-medium text-sm hover:bg-blue-600 transition-colors"
            >
              Explore Tours
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistTours.map((tour) => (
              <div
                key={tour.id}
                onClick={() => navigate(`/user/tour/${tour.id}`)}
                className="rounded-2xl shadow-sm hover:shadow-md overflow-hidden cursor-pointer transition-all duration-200 relative group border animate-fadeIn"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
              >
                {/* Remove heart button */}
                <button
                  onClick={(e) => handleRemove(e, tour.id)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-red-500 shadow-sm border border-gray-100 transition-all"
                  title="Remove from saved"
                >
                  <Heart className="w-5 h-5 fill-red-500" />
                </button>

                <div className="aspect-video bg-gray-100 relative">
                  {tour.tourImages && tour.tourImages.length > 0 ? (
                    <img
                      src={tour.tourImages[0]}
                      alt={tour.tourName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: "var(--text-muted)" }}>
                      No Images Available
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg line-clamp-1" style={{ color: "var(--text-primary)" }}>
                      {tour.tourName}
                    </h3>
                    <div className="flex items-center text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                      <MapPin className="w-3.5 h-3.5 mr-1 text-red-500" />
                      <span>
                        {tour.location?.fromLocation} to {tour.location?.toLocation}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                    {tour.tourDescription}
                  </p>

                  <div className="flex justify-between items-center border-t pt-3 mt-4" style={{ borderColor: "var(--border-color)" }}>
                    <span className="text-blue-600 font-bold text-md">{formatPrice(tour.price)}</span>
                    <span className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: "var(--badge-bg)", color: "var(--text-muted)" }}>
                      {tour.ticketsAvailable} left
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
