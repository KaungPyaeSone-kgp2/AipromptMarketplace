// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import dreamKeyLogo from "../../assets/dream-key-logo.jpg";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    dashboardUrl: "",
    avatarUrl: "",
  });

  const navigate = useNavigate();

  // Fetch authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          "/api/home/check_auth.php",
          {
            // Important: include credentials so PHP can read the session cookie
            credentials: "include",
          },
        );
        const data = await response.json();

        if (data.success && data.isLoggedIn) {
          setAuthState({
            isLoggedIn: true,
            dashboardUrl: data.dashboardUrl,
            avatarUrl: data.avatarUrl,
          });
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };

    checkAuth();
  }, []);

  return (
    <nav
      id="main-nav"
      className="theme-nav fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-[80px] flex items-center justify-between">
        <div className="flex items-center gap-8 flex-1">
          <a
            href="#"
            className="text-[22px] font-black tracking-tight flex items-center gap-3 text-white"
          >
            <img src={dreamKeyLogo} alt="DreamKey Logo" className="w-8 h-8 rounded-lg object-cover" />
            <span>Dream<span className="font-normal">Key</span></span>
          </a>

          {/* Desktop Search Form */}
          {/* <form
            action="http://localhost:8000/api/home/get_filtered_prompts.php"
            method="POST"
            className="hidden lg:flex relative items-center max-w-[250px] xl:max-w-[300px] w-full ml-4"
          >
            <Search className="absolute left-4 text-[#71717a] text-sm" />
            <input
              type="text"
              name="q"
              placeholder="Search prompts..."
              className="glass-input w-full px-4 py-2.5 pl-10 text-sm bg-white/5 border border-white/10 rounded-full text-white focus:outline-none focus:border-white/30"
            />
          </form> */}

          {/* Desktop Nav Links */}
          <div className="hidden xl:flex items-center gap-6 text-[14px] text-[#a1a1aa]">
            <a href="#ai-models" className="hover:text-white transition-colors">
              AI Models
            </a>
            <a
              href="#categories"
              className="hover:text-white transition-colors"
            >
              Categories
            </a>
            <a
              href="#community-join"
              className="hover:text-white transition-colors"
            >
              Community
            </a>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6">

          {/* Always show Login and Sign Up buttons per user request */}
          <button
            onClick={() => navigate("/login")}
            className="nav-login-btn relative z-50 text-[14px] text-[#a1a1aa] hover:text-white transition mr-4 cursor-pointer"
          >
            Log In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="nav-signup-btn relative z-50 bg-white text-black px-4 py-2 rounded-full font-medium text-[13px] hover:bg-gray-200 transition cursor-pointer border-none"
          >
            Sign Up
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          id="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden text-gray-300 hover:text-white text-2xl focus:outline-none relative z-50"
        >
          <i
            className={`fa-solid ${isMobileMenuOpen ? "fa-xmark" : "fa-bars"}`}
          ></i>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 absolute top-[80px] left-0 w-full shadow-2xl z-50"
        >
          <div className="flex flex-col gap-4 text-[15px] text-[#a1a1aa]">
            <a
              href="#ai-models"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-white transition-colors"
            >
              AI Models
            </a>
            <a
              href="#categories"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-white transition-colors"
            >
              Categories
            </a>
            <a
              href="#community-join"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-white transition-colors pb-4 border-b border-white/10"
            >
              Community
            </a>


            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={() => navigate("/login")}
                className="nav-login-btn relative z-50 text-[14px] text-[#a1a1aa] hover:text-white transition mr-4 cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="nav-signup-btn relative z-50 bg-white text-black px-4 py-2 rounded-full font-medium text-[13px] hover:bg-gray-200 transition cursor-pointer border-none"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
