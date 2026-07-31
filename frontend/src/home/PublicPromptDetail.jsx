import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import PromptDetail from "../users/pages/PromptDetail";
import Footer from "./components/Footer";

export default function PublicPromptDetail() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#050505] text-white selection:bg-[#fca311] selection:text-black min-h-screen flex flex-col relative font-['Inter']">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/85 backdrop-blur-[20px] border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-[80px] flex items-center justify-between">
          <div className="flex items-center gap-8 flex-1">
            <Link
              to="/"
              className="text-[22px] font-black tracking-tight flex items-center"
            >
              Dream<span className="font-normal">Key</span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(-1)}
              className="text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-10 pt-[120px] pb-24 flex-grow">
        <PromptDetail />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
