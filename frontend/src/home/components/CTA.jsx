// src/components/CTA.jsx
import { useNavigate } from "react-router";

export default function CTA() {
  const navigate = useNavigate();
  return (
    <div
      id="community-join"
      className="w-full max-w-[1400px] mx-auto px-6 md:px-10 py-10 mb-20 z-40 relative scroll-mt-24"
    >
      <div className="relative w-full rounded-[24px] bg-[#0a0a0a] border border-white/10 overflow-hidden min-h-[320px] flex items-center group">
        {/* Background Image & Cinematic Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&fit=crop"
            alt="Background"
            className="w-full h-full object-cover opacity-[0.15] filter grayscale group-hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent"></div>
        </div>

        {/* Text Content */}
        <div className="relative z-10 p-10 md:p-14 lg:p-16 w-full md:w-3/4 lg:w-2/3">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight leading-tight">
            Share your expertise with the community
          </h2>
          <p className="text-[#a1a1aa] text-[15px] md:text-base mb-8 max-w-xl leading-relaxed">
            Join thousands of prompt engineers. Upload your best prompts, help
            others learn, and build your reputation as a top creator in the AI
            space.
          </p>
          <div>
            <button
              onClick={() => navigate("/register")}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-black transition duration-300 inline-block text-center"
            >
              Join With Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
