// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router";

// export default function Register() {
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);

//   // Password Strength States
//   const [strengthWidth, setStrengthWidth] = useState("0%");
//   const [strengthText, setStrengthText] = useState("Password is empty");
//   const [strengthClass, setStrengthClass] = useState("text-gray-400");
//   const [strengthBarColor, setStrengthBarColor] = useState("bg-gray-600");

//   const navigate = useNavigate();

//   // Watch password value changes to update the live strength meter
//   useEffect(() => {
//     const val = password;
//     let score = 0;
//     if (val.length >= 8) score++;
//     if (/[A-Z]/.test(val)) score++;
//     if (/[a-z]/.test(val)) score++;
//     if (/[0-9]/.test(val)) score++;
//     if (/[^\w]/.test(val)) score++;

//     if (val.length === 0) {
//       setStrengthWidth("0%");
//       setStrengthText("Password is empty");
//       setStrengthClass("text-gray-400");
//       setStrengthBarColor("bg-gray-600");
//     } else if (score <= 2) {
//       setStrengthWidth("33%");
//       setStrengthText(
//         "Weak Password (Must include uppercase, number & symbol)",
//       );
//       setStrengthClass("text-red-400");
//       setStrengthBarColor("bg-red-500");
//     } else if (score <= 4) {
//       setStrengthWidth("66%");
//       setStrengthText("Medium Password (Almost there!)");
//       setStrengthClass("text-yellow-400");
//       setStrengthBarColor("bg-yellow-500");
//     } else {
//       setStrengthWidth("100%");
//       setStrengthText("Strong Password (Perfect!)");
//       setStrengthClass("text-green-400");
//       setStrengthBarColor("bg-green-500");
//     }
//   }, [password]);

//   const handleRegisterSubmit = (e) => {
//     e.preventDefault();
//     setIsProcessing(true);

//     // Simulate sending registration verification email/OTP
//     setTimeout(() => {
//       setIsProcessing(false);
//       alert(
//         "Registration Successful! Redirecting you to verify your account...",
//       );
//       navigate("/login");
//     }, 1500);
//   };

//   return (
//     <div className="bg-black text-white font-sans min-h-screen relative flex items-center justify-center overflow-x-hidden overflow-y-auto selection:bg-orange-500">
//       {/* Navigation Brand Header */}
//       <nav className="absolute top-6 left-0 w-full z-50 flex justify-between items-center px-10">
//         <button
//           onClick={() => navigate("/")}
//           className="text-3xl font-extrabold flex items-center gap-2 cursor-pointer bg-transparent border-none text-white"
//         >
//           DREAM KEY
//         </button>
//       </nav>

//       {/* Atmospheric Glowing Background Orbs */}
//       <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[150px] opacity-30 pointer-events-none"></div>
//       <div className="fixed bottom-[-10%] right-[20%] w-[600px] h-[600px] bg-orange-500 rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none"></div>

//       {/* Split Layout Container */}
//       <div className="relative z-10 w-full max-w-5xl px-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-24 pb-12 lg:py-0">
//         {/* Left Side Informative Panel */}
//         <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[30px] p-8 lg:p-10 flex flex-col justify-center shadow-2xl">
//           <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
//             JOIN THE <br /> FUTURE OF <br />
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
//               AI ARTISTRY
//             </span>
//           </h1>
//           <p className="text-gray-300 mb-8 leading-relaxed text-sm md:text-base">
//             Create an account to browse premium curated prompts, save your
//             favorites, and join an exclusive elite creator platform.
//           </p>
//           <div>
//             <button
//               onClick={() => navigate("/login")}
//               className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-black transition duration-300 inline-block text-center cursor-pointer"
//             >
//               Already have an account?
//             </button>
//           </div>
//         </div>

//         {/* Right Side Interactive Register Panel */}
//         <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[30px] p-8 lg:p-10 flex flex-col justify-center shadow-2xl relative">
//           <h2 className="text-3xl font-semibold text-center mb-6 tracking-wide">
//             Register
//           </h2>

//           <form
//             onSubmit={handleRegisterSubmit}
//             className="space-y-4 flex flex-col items-center w-full max-w-sm mx-auto"
//           >
//             {/* Username Input */}
//             <div className="w-full">
//               <input
//                 type="text"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 required
//                 placeholder="Username"
//                 className="w-full px-6 py-3.5 text-sm md:text-base bg-transparent border-2 border-white/30 text-white rounded-full transition-all focus:outline-none focus:border-white focus:bg-white/5 placeholder:text-white/60"
//               />
//             </div>

//             {/* Email Address Input */}
//             <div className="w-full">
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 placeholder="Email Address"
//                 className="w-full px-6 py-3.5 text-sm md:text-base bg-transparent border-2 border-white/30 text-white rounded-full transition-all focus:outline-none focus:border-white focus:bg-white/5 placeholder:text-white/60"
//               />
//             </div>

//             {/* Password Input with Hidden-to-Visible View Button */}
//             <div className="w-full relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 placeholder="Password"
//                 className="w-full px-6 py-3.5 text-sm md:text-base bg-transparent border-2 border-white/30 text-white rounded-full transition-all focus:outline-none focus:border-white focus:bg-white/5 placeholder:text-white/60 pr-12"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-5 top-4 text-gray-400 hover:text-white transition cursor-pointer bg-transparent border-none"
//               >
//                 <i
//                   className={`fa-solid ${showPassword ? "fa-eye" : "fa-eye-slash"}`}
//                 ></i>
//               </button>
//             </div>

//             {/* 🌟 Dynamic Password Strength Progress Meter Section 🌟 */}
//             <div className="w-full px-2">
//               <div className="w-full bg-white/10 h-[6px] rounded-full overflow-hidden mt-1">
//                 <div
//                   className={`h-full transition-all duration-300 ${strengthBarColor}`}
//                   style={{ width: strengthWidth }}
//                 ></div>
//               </div>
//               <p
//                 className={`text-xs mt-1.5 ml-1 font-medium transition-colors duration-300 ${strengthClass}`}
//               >
//                 {strengthText}
//               </p>
//             </div>

//             {/* Submit Action Action */}
//             <div className="w-full mt-4">
//               <button
//                 type="submit"
//                 disabled={isProcessing}
//                 className="w-full py-3.5 text-sm md:text-base tracking-wider uppercase font-bold bg-white text-black rounded-full transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
//               >
//                 {isProcessing ? "Creating Account..." : "Register"}
//               </button>
//             </div>
//           </form>

//           {/* Alternate OAuth Section */}
//           <div className="w-full max-w-sm mx-auto mt-6">
//             <div className="flex items-center justify-center gap-4 mb-4">
//               <div className="h-[1px] bg-gray-600 flex-1"></div>
//               <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
//                 or join with
//               </span>
//               <div className="h-[1px] bg-gray-600 flex-1"></div>
//             </div>

//             <a
//               href="#"
//               className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold py-3 px-4 rounded-full transition duration-300"
//             >
//               <img
//                 src="https://www.svgrepo.com/show/475656/google-color.svg"
//                 className="w-5 h-5"
//                 alt="Google"
//               />
//               Google
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import API_BASE from "../config/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Status UI States
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Password Strength States
  const [strengthWidth, setStrengthWidth] = useState("0%");
  const [strengthText, setStrengthText] = useState("Password is empty");
  const [strengthClass, setStrengthClass] = useState("text-gray-400");
  const [strengthBarColor, setStrengthBarColor] = useState("bg-gray-600");

  const navigate = useNavigate();

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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/api/login_register/register.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // CRITICAL for linking session with OTP verify page
          body: JSON.stringify({ username, email, password }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);
        // Wait briefly so the user sees the success message, then send to OTP page
        setTimeout(() => {
          sessionStorage.setItem("otp_expires_at", String(Date.now() + 180 * 1000));
          navigate("/verify-otp");
        }, 1500);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage(
        "Network error. Please check your connection to the server.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-black text-white font-sans min-h-screen relative flex items-center justify-center overflow-x-hidden overflow-y-auto selection:bg-orange-500">
      <nav className="absolute top-6 left-0 w-full z-50 flex justify-between items-center px-10">
        <button
          onClick={() => navigate("/")}
          className="text-3xl font-extrabold flex items-center gap-2 cursor-pointer bg-transparent border-none text-white"
        >
          DREAM KEY
        </button>
      </nav>

      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full filter blur-[150px] opacity-30 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[20%] w-[600px] h-[600px] bg-orange-500 rounded-full filter blur-[150px] opacity-20 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl px-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-24 pb-12 lg:py-0">
        {/* Left Side Informative Panel */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[30px] p-8 lg:p-10 flex flex-col justify-center shadow-2xl transform-gpu will-change-transform">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight flex flex-col gap-1 pr-2">
            <span>JOIN THE</span>
            <span>FUTURE OF</span>
            <span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                AI ARTISTRY
              </span>
            </span>
          </h1>
          <p className="text-gray-300 mb-8 leading-relaxed text-sm md:text-base">
            Create an account to copy prompts easily, save your
            favorites, and join our platform.
          </p>
          <div>
            <button
              onClick={() => navigate("/login")}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-black transition duration-300 inline-block text-center cursor-pointer"
            >
              Already have an account?
            </button>
          </div>
        </div>

        {/* Right Side Interactive Register Panel */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[30px] p-8 lg:p-10 flex flex-col justify-center shadow-2xl relative transform-gpu will-change-transform">
          {/* Dynamic Error/Success UI Banners */}
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
                <i className="fa-solid fa-circle-check mr-2"></i>{" "}
                {successMessage}
              </div>
            </div>
          )}

          <h2 className="text-3xl font-semibold text-center mb-6 tracking-wide">
            Register
          </h2>

          <form
            onSubmit={handleRegisterSubmit}
            className="space-y-4 flex flex-col items-center w-full max-w-sm mx-auto"
          >
            <div className="w-full">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Username"
                className="w-full px-6 py-3.5 text-sm md:text-base bg-transparent border-2 border-white/30 text-white rounded-full transition-all focus:outline-none focus:ring-0 focus:border-white focus:bg-white/5 placeholder:text-white/60"
              />
            </div>

            <div className="w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email Address"
                className="w-full px-6 py-3.5 text-sm md:text-base bg-transparent border-2 border-white/30 text-white rounded-full transition-all focus:outline-none focus:ring-0 focus:border-white focus:bg-white/5 placeholder:text-white/60"
              />
            </div>

            <div className="w-full relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                className="w-full px-6 py-3.5 text-sm md:text-base bg-transparent border-2 border-white/30 text-white rounded-full transition-all focus:outline-none focus:ring-0 focus:border-white focus:bg-white/5 placeholder:text-white/60 pr-12"
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
            </div>

            <div className="w-full px-2">
              <div className="w-full bg-white/10 h-[6px] rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full transition-all duration-300 ${strengthBarColor}`}
                  style={{ width: strengthWidth }}
                ></div>
              </div>
              <p
                className={`text-xs mt-1.5 ml-1 font-medium transition-colors duration-300 ${strengthClass}`}
              >
                {strengthText}
              </p>
            </div>

            <div className="w-full mt-4">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 text-sm md:text-base tracking-wider uppercase font-bold bg-white text-black rounded-full transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? "Creating Account..." : "Register"}
              </button>
            </div>
          </form>

          <div className="w-full max-w-sm mx-auto mt-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-[1px] bg-gray-600 flex-1"></div>
              <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                or join with
              </span>
              <div className="h-[1px] bg-gray-600 flex-1"></div>
            </div>

            <a
              href={`${API_BASE}/login_register/google_callback.php`}
              className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold py-3 px-4 rounded-full transition duration-300"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="w-5 h-5"
                alt="Google"
              />
              Google
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
