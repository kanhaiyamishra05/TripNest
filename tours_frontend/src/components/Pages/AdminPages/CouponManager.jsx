import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowLeft, Loader2, Sparkles, Tag, Percent } from "lucide-react";
import { Header, Footer } from "../../Reusable/Banner";
import { fetchCoupons, createCoupon, deleteCoupon } from "../../../Redux/API/API";
import { toast } from "sonner";

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [code, setCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(15);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await dispatch(fetchCoupons()).unwrap();
      setCoupons(response || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
      toast.error(err?.message || "Failed to load coupons");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [dispatch]);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    const cleanCode = code.trim().toUpperCase();
    if (discountPercentage < 1 || discountPercentage > 100) {
      toast.error("Discount percentage must be between 1 and 100");
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(createCoupon({ code: cleanCode, discountPercentage })).unwrap();
      toast.success("Coupon created successfully!");
      setCode("");
      setDiscountPercentage(15);
      loadCoupons();
    } catch (err) {
      toast.error(err?.message || "Failed to create coupon. Code might already exist.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this coupon code?");
    if (!confirmDelete) return;

    try {
      await dispatch(deleteCoupon(couponId)).unwrap();
      toast.success("Coupon deleted successfully!");
      loadCoupons();
    } catch (err) {
      toast.error(err?.message || "Failed to delete coupon");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="h-20"></div>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors mb-2 group"
            >
              <ArrowLeft className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform" />
              Back to Admin Panel
            </button>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              Discount Coupons
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            </h1>
            <p className="text-gray-500 mt-1">Manage promotional discount codes and active checkout campaigns.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Create Coupon Column */}
          <div className="bg-white p-6 border rounded-2xl shadow-sm h-fit space-y-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" />
              Create Promo Code
            </h3>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Coupon Code
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    <Tag className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. SUMMER25"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="block w-full pl-9 border-gray-300 rounded-lg text-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 uppercase"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Discount Percentage
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    <Percent className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="15"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                    className="block w-full pl-9 border-gray-300 rounded-lg text-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:bg-gray-400 flex items-center justify-center gap-1.5 shadow-sm"
              >
                {submitting ? "Creating..." : "Generate Coupon"}
              </button>
            </form>
          </div>

          {/* Coupon List Column */}
          <div className="bg-white p-6 border rounded-2xl shadow-sm md:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-gray-800">Active Coupons</h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-gray-400 text-xs">Fetching coupons...</p>
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Tag className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-gray-500 font-medium text-sm">No active coupons available.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                      <th className="pb-3">Code</th>
                      <th className="pb-3">Discount</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon) => (
                      <tr key={coupon.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                        <td className="py-3.5 font-mono font-bold text-gray-800 tracking-wider">
                          {coupon.code}
                        </td>
                        <td className="py-3.5 font-medium text-gray-600">
                          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md border border-green-200">
                            {coupon.discountPercentage}% Off
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors rounded hover:bg-red-50"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CouponManager;
