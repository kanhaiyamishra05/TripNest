import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { allTickets } from "../../../Redux/API/API";
import { Header, Footer } from "../../Reusable/Banner";
import { useCurrency } from "../../../context/AppContext";

const TicketSummaryComponent = () => {
  // State management for ticket summary
  const [ticketSummary, setTicketSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchTicketSummary = async () => {
      try {
        const response = await dispatch(allTickets());
        setTicketSummary(response.payload.data.summary);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch ticket summary");
        setLoading(false);
      }
    };

    fetchTicketSummary();
  }, [dispatch]);

  // Render loading state
  if (loading) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="text-xl font-semibold" style={{ color: "var(--text-secondary)" }}>
          Loading Ticket Summary...
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="font-bold text-red-600">{error}</div>
      </div>
    );
  }

  // Calculate total metrics
  const totalTicketsSold = ticketSummary.reduce(
    (sum, tour) => sum + tour.ticketsSold,
    0
  );
  const totalTicketsCancelled = ticketSummary.reduce(
    (sum, tour) => sum + (tour.ticketsCancelled || 0),
    0
  );
  const totalTicketsAvailable = ticketSummary.reduce(
    (sum, tour) => sum + tour.ticketsAvailable,
    0
  );
  const totalRevenue = ticketSummary.reduce(
    (sum, tour) => sum + tour.totalRevenue,
    0
  );

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header />
      <div className="h-20"></div>

      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* Overall Summary Section */}
        <div className="shadow-md rounded-lg p-6 mb-6 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Ticket Summary Overview
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
              <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Total Tickets Sold
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalTicketsSold}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
              <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
                Total Cancelled Tickets
              </h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {totalTicketsCancelled}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-100 dark:border-green-900/30">
              <h3 className="text-sm font-medium text-green-600 dark:text-green-400">
                Total Tickets Available
              </h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {totalTicketsAvailable}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-100 dark:border-purple-900/30">
              <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Revenue</h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatPrice(totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Tour Summary Table */}
        <div className="shadow-md rounded-lg overflow-hidden border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <table className="w-full">
            <thead className="border-b" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}>
              <tr>
                {[
                  "Tour ID",
                  "Tour Name",
                  "Tickets Sold (Success)",
                  "Tickets Cancelled",
                  "Tickets Available",
                  "Total Revenue",
                  "Bookings",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
              {ticketSummary.map((tour) => (
                <tr key={tour.tourId} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: "var(--text-secondary)" }}>
                    {tour.tourId}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {tour.tourName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-full text-xs font-medium">
                      {tour.ticketsSold}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 px-2.5 py-1 rounded-full text-xs font-medium">
                      {tour.ticketsCancelled || 0}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`
                        px-2.5 py-1 rounded-full text-xs font-medium
                        ${
                          tour.ticketsAvailable === 0
                            ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300"
                            : "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300"
                        }
                      `}
                    >
                      {tour.ticketsAvailable}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-purple-600 dark:text-purple-400">
                    {formatPrice(tour.totalRevenue)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => navigate(`/admin/book/${tour.tourId}`)}
                      className="px-3 py-1.5 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-300 text-xs font-semibold"
                    >
                      Booking Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TicketSummaryComponent;
