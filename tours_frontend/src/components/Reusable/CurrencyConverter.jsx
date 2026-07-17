import React, { useState, useEffect } from "react";
import { Coins, X, ArrowUpDown, Globe } from "lucide-react";

const CurrencyConverter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(1000);
  const [fromCurrency, setFromCurrency] = useState("INR");
  const [toCurrency, setToCurrency] = useState("IDR");
  const [converted, setConverted] = useState(0);

  // Mock exchange rates (relative to 1 INR)
  const rates = {
    INR: 1,
    USD: 0.012,    // 1 INR = 0.012 USD
    IDR: 190.5,    // 1 INR = 190.5 IDR (Bali)
    EUR: 0.011,    // 1 INR = 0.011 EUR (Paris)
    CHF: 0.0105,   // 1 INR = 0.0105 CHF (Swiss Alps)
  };

  const currencyNames = {
    INR: "Indian Rupee (₹)",
    USD: "US Dollar ($)",
    IDR: "Indonesian Rupiah (Rp)",
    EUR: "Euro (€)",
    CHF: "Swiss Franc (CHF)",
  };

  useEffect(() => {
    // Calculate converted amount
    const rateFrom = rates[fromCurrency];
    const rateTo = rates[toCurrency];
    // Convert to base (INR) first, then to target
    const amountInINR = amount / rateFrom;
    const finalAmount = amountInINR * rateTo;
    setConverted(finalAmount);
  }, [amount, fromCurrency, toCurrency]);

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  return (
    <div className="fixed bottom-5 left-5 z-50 font-sans">
      {/* Floating Action Button (Bottom Left) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full p-3.5 sm:px-5 sm:py-3.5 shadow-2xl flex items-center gap-2.5 transition-all duration-300 transform hover:scale-105 active:scale-95 group relative"
          style={{ boxShadow: "0 10px 30px -5px rgba(16, 185, 129, 0.4)" }}
          title="Live Travel Currency Converter"
        >
          {/* Subtle outer glow ping */}
          <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping group-hover:animate-none opacity-75"></span>
          
          <Coins className="w-5 h-5 text-white" />
          <span className="text-xs font-bold tracking-wide uppercase select-none hidden sm:inline">Converter</span>
        </button>
      )}

      {/* Converter Panel */}
      {isOpen && (
        <div
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-fadeIn"
          style={{
            width: "310px",
            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* Header */}
          <div className="bg-emerald-600 px-4 py-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-white animate-spin-slow" />
              <div>
                <h4 className="font-bold text-sm leading-tight">Travel Exchange Calculator</h4>
                <p className="text-[9px] text-emerald-100 font-medium mt-0.5">Live-feel rates for your tour</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 bg-gray-50/50">
            {/* Input Amount */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                Enter Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
              />
            </div>

            {/* Select Currencies */}
            <div className="flex items-center gap-2 justify-between">
              {/* From */}
              <div className="flex-1">
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">
                  From
                </label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none font-semibold"
                >
                  {Object.keys(rates).map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <button
                onClick={handleSwap}
                className="mt-4 bg-gray-100 hover:bg-gray-200 border text-gray-600 rounded-lg p-1.5 transition-colors self-center flex items-center justify-center"
                title="Swap Currencies"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>

              {/* To */}
              <div className="flex-1">
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">
                  To
                </label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none font-semibold"
                >
                  {Object.keys(rates).map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Result Display Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100 p-3.5 rounded-xl text-center shadow-sm">
              <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mb-1">
                Converted Amount
              </p>
              <h3 className="text-xl font-black text-emerald-800 font-mono">
                {converted.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                {toCurrency}
              </h3>
              <p className="text-[9px] text-gray-400 mt-1">
                {amount.toLocaleString()} {fromCurrency} = {converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} {toCurrency}
              </p>
            </div>

            {/* Rates Reference Table */}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1.5 text-center">
                Destination Quick Rates (1 INR)
              </p>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-gray-600">
                <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                  <span>🇺🇸 USD</span>
                  <span className="font-mono text-emerald-600">0.012</span>
                </div>
                <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                  <span>🇮🇩 IDR (Bali)</span>
                  <span className="font-mono text-emerald-600">190.5</span>
                </div>
                <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                  <span>🇪🇺 EUR (Paris)</span>
                  <span className="font-mono text-emerald-600">0.011</span>
                </div>
                <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                  <span>🇨🇭 CHF (Swiss)</span>
                  <span className="font-mono text-emerald-600">0.010</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyConverter;
