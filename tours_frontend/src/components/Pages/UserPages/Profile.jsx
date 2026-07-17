import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getUserProfile, updateUserProfile, changeUserPassword } from "../../../Redux/API/API";
import { Header, Footer } from "../../Reusable/Banner";
import { toast } from "sonner";
import { User, Mail, Phone, BookOpen, Utensils, Home, ShieldAlert, Check, Loader2 } from "lucide-react";

const Profile = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    contactNumber: "",
    passportNumber: "",
    preferredMeal: "Veg",
    address: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    passwordSet: false
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await dispatch(getUserProfile()).unwrap();
        if (response) {
          setProfile({
            name: response.name || "",
            email: response.email || "",
            contactNumber: response.contactNumber || "",
            passportNumber: response.passportNumber || "",
            preferredMeal: response.preferredMeal || "Veg",
            address: response.address || "",
            emergencyContactName: response.emergencyContactName || "",
            emergencyContactNumber: response.emergencyContactNumber || "",
            passwordSet: response.passwordSet || false
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to load profile details", error);
        toast.error("Failed to load profile details");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dispatch(updateUserProfile(profile)).unwrap();
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to save profile", error);
      toast.error("Failed to save profile details");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 5) {
      toast.error("Password must be at least 5 characters long!");
      return;
    }
    setChangingPassword(true);
    try {
      await dispatch(changeUserPassword(newPassword)).unwrap();
      toast.success("Password updated successfully!");
      setNewPassword("");
      setProfile(prev => ({ ...prev, passwordSet: true }));
    } catch (error) {
      console.error("Failed to update password", error);
      toast.error(typeof error === "string" ? error : "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleInputChange = (field, val) => {
    setProfile(prev => ({
      ...prev,
      [field]: val
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <span className="text-sm font-semibold text-gray-500">Loading profile data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-all duration-300">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-28 max-w-4xl">
        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-gray-100 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300">
          
          {/* Cover Header decoration */}
          <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-650 to-purple-650 relative flex items-end px-8 pb-6">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="absolute top-4 right-4 bg-white/10 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10">
              Verified Account
            </div>
            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-950 shadow-2xl border-4 border-white/85 dark:border-slate-900/85 flex items-center justify-center translate-y-12 transition-transform duration-300 hover:scale-[1.03]">
              <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="pt-16 px-6 md:px-10 pb-10">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Traveler Profile</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage your identity, travel documents, dining choices, and emergency details to experience faster checkouts.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Group 1: Identity & Account */}
              <div className="bg-gray-50/50 dark:bg-slate-950/30 border border-gray-100 dark:border-slate-850 rounded-3xl p-5 md:p-6 border-l-4 border-l-blue-500 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-800 dark:text-gray-205">Account Details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profile.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={profile.email}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-100 dark:bg-slate-900 text-gray-400 dark:text-slate-500 cursor-not-allowed text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Enter 10-digit number"
                      pattern="[0-9]{10}"
                      value={profile.contactNumber}
                      onChange={(e) => handleInputChange("contactNumber", e.target.value.replace(/\D/g, ""))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Travel Details */}
              <div className="bg-gray-50/50 dark:bg-slate-950/30 border border-gray-100 dark:border-slate-850 rounded-3xl p-5 md:p-6 border-l-4 border-l-indigo-500 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-800 dark:text-gray-205">Travel Settings</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Passport Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Z9999999"
                      value={profile.passportNumber}
                      onChange={(e) => handleInputChange("passportNumber", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Preferred Meal Choice
                    </label>
                    <select
                      value={profile.preferredMeal}
                      onChange={(e) => handleInputChange("preferredMeal", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-semibold"
                    >
                      <option value="Veg">Vegetarian (Veg)</option>
                      <option value="Non-Veg">Non-Vegetarian (Non-Veg)</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Gluten-Free">Gluten-Free</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Traveler Home Address
                    </label>
                    <input
                      type="text"
                      placeholder="Street name, City, State, Country"
                      value={profile.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Group 3: Emergency contact */}
              <div className="bg-gray-50/50 dark:bg-slate-950/30 border border-gray-100 dark:border-slate-850 rounded-3xl p-5 md:p-6 border-l-4 border-l-rose-500 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldAlert className="w-4 h-4 text-rose-550" />
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-800 dark:text-gray-205">Emergency Contacts</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Emergency Contact Person
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={profile.emergencyContactName}
                      onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Emergency Contact Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit phone number"
                      pattern="[0-9]{10}"
                      value={profile.emergencyContactNumber}
                      onChange={(e) => handleInputChange("emergencyContactNumber", e.target.value.replace(/\D/g, ""))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-650 hover:from-blue-700 hover:to-violet-755 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Profile Details
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Security / Password Card */}
        <div className="mt-8 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-gray-100 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300">
          <div className="p-6 md:p-10">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-indigo-555 dark:text-indigo-400" />
              <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                {profile.passwordSet ? "Change Password" : "Set Password"}
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              {profile.passwordSet 
                ? "Update your existing account password to a new one."
                : "Set a password for your account. If you signed in with Google, you can set a password here to allow logging in with email and password directly on other devices."}
            </p>
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 max-w-md">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter at least 5 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-violet-650 hover:from-blue-700 hover:to-violet-755 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Updating Password...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> {profile.passwordSet ? "Change Password" : "Set Password"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
