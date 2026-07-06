// import { useState, useEffect } from "react";

// import Navbar from "./components/Navbar";
// import Hero from "./components/Hero";
// import HowItWorks from "./components/HowItWorks";
// import AIModels from "./components/AIModels";
// import Categories from "./components/Categories";
// // import Features from "./components/Features";
// import CommunityStats from "./components/CommunityStats";
// import CTA from "./components/CTA";
// import Footer from "./components/Footer";

// import "./style.css";

// export default function Home() {
//   // --- Data & Loading States ---
//   const [topCategories, setTopCategories] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // --- Authentication State ---
//   // In a real app, this might come from a Context Provider or Redux,
//   // but for now, we'll track it here to pass to the Navbar.
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   // --- Scroll Tracking States (Replaces scripts.js) ---
//   const [isNavbarVisible, setIsNavbarVisible] = useState(true);
//   const [hasNavbarShadow, setHasNavbarShadow] = useState(false);

//   // 1. Fetching Top Category Data
//   useEffect(() => {
//     const fetchHomeData = async () => {
//       try {
//         const response = await fetch(
//           "http://localhost:8000/api/home/get_home_data.php",
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ action: "fetch_top_categories" }),
//           },
//         );
//         const data = await response.json();
//         if (data.success) {
//           setTopCategories(data.categories);
//         }
//       } catch (err) {
//         console.error("Backend connection failed:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchHomeData();
//   }, []);

//   // 2. Scroll Tracking Logic (Navbar Show/Hide & Shadows)
//   useEffect(() => {
//     let lastScrollTop = 0;

//     const handleScroll = () => {
//       const scrollTop =
//         window.pageYOffset || document.documentElement.scrollTop;

//       // Toggle shadow based on scroll depth
//       if (scrollTop > 50) {
//         setHasNavbarShadow(true);
//       } else {
//         setHasNavbarShadow(false);
//       }

//       // Hide navbar when scrolling down past 80px, show when scrolling up
//       if (scrollTop > lastScrollTop && scrollTop > 80) {
//         setIsNavbarVisible(false);
//       } else {
//         setIsNavbarVisible(true);
//       }

//       // Prevent negative scroll values (mobile bounce effect)
//       lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   return (
//     <div className="bg-[#050505] text-white selection:bg-orange-500 selection:text-white relative w-screen min-h-screen overflow-x-hidden font-['Inter']">
//       {/* Background Aesthetic Effects */}
//       <div
//         className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
//         style={{
//           backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
//         }}
//       ></div>
//       <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-[#fca311] opacity-10 blur-[120px] rounded-full pointer-events-none z-0"></div>
//       <div className="absolute bottom-[10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-[#c084fc] opacity-[0.07] blur-[120px] rounded-full pointer-events-none z-0"></div>

//       {/* Layering the segments seamlessly.
//         Notice how we pass the states down to Navbar!
//       */}
//       <Navbar
//         isVisible={isNavbarVisible}
//         hasShadow={hasNavbarShadow}
//         isLoggedIn={isLoggedIn}
//       />

//       <Hero />

//       <HowItWorks />

//       <AIModels />

//       <Categories data={topCategories} isLoading={isLoading} />

//       {/* <Features /> */}

//       <CommunityStats />

//       <CTA />

//       <Footer />
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useLocation } from "react-router";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import AIModels from "./components/AIModels";
import Categories from "./components/Categories";
// import Features from "./components/Features";

import CTA from "./components/CTA";
import Footer from "./components/Footer";

import "./style.css";

export default function Home() {
  const location = useLocation();

  const [homeData, setHomeData] = useState({ prompts: [], categories: [] });
  const [isLoading, setIsLoading] = useState(true);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [hasNavbarShadow, setHasNavbarShadow] = useState(false);

  useEffect(() => {
    if (location.hash) {
      // If there is a hash (e.g., #ai-models), grab the ID without the '#'
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);

      if (element) {
        // A tiny 100ms delay ensures React has finished drawing the page before scrolling
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } else {
      // If there is no hash, just scroll to the very top
      window.scrollTo(0, 0);
    }
  }, [location]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/home/get_home_data.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "fetch_home_data" }),
          },
        );
        const result = await response.json();

        if (result.success && result.data) {
          setHomeData({
            prompts: result.data.prompts || [],
            categories: result.data.categories || [],
          });
        }
      } catch (err) {
        console.error("Backend connection failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  useEffect(() => {
    let lastScrollTop = 0;

    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > 50) {
        setHasNavbarShadow(true);
      } else {
        setHasNavbarShadow(false);
      }

      if (scrollTop > lastScrollTop && scrollTop > 80) {
        setIsNavbarVisible(false);
      } else {
        setIsNavbarVisible(true);
      }

      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-[#050505] text-white selection:bg-orange-500 selection:text-white relative w-screen min-h-screen overflow-x-clip font-['Inter']">
      {/* Background Aesthetic Effects */}
      <div
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-[#fca311] opacity-10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-[#c084fc] opacity-[0.07] blur-[120px] rounded-full pointer-events-none z-0"></div>

      <Navbar
        isVisible={isNavbarVisible}
        hasShadow={hasNavbarShadow}
        isLoggedIn={isLoggedIn}
      />

      <Hero />

      <HowItWorks />

      <AIModels />

      <Categories data={homeData} isLoading={isLoading} />

      {/* <Features /> */}



      <CTA />

      <Footer />
    </div>
  );
}
