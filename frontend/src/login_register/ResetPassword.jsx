// src/ResetPassword.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import API_BASE from "../config/api";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Strength UI States
  const [strengthWidth, setStrengthWidth] = useState("0%");
  const [strengthText, setStrengthText] = useState("Password is empty");
  const [strengthClass, setStrengthClass] = useState("text-gray-400");
  const [strengthBarColor, setStrengthBarColor] = useState("bg-gray-600");

  const navigate = useNavigate();

  // Password Strength Logic
  useEffect(() => {
    const val = password;
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[a-z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^\w]/.test(val)) score++;

    if (val.length === 0) {
      setStrengthWidth("0%");
      setStrengthText("Password is empty");
      setStrengthClass("text-gray-400");
      setStrengthBarColor("bg-gray-600");
    } else if (score <= 2) {
      setStrengthWidth("33%");
      setStrengthText(
        "Weak Password (Must include uppercase, number & symbol)",
      );
      setStrengthClass("text-red-400");
      setStrengthBarColor("bg-red-500");
    } else if (score <= 4) {
      setStrengthWidth("66%");
      setStrengthText("Medium Password (Almost there!)");
      setStrengthClass("text-yellow-400");
      setStrengthBarColor("bg-yellow-500");
    } else {
      setStrengthWidth("100%");
      setStrengthText("Strong Password (Perfect!)");
      setStrengthClass("text-green-400");
      setStrengthBarColor("bg-green-500");
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `\/login_register/reset_password.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ password }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setErrorMessage(data.message);
        if (data.redirect) {
          setTimeout(() => navigate(data.redirect), 2000); // Send back to login if unauthorized
        }
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div className="bg-black text-white font-sans h-screen overflow-hidden relative flex items-center justify-center p-4">
      <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-green-600 rounded-full mix-blend-screen filter blur-[150px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-blue-500 rounded-full mix-blend-screen filter blur-[150px] opacity-30"></div>

      <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-10 max-w-md w-full text-center shadow-2xl">
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
          Create New Password
        </h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Please enter your new strong password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="w-full relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="New Password"
              className="w-full px-6 py-4 text-sm md:text-base pr-12 bg-transparent border-2 border-white/30 text-white rounded-full transition-all focus:outline-none focus:ring-0 focus:border-white focus:bg-white/5 focus:shadow-[0_0_15px_rgba(255,255,255,0.1)] placeholder:text-white/60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-4 text-gray-400 hover:text-white transition cursor-pointer bg-transparent border-none"
            >
              <i
                className={`fa-solid ${showPassword ? "fa-eye" : "fa-eye-slash"}`}
              ></i>
            </button>

            <div className="w-full px-2 mt-2">
              <div className="w-full bg-white/10 h-[6px] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strengthBarColor}`}
                  style={{ width: strengthWidth }}
                ></div>
              </div>
              <p className={`text-xs mt-1 ml-1 font-medium ${strengthClass}`}>
                {strengthText}
              </p>
            </div>
          </div>

          <div className="w-full relative pt-2">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm New Password"
              className="w-full px-6 py-4 text-sm md:text-base pr-12 bg-transparent border-2 border-white/30 text-white rounded-full transition-all focus:outline-none focus:ring-0 focus:border-white focus:bg-white/5 focus:shadow-[0_0_15px_rgba(255,255,255,0.1)] placeholder:text-white/60"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-5 top-[25px] text-gray-400 hover:text-white transition cursor-pointer bg-transparent border-none"
            >
              <i
                className={`fa-solid ${showConfirm ? "fa-eye" : "fa-eye-slash"}`}
              ></i>
            </button>

            <div className="w-full px-2 mt-1 min-h-[20px]">
              {confirmPassword.length > 0 && (
                <p
                  className={`text-xs ml-1 font-medium tracking-wide ${passwordsMatch ? "text-green-400" : "text-red-400"}`}
                >
                  {passwordsMatch
                    ? "Passwords match! ✓"
                    : "Passwords do not match ✗"}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing || !passwordsMatch}
            className="w-full py-4 mt-2 text-sm md:text-base tracking-wider uppercase font-bold bg-white text-black rounded-full transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Saving..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
