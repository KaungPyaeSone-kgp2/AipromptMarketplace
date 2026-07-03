// src/ForgotPassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        "http://localhost:8000/api/login_register/forgot_password.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);
        setTimeout(() => {
          sessionStorage.setItem("otp_expires_at", String(Date.now() + 180 * 1000));
          navigate("/verify-otp");
        }, 2000);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      // setErrorMessage("Network error. Please try again.");
      // Change this temporarily to see what went wrong:
      setErrorMessage("React Error: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-black text-white font-sans h-screen overflow-hidden relative flex items-center justify-center p-4">
      <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-purple-600 rounded-full mix-blend-screen filter blur-[150px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-orange-500 rounded-full mix-blend-screen filter blur-[150px] opacity-30"></div>

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
          Reset Password
        </h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Enter your email address and we'll send you an OTP to reset your
          password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full px-6 py-4 text-sm md:text-base text-center bg-transparent border-2 border-white/30 text-white rounded-full transition-all focus:outline-none focus:ring-0 focus:border-white focus:bg-white/5 focus:shadow-[0_0_15px_rgba(255,255,255,0.1)] placeholder:text-white/60"
          />

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 text-sm md:text-base tracking-wider uppercase font-bold bg-white text-black rounded-full transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <p className="mt-8 text-sm text-gray-400">
          Remember your password?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-white hover:text-yellow-400 transition font-medium cursor-pointer bg-transparent border-none"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
