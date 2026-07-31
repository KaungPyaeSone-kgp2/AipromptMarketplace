// src/pages/Explore.jsx
// import { useState, useEffect } from "react";
// import { useSearchParams } from "react-router"; // NEW: Imports React Router hook
// import { Search, Filter, Star, Bookmark } from "lucide-react";
// import Navbar from "./components/Navbar"; // Adjust path as needed
// import Footer from "./components/Footer"; // Adjust path as needed

// export default function Explore() {
//   // NEW: Use React Router's search params so it updates dynamically without page reloads
//   const [searchParams, setSearchParams] = useSearchParams();
//   const initialModel = searchParams.get("model") || "All";
//   const initialCategory = searchParams.get("category") || "All";

//   // State Management
//   const [prompts, setPrompts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // Active Filters
//   const [search, setSearch] = useState("");
//   const [selectedModel, setSelectedModel] = useState(initialModel);
//   const [selectedCategory, setSelectedCategory] = useState(initialCategory);

//   const availableModels = [
//     "All",
//     "ChatGPT",
//     "Claude",
//     "Gemini",
//     "Midjourney",
//     "StableDiffusion",
//   ];

//   // NEW: Listen for URL changes (like when clicking an AI Models link) and update states
//   useEffect(() => {
//     setSelectedModel(searchParams.get("model") || "All");
//     setSelectedCategory(searchParams.get("category") || "All");
//   }, [searchParams]);

//   // Fetch Function triggering the PHP Cache API
//   const fetchFilteredData = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(
//         "http://localhost:8000/api/home/get_filtered_prompts.php", // Make sure this matches your actual folder path
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             search: search,
//             model: selectedModel,
//             category: selectedCategory,
//           }),
//         },
//       );

//       const data = await response.json();
//       if (data.success) {
//         setPrompts(data.prompts);
//         setCategories(data.categories);
//       }
//     } catch (error) {
//       console.error("Failed to fetch explore data:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Re-fetch anytime a filter changes
//   useEffect(() => {
//     fetchFilteredData();
//   }, [search, selectedModel, selectedCategory]);

//   // NEW: Handlers to update URL when user manually changes a dropdown
//   const handleModelChange = (e) => {
//     const val = e.target.value;
//     setSelectedModel(val);
//     setSearchParams((prev) => {
//       if (val === "All") prev.delete("model");
//       else prev.set("model", val);
//       return prev;
//     });
//   };

//   const handleCategoryChange = (e) => {
//     const val = e.target.value;
//     setSelectedCategory(val);
//     setSearchParams((prev) => {
//       if (val === "All") prev.delete("category");
//       else prev.set("category", val);
//       return prev;
//     });
//   };

//   return (
//     <div className="bg-[#050505] min-h-screen text-white font-['Inter'] flex flex-col">
//       <Navbar isLoggedIn={false} />

//       <div className="flex-grow pt-32 pb-20 max-w-[1400px] mx-auto w-full px-6 md:px-10">
//         {/* Header & Search Section */}
//         <div className="mb-12">
//           <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
//             Explore <span className="text-[#fca311]">Prompts</span>
//           </h1>

//           <div className="flex flex-col md:flex-row gap-4">
//             {/* Search Bar */}
//             <div className="relative flex-grow">
//               <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Search prompts, styles, or keywords..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#fca311]/50 transition-colors"
//               />
//             </div>

//             {/* Model Dropdown */}
//             <select
//               value={selectedModel}
//               onChange={handleModelChange}
//               className="bg-[#0a0a0a] border border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-[#fca311]/50 appearance-none min-w-[180px] cursor-pointer"
//             >
//               {availableModels.map((model) => (
//                 <option key={model} value={model}>
//                   {model === "All" ? "All Models" : model}
//                 </option>
//               ))}
//             </select>

//             {/* Category Dropdown */}
//             <select
//               value={selectedCategory}
//               onChange={handleCategoryChange}
//               className="bg-[#0a0a0a] border border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-[#fca311]/50 appearance-none min-w-[200px] cursor-pointer"
//             >
//               <option value="All">All Categories</option>
//               {categories.map((cat) => (
//                 <option key={cat.id} value={cat.category_name}>
//                   {cat.category_name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Results Grid */}
//         {isLoading ? (
//           <div className="flex justify-center items-center py-20">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fca311]"></div>
//           </div>
//         ) : prompts.length === 0 ? (
//           <div className="text-center py-20 bg-[#0a0a0a] rounded-2xl border border-white/10">
//             <Filter className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
//             <h3 className="text-xl font-bold text-white mb-2">
//               No prompts found
//             </h3>
//             <p className="text-zinc-400">
//               Try adjusting your filters or search terms.
//             </p>
//             <button
//               onClick={() => {
//                 setSearch("");
//                 setSearchParams(new URLSearchParams()); // Clears URL params
//               }}
//               className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold transition-colors cursor-pointer"
//             >
//               Clear All Filters
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {prompts.map((prompt) => (
//               <a
//                 key={prompt.id}
//                 href={`/prompt/${prompt.slug}`}
//                 className="group flex flex-col bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden hover:border-[#fca311]/40 transition-all duration-300"
//               >
//                 <div className="relative h-48 w-full overflow-hidden">
//                   <img
//                     src={prompt.thumbnail}
//                     alt={prompt.title}
//                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
//                   />
//                   <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold text-white">
//                     {prompt.model_type}
//                   </div>
//                 </div>

//                 <div className="p-5 flex flex-col flex-grow">
//                   <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-[#fca311] transition-colors">
//                     {prompt.title}
//                   </h3>
//                   <p className="text-zinc-400 text-sm line-clamp-2 mb-4 flex-grow">
//                     {prompt.prompt_description}
//                   </p>

//                   <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
//                     <div className="flex items-center gap-1.5 text-xs text-zinc-300">
//                       <Star className="w-3.5 h-3.5 fill-[#fca311] text-[#fca311]" />
//                       <span className="font-bold">
//                         {Number(prompt.average_rating).toFixed(1)}
//                       </span>
//                       <span className="text-zinc-500">
//                         ({prompt.review_count})
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-1 text-xs text-zinc-400">
//                       <Bookmark className="w-3.5 h-3.5" />
//                       {prompt.save_count}
//                     </div>
//                   </div>
//                 </div>
//               </a>
//             ))}
//           </div>
//         )}
//       </div>

//       <Footer />
//     </div>
//   );
// }

// src/pages/Explore.jsx
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import API_BASE from "../config/api";
import {
  Search,
  X,
  ArrowLeft,
  Filter,
  ChevronDown,
  Cpu,
  Layers,
  Check,
  Ghost,
  Star,
} from "lucide-react";
import Footer from "./components/Footer";

export default function Explore() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Parameters
  const searchQuery = searchParams.get("q") || "";
  const modelFilter = searchParams.get("model") || "";
  const categoryFilter = searchParams.get("category") || "";

  const sourceRef = searchParams.get("ref") || "";

  // Component State
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Local state for the search input box (so it doesn't fetch on every keystroke)
  const [searchInput, setSearchInput] = useState(searchQuery);

  const availableModels = [
    "Midjourney",
    "ChatGPT",
    "Claude",
    "Gemini",
    "StableDiffusion",
  ];

  // Fetch Data from Cache API
  const fetchFilteredData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/home/get_filtered_prompts.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            search: searchQuery, // API expects 'search'
            model: modelFilter || "All",
            category: categoryFilter || "All",
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        setPrompts(data.prompts);
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch explore data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [searchQuery, modelFilter, categoryFilter]);

  useEffect(() => {
    fetchFilteredData();
    setSearchInput(searchQuery);
  }, [searchQuery, modelFilter, categoryFilter]);

  // Update URL Filters
  const updateFilter = (key, value) => {
    setSearchParams((prev) => {
      if (!value) prev.delete(key);
      else prev.set(key, value);
      return prev;
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter("q", searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    updateFilter("q", "");
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput("");
  };

  const handleBackNavigation = () => {
    if (sourceRef) {
      // If a reference exists, navigate home and scroll to the ID
      navigate(`/#${sourceRef}`);
    } else {
      // Otherwise, just go back to the top of the home page
      navigate("/");
    }
  };

  return (
    <div className="bg-[#050505] text-white selection:bg-[#fca311] selection:text-black min-h-screen flex flex-col relative font-['Inter']">
      {/* Ambient Background */}
      <div
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>
      <div className="fixed top-[-20%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-[#c084fc] opacity-[0.05] blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* Custom Explore Navbar matching explore.php */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/85 backdrop-blur-[20px] border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-[80px] flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <Link
              to="/"
              className="text-[22px] font-black tracking-tight flex items-center flex-shrink-0"
            >
              Dream<span className="font-normal">Key</span>
            </Link>

            <div className="hidden md:flex flex-col border-l border-white/10 pl-6 ml-2 flex-shrink-0">
              <h1 className="text-white font-bold text-sm leading-tight">
                Explore Prompts
              </h1>
              <p className="text-[#a1a1aa] text-[10px] uppercase tracking-wider">
                Curated by the community
              </p>
            </div>

            {/* <form
              onSubmit={handleSearchSubmit}
              className="hidden lg:flex relative items-center max-w-[400px] w-full ml-6"
            >
              <Search className="absolute left-4 text-[#71717a] w-4 h-4" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search prompts..."
                className="w-full px-4 py-2 pl-10 text-sm bg-transparent border border-white/20 text-white rounded-full transition-all duration-300 placeholder:text-white/50 focus:outline-none focus:border-white/80 focus:bg-white/5 focus:shadow-[0_0_10px_rgba(255,255,255,0.1)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 text-[#71717a] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form> */}
          </div>

          <div className="flex items-center gap-6 flex-shrink-0">
            <button
              onClick={handleBackNavigation}
              className="text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-10 pt-[100px] pb-20 flex-grow flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* SIDEBAR (Filters) */}
        <aside className="w-full lg:w-[220px] xl:w-[240px] flex-shrink-0">
          {/* Mobile Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full lg:hidden flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-5 py-3 mb-6 text-white font-medium shadow-lg hover:bg-white/10 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#fca311]" /> Filters
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isFilterOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Sticky Container */}
          <div
            className={`${isFilterOpen ? "block" : "hidden"} lg:block lg:sticky lg:top-[100px] lg:h-[calc(100vh-120px)] overflow-y-auto no-scrollbar bg-[#0a0a0a] border border-white/10 rounded-[20px] p-5 shadow-2xl transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white tracking-wide">
                Filters
              </h2>
              {(searchQuery || modelFilter || categoryFilter) && (
                <button
                  onClick={clearAllFilters}
                  className="text-[10px] font-semibold text-[#fca311] hover:text-white transition-colors bg-[#fca311]/10 px-2 py-1 rounded border border-[#fca311]/20"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Model Filter */}
            <div className="mb-8">
              <h3 className="text-[#71717a] text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <Cpu className="w-3 h-3" /> AI Model
              </h3>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => updateFilter("model", "")}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-300 w-full text-left ${!modelFilter ? "bg-[#fca311] text-black shadow-[0_0_10px_rgba(252,163,17,0.2)]" : "text-[#a1a1aa] hover:bg-white/5 hover:text-white"}`}
                >
                  <span>All Models</span>
                  {!modelFilter && <Check className="w-3 h-3" />}
                </button>
                {availableModels.map((m) => (
                  <button
                    key={m}
                    onClick={() => updateFilter("model", m)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-300 w-full text-left ${modelFilter === m ? "bg-[#fca311] text-black shadow-[0_0_10px_rgba(252,163,17,0.2)]" : "text-[#a1a1aa] hover:bg-white/5 hover:text-white"}`}
                  >
                    <span>{m}</span>
                    {modelFilter === m && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="pb-4">
              <h3 className="text-[#71717a] text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <Layers className="w-3 h-3" /> Category
              </h3>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => updateFilter("category", "")}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-300 w-full text-left ${!categoryFilter ? "bg-white/10 text-white border border-white/20" : "text-[#a1a1aa] hover:bg-white/5 hover:text-white border border-transparent"}`}
                >
                  <span>All Categories</span>
                  {!categoryFilter && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#fca311]"></div>
                  )}
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateFilter("category", c.category_name)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-300 w-full text-left ${categoryFilter === c.category_name ? "bg-white/10 text-white border border-white/20" : "text-[#a1a1aa] hover:bg-white/5 hover:text-white border border-transparent"}`}
                  >
                    <span>{c.category_name}</span>
                    {categoryFilter === c.category_name && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#fca311]"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 flex flex-col pt-1">
          {searchQuery && (
            <div className="mb-6 flex items-center justify-between bg-white/5 px-5 py-3 rounded-xl border border-white/10">
              <p className="text-white text-sm">
                Showing results for "
                <span className="text-[#fca311] font-bold">{searchQuery}</span>"
              </p>
            </div>
          )}

          {/* Results Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#fca311]"></div>
            </div>
          ) : prompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-[#0a0a0a] rounded-[24px] border border-white/5 mt-4">
              <div className="w-20 h-20 mb-5 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Ghost className="w-8 h-8 text-[#71717a]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No prompts found
              </h3>
              <p className="text-[#a1a1aa] max-w-md text-base">
                We couldn't find anything matching your current filters. Try
                adjusting your search query or clearing the filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-6 px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-[#fca311] transition-colors shadow-lg"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 lg:gap-6">
              {prompts.map((prompt) => (
                <Link
                  to="/register"
                  key={prompt.id}
                  className="group relative w-full aspect-[4/5] rounded-[20px] overflow-hidden bg-[#111] cursor-pointer shadow-xl border border-white/5 block"
                >
                  <img
                    src={prompt.thumbnail}
                    alt={prompt.title}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-5 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex justify-between items-center mb-3">
                      <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-md text-[9px] font-bold text-white uppercase tracking-widest shadow-sm">
                        {prompt.model_type}
                      </span>
                      <span className="flex items-center gap-1 text-[#fca311] text-[10px] font-bold bg-black/50 backdrop-blur-md px-2 py-1 rounded-md border border-black/50">
                        <Star className="w-3 h-3 fill-[#fca311]" />{" "}
                        {Number(prompt.average_rating).toFixed(1)}
                      </span>
                    </div>
                    <h3 className="text-white text-base font-bold leading-tight line-clamp-2 mb-3 group-hover:text-[#fca311] transition-colors drop-shadow-lg">
                      {prompt.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
