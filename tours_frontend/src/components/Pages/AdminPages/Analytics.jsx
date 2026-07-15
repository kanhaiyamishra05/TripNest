import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DollarSign, Ticket, ShoppingBag, ArrowLeft, Loader2, Sparkles, TrendingUp, BarChart2, Download } from "lucide-react";
import { Header, Footer } from "../../Reusable/Banner";
import { fetchAnalytics } from "../../../Redux/API/API";
import { useCurrency } from "../../../context/AppContext";

// ─── CSV Export Helper ────────────────────────────────────────────────────────
const exportAnalyticsCSV = (data) => {
  if (!data) return;

  const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const rows = [];
  rows.push(["TripNest Analytics Export"]);
  rows.push([`Generated on: ${now}`]);
  rows.push([]);

  // KPIs
  rows.push(["KEY PERFORMANCE INDICATORS"]);
  rows.push(["Metric", "Value"]);
  rows.push(["Total Revenue (USD)", data.totalRevenue ?? 0]);
  rows.push(["Total Bookings", data.totalBookings ?? 0]);
  rows.push(["Total Tickets Sold", data.totalTicketsSold ?? 0]);
  rows.push(["Active Coupons", data.totalCoupons ?? 0]);
  rows.push([]);

  // Monthly Revenue
  rows.push(["MONTHLY REVENUE BREAKDOWN"]);
  rows.push(["Month", "Revenue (USD)"]);
  if (data.monthlyRevenue) {
    Object.entries(data.monthlyRevenue).forEach(([month, val]) => {
      rows.push([month, val]);
    });
  }
  rows.push([]);

  // Popular Tours
  rows.push(["TOP POPULAR TOURS"]);
  rows.push(["Rank", "Tour Name", "Tickets Sold", "Revenue (USD)"]);
  if (data.popularTours && data.popularTours.length > 0) {
    data.popularTours.forEach((item, idx) => {
      rows.push([idx + 1, item.tourName, item.ticketsSold, item.revenue ?? 0]);
    });
  }

  // Build CSV string
  const csvContent = rows
    .map((row) =>
      row.map((cell) => {
        const str = String(cell ?? "").replace(/"/g, '""');
        return /[,"\n]/.test(str) ? `"${str}"` : str;
      }).join(",")
    )
    .join("\n");

  // Trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `TripNest_Analytics_${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ─── Component ────────────────────────────────────────────────────────────────
const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formatPrice, currency } = useCurrency();

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const response = await dispatch(fetchAnalytics()).unwrap();
        setData(response);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setError("Could not load analytics. Make sure the backend server is running.");
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [dispatch]);

  const handleExportCSV = () => {
    setExporting(true);
    try {
      exportAnalyticsCSV(data);
    } finally {
      setTimeout(() => setExporting(false), 800);
    }
  };

  // Calculate highest monthly revenue for graph scaling
  const maxMonthlyRevenue = data && data.monthlyRevenue
    ? Math.max(...Object.values(data.monthlyRevenue), 1)
    : 1;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header />
      <div className="h-20"></div>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {/* Back and title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2 group"
            >
              <ArrowLeft className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform" />
              Back to Admin Panel
            </button>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              Business Analytics
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            </h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1">Real-time statistics, monthly revenue trends, and popular packages.</p>
          </div>

          {/* ── Export CSV Button ── */}
          {data && !loading && (
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed self-start md:self-center"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">Crunching sales records...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 p-6 rounded-2xl text-center max-w-md mx-auto space-y-3">
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Revenue */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-sm space-y-4 relative overflow-hidden group">
                <div className="absolute right-4 bottom-4 opacity-15 transform group-hover:scale-110 transition-transform">
                  <DollarSign className="w-24 h-24" />
                </div>
                <p className="text-xs uppercase font-bold tracking-wider text-blue-100">Total Revenue</p>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black">{formatPrice(data.totalRevenue)}</h3>
                  <p className="text-[10px] text-blue-100 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> +14.2% from last month
                  </p>
                </div>
              </div>

              {/* Total Bookings */}
              <div className="bg-white dark:bg-slate-800 p-6 border dark:border-slate-700 rounded-2xl shadow-sm space-y-4 relative overflow-hidden group">
                <div className="absolute right-4 bottom-4 opacity-10 transform group-hover:scale-110 transition-transform text-blue-600">
                  <ShoppingBag className="w-24 h-24" />
                </div>
                <p className="text-xs uppercase font-bold tracking-wider text-gray-400 dark:text-slate-400">Total Bookings</p>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-gray-800 dark:text-white">{data.totalBookings}</h3>
                  <p className="text-[10px] text-green-600 dark:text-green-400">Confirmed orders</p>
                </div>
              </div>

              {/* Total Tickets Sold */}
              <div className="bg-white dark:bg-slate-800 p-6 border dark:border-slate-700 rounded-2xl shadow-sm space-y-4 relative overflow-hidden group">
                <div className="absolute right-4 bottom-4 opacity-10 transform group-hover:scale-110 transition-transform text-purple-600">
                  <Ticket className="w-24 h-24" />
                </div>
                <p className="text-xs uppercase font-bold tracking-wider text-gray-400 dark:text-slate-400">Tickets Sold</p>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-gray-800 dark:text-white">{data.totalTicketsSold}</h3>
                  <p className="text-[10px] text-purple-600 dark:text-purple-400">Total passenger seats</p>
                </div>
              </div>

              {/* Active Coupons */}
              <div className="bg-white dark:bg-slate-800 p-6 border dark:border-slate-700 rounded-2xl shadow-sm space-y-4 relative overflow-hidden group">
                <div className="absolute right-4 bottom-4 opacity-10 transform group-hover:scale-110 transition-transform text-yellow-600">
                  <BarChart2 className="w-24 h-24" />
                </div>
                <p className="text-xs uppercase font-bold tracking-wider text-gray-400 dark:text-slate-400">Active Coupons</p>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-gray-800 dark:text-white">{data.totalCoupons || 0}</h3>
                  <p className="text-[10px] text-yellow-600 dark:text-yellow-400">Promotions active</p>
                </div>
              </div>
            </div>

            {/* Graphs and Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Revenue Bar Chart */}
              <div className="bg-white dark:bg-slate-800 p-6 border dark:border-slate-700 rounded-2xl shadow-sm lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Monthly Sales Revenue</h3>
                  <span className="text-xs text-gray-400 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full font-medium">{currency}</span>
                </div>

                {/* Visual SVG / HTML Chart */}
                <div className="h-64 flex items-end justify-between gap-2 pt-6 border-b border-gray-100 dark:border-slate-700">
                  {Object.entries(data.monthlyRevenue || {}).map(([month, val]) => {
                    const pct = (val / maxMonthlyRevenue) * 100;
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center group h-full justify-end relative">
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-[calc(100%+8px)] bg-gray-900 dark:bg-slate-950 text-white text-xs px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-10">
                          {formatPrice(val)}
                        </div>
                        {/* Bar */}
                        <div
                          style={{ height: `${Math.max(pct, 5)}%` }}
                          className="w-full sm:w-10 bg-blue-500 rounded-t-lg group-hover:bg-blue-600 transition-all duration-300 shadow-sm"
                        ></div>
                        {/* Label */}
                        <span className="text-[10px] text-gray-500 dark:text-slate-400 mt-2 font-medium truncate max-w-full">
                          {month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* popular package stats */}
              <div className="bg-white dark:bg-slate-800 p-6 border dark:border-slate-700 rounded-2xl shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Popular Destinations</h3>

                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                  {data.popularTours && data.popularTours.length > 0 ? (
                    data.popularTours.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b dark:border-slate-700 pb-3 last:border-b-0 last:pb-0">
                        <div className="space-y-1">
                          <p className="font-bold text-sm text-gray-800 dark:text-white line-clamp-1">{item.tourName}</p>
                          <p className="text-[10px] text-gray-400 dark:text-slate-400 uppercase font-bold">{item.ticketsSold} Tickets Sold</p>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-sm text-blue-600 dark:text-blue-400">{formatPrice(item.revenue)}</p>
                          <span className="text-[9px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                            Top #{idx + 1}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-slate-400 py-8 text-center">No sales data recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminAnalytics;
