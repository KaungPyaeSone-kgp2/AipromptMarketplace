// src/VerifyOtp.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import API_BASE from "../config/api";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  // Persist expiry timestamp in sessionStorage so refresh doesn't reset the timer
  const [timeLeft, setTimeLeft] = useState(() => {
    const stored = sessionStorage.getItem("otp_expires_at");
    if (stored) {
      const remaining = Math.floor((Number(stored) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    // First visit: set expiry 3 minutes from now
    const expiresAt = Date.now() + 180 * 1000;
    sessionStorage.setItem("otp_expires_at", String(expiresAt));
    return 180;
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const timerRef = useRef(null);

  // Handle Countdown Timer — sync from stored expiry on each tick
  useEffect(() => {
    if (timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      const stored = sessionStorage.getItem("otp_expires_at");
      if (!stored) {
        clearInterval(timerRef.current);
        setTimeLeft(0);
        return;
      }
      const remaining = Math.floor((Number(stored) - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setTimeLeft(0);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? "0" + minutes : minutes}:${remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds}`;
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();

    if (timeLeft <= 0) {
      setErrorMessage("OTP has expired. Please restart the process.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/login_register/verify_otp.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ otp }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);
        clearInterval(timerRef.current); // Stop timer on success
        sessionStorage.removeItem("otp_expires_at"); // Clean up

        setTimeout(() => {
          navigate(data.redirect);
        }, 1500);
      } else {
        setErrorMessage(data.message);
        if (data.redirect) {
          setTimeout(() => navigate(data.redirect), 2500); // Redirect on ban/hard fail
        }
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-black text-white font-sans overflow-hidden h-screen relative flex items-center justify-center p-4 selection:bg-blue-500">
      {/* Background Ambient Orbs */}
      <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-blue-600 rounded-full mix-blend-screen filter blur-[150px] opacity-30"></div>
      <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-orange-500 rounded-full mix-blend-screen filter blur-[150px] opacity-30"></div>

      <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-10 max-w-md w-full text-center shadow-2xl">
        {/* Alerts */}
        {errorMessage && (
          <div className="absolute -top-5 left-0 w-full flex justify-center z-50 animate-bounce">
            <div className="bg-red-500/80 backdrop-blur-xl border border-red-500/50 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center">
              <i className="fa-solid fa-circle-exclamation mr-2"></i>{" "}
              {errorMessage}
            </div>
          </div>
        )}
        {successMessage && (
          <div className="absolute -top-5 left-0 w-full flex justify-center z-50 animate-bounce">
            <div className="bg-green-500/80 backdrop-blur-xl border border-green-500/50 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center">
              <i className="fa-solid fa-circle-check mr-2"></i> {successMessage}
            </div>
          </div>
        )}

        <h2 className="text-3xl font-bold mb-3 tracking-wide">
          Security Check
        </h2>
        <p className="text-gray-400 text-sm mb-2">
          We've sent a 6-digit verification code to your email.
        </p>

        <div
          className={`mb-6 text-sm font-semibold py-2 px-4 rounded-full inline-flex items-center gap-2 border transition-colors duration-300 ${timeLeft === 0 ? "text-red-500 bg-red-500/10 border-red-500/20" : "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"}`}
        >
          <i className="fa-solid fa-clock shadow-sm"></i>
          Code expires in:{" "}
          <span className="tracking-wider">{formatTime(timeLeft)}</span>
        </div>

        <form onSubmit={handleVerifySubmit} className="space-y-6">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} // Restrict to numbers only
            maxLength="6"
            required
            autoComplete="off"
            disabled={timeLeft === 0 || successMessage !== ""}
            className="w-full px-4 py-5 text-center text-3xl md:text-4xl tracking-[0.5em] font-mono bg-transparent border-2 border-white/30 text-white rounded-[20px] transition-all focus:outline-none focus:ring-0 focus:border-white focus:bg-white/5 focus:shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="------"
          />

          <button
            type="submit"
            disabled={isProcessing || timeLeft === 0 || successMessage !== ""}
            className="w-full py-4 text-sm md:text-base tracking-wider uppercase font-bold bg-white text-black rounded-full transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Verifying..." : "Verify Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
