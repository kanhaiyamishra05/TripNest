import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { bookDetails } from "../../../Redux/API/API";
import { Header, Footer } from "../../Reusable/Banner";
import { useCurrency } from "../../../context/AppContext";
import { ArrowLeft, Ticket, Calendar, DollarSign, User } from "lucide-react";

const TourBookingComponent = () => {
  // State management for tour details
  const [tourDetails, setTourDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tourId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchTourDetails = async () => {
      try {
        const response = await dispatch(bookDetails(tourId));
        setTourDetails(response.payload.data.details);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch ticket summary");
        setLoading(false);
      }
    };

    fetchTourDetails();
  }, [tourId, dispatch]);

  // Render loading state
  if (loading) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-xl font-semibold text-gray-700 dark:text-slate-300">
          Loading Tour Details...
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-red-600 font-bold">{error}</div>
      </div>
    );
  }

  // Render tour details
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header />
      <div className="h-20"></div>

      <div className="container mx-auto px-4 py-8 flex-grow max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-semibold text-gray-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tickets summary
        </button>

        {/* Tour Information Section */}
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6 mb-6 border border-gray-100 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {tourDetails.tourName}
          </h1>
          <p className="text-gray-600 dark:text-slate-300 mb-4 text-sm">
            {tourDetails.tourDescription}
          </p>
          <div className="flex justify-between items-center border-t border-gray-100 dark:border-slate-700 pt-4">
            <span className="font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1.5 text-sm">
              <Ticket className="w-4 h-4 text-purple-500" /> Total Tickets Sold (Success):
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
              {tourDetails.ticketsSold}
            </span>
          </div>
        </div>

        {/* Bookings List Section */}
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Bookings list</h2>
        {tourDetails.bookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-md rounded-xl p-8 text-center text-gray-500 dark:text-slate-400">
            No bookings recorded for this tour yet.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
                  <tr>
                    {[
                      "Booking ID",
                      "Customer Name",
                      "Email",
                      "Tickets",
                      "Total Price",
                      "Booking Date",
                      "Payment Status",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-300 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {tourDetails.bookings.map((booking) => (
                    <tr key={booking.bookingId} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300">
                        #{booking.bookingId}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" /> {booking.customerName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300">
                        {booking.customerEmail}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300 font-medium">
                        {booking.numberOfTickets}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-purple-600 dark:text-purple-400">
                        {formatPrice(booking.totalPrice)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" /> {new Date(booking.bookingDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`
                            px-2.5 py-1 text-xs font-bold rounded-full
                            ${
                              booking.paymentStatus === "SUCCESS"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                            }
                          `}
                        >
                          {booking.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TourBookingComponent;
