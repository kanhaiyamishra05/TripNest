import React, { useEffect, useState } from "react";
import { Eye, EyeOff, LogIn, Moon, Sun } from "lucide-react";

import googleIMg from "../../assets/Images/Google.svg.webp";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { userSignUP } from "../../Redux/API/API";
import { toast } from "sonner";

const SignUp = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.user);

  const toggle = () => {
    setDarkMode(!darkMode);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.error("Please agree to the Terms and Policies");
      return;
    }

    if (!/^[0-9]{10}$/.test(contactNumber)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    let credentials = {
      name,
      email,
      password,
      contactNumber,
      enabled: agreedToTerms,
    };

    dispatch(userSignUP(credentials)).then((res) => {
      if (userSignUP.fulfilled.match(res)) {
        toast.success("Account created successfully! Please sign in.");
        navigate("/");
      } else {
        const errorMsg = res.payload || "Registration failed";
        toast.error(errorMsg);
        setName("");
        setPassword("");
        setEmail("");
        setContactNumber("");
      }
    });
  };

  const openTermsModal = () => {
    toast.info("Terms and Policies: By registering, you agree to our booking rules, refund conditions, and privacy policies.");
  };

  const googleLogin = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8080";
    window.open(`${baseUrl}/oauth2/authorization/google`, "_self");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Creating your account...</p>
      </div>
    );
  }

  return (
    <>
      <div className={darkMode ? "dark" : ""}>
        <div className="flex flex-col justify-center items-center flex-1 min-h-screen px-6 py-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-indigo-100 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950 transition-all duration-300">
          
          {/* Main Card */}
          <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/80 shadow-2xl rounded-3xl p-8 transform transition-all">
            
            <div className="text-center mb-6">
              <div className="inline-flex p-3.5 bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 rounded-2xl mb-4">
                <LogIn className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                Create Account
              </h2>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Join TripNest today and explore the world
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300"
                >
                  Full Name
                </label>
                <div className="mt-1.5">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300"
                >
                  Email Address
                </label>
                <div className="mt-1.5">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contactNumber"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300"
                >
                  Phone Number
                </label>
                <div className="mt-1.5">
                  <input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    required
                    placeholder="10-digit number"
                    pattern="[0-9]{10}"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300"
                >
                  Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center pt-1">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={() => setAgreedToTerms(!agreedToTerms)}
                  className="w-4.5 h-4.5 text-blue-600 border-gray-300 dark:border-slate-700 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label
                  htmlFor="terms"
                  className="block ml-2 text-xs text-gray-600 dark:text-slate-300 cursor-pointer select-none"
                >
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={openTermsModal}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Terms and Policies
                  </button>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>
              </div>
            </form>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100 dark:border-slate-800"></div>
              </div>
              <span className="relative bg-white dark:bg-slate-900 px-3 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                Or Continue With
              </span>
            </div>

            <div className="flex gap-4">
              <button
                className="flex items-center w-full justify-center rounded-xl px-4 py-2.5 text-sm font-semibold border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 text-gray-700 dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors"
                onClick={googleLogin}
              >
                <img src={googleIMg} alt="Google" className="mr-2 size-4" />
                Google OAuth
              </button>
            </div>

            <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
              Already a member?{" "}
              <Link
                to="/"
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Sign In Now
              </Link>
            </p>
          </div>
        </div>

        {/* Floating Dark Mode Toggle */}
        <div className="absolute top-5 right-5 md:right-12">
          <button
            className="border border-gray-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 size-9 rounded-xl flex items-center justify-center shadow-md backdrop-blur-sm transition-all"
            onClick={toggle}
          >
            {darkMode ? <Sun className="text-yellow-500" /> : <Moon className="text-slate-700" />}
          </button>
        </div>
      </div>
    </>
  );
};

export default SignUp;
