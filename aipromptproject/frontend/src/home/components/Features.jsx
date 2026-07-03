// src/components/Features.jsx
import { useState, useEffect, useRef } from "react";
import { Gem, Layers, Zap } from "lucide-react";

import quality from "../../assets/quality.jpg";
import multimodel from "../../assets/multimodel.JPG";
import savetime from "../../assets/savetime.JPG";

export default function Features() {
  const [activeFeature, setActiveFeature] = useState(1);
  const blockRefs = useRef([]);

  const features = [
    {
      id: 1,
      title: "Curated Quality",
      desc: "Every prompt is verified by our community to ensure you get exactly the results you want, every single time. No more guessing if a prompt actually works.",
      Icon: Gem,
      themeColor: "text-[#fca311]",
      bgGlow: "bg-[#fca311]/10",
      borderGlow: "border-[#fca311]/20",
      shadow: "shadow-[0_0_20px_rgba(252,163,17,0.15)]",
      image: quality,
    },
    {
      id: 2,
      title: "Multi-Model Support",
      desc: "Whether you use Midjourney, ChatGPT, Claude, or Stable Diffusion, we have optimized prompts ready for your favorite AI. Seamlessly switch between tools.",
      Icon: Layers,
      themeColor: "text-[#3b82f6]",
      bgGlow: "bg-[#3b82f6]/10",
      borderGlow: "border-[#3b82f6]/20",
      shadow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]",
      image: multimodel,
    },
    {
      id: 3,
      title: "Save Time",
      desc: "Stop wasting hours trying to find the perfect prompt formulation. Copy, paste, and generate into your favorite AI. Your workflow, supercharged.",
      Icon: Zap,
      themeColor: "text-[#10a37f]",
      bgGlow: "bg-[#10a37f]/10",
      borderGlow: "border-[#10a37f]/20",
      shadow: "shadow-[0_0_20px_rgba(16,163,127,0.15)]",
      image: savetime,
    },
  ];

  useEffect(() => {
    // This is the EXACT observer logic from your script.js
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // When intersecting, update the state to the active index
            setActiveFeature(Number(entry.target.dataset.index));
          }
        });
      },
      {
        rootMargin: "-35% 0px -40% 0px", // Matched perfectly from your JS
        threshold: 0,
      },
    );

    // Observe all feature blocks
    blockRefs.current.forEach((block) => {
      if (block) observer.observe(block);
    });

    return () => {
      blockRefs.current.forEach((block) => {
        if (block) observer.unobserve(block);
      });
    };
  }, []);

  return (
    <section
      id="why-dream-key"
      className="w-full bg-[#050505] relative z-30 border-t border-white/5"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-30 pb-30">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Why Dream Key?
          </h2>
          <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto">
            More than just a marketplace. We're building the ultimate hub for AI
            creativity.
          </p>
        </div>

        <div className="flex flex-col md:flex-row relative items-start gap-10 lg:gap-20">
          {/* Left Side: Sticky Image Container */}
          <div className="w-full md:w-1/2 sticky top-32 h-[400px] md:h-[550px] rounded-[32px] overflow-hidden hidden md:block border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)] bg-[#111]">
            {features.map((feat) => (
              <img
                key={`img-${feat.id}`}
                src={feat.image}
                alt={feat.title}
                // LOGIC: If image index <= active index, slide it up to 0. Else, push it to full.
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  activeFeature >= feat.id
                    ? "translate-y-0"
                    : "translate-y-full"
                }`}
                style={{
                  zIndex: feat.id * 10, // Creates the z-10, z-20, z-30 stack
                  objectPosition: feat.id === 1 ? "40% 60%" : "center",
                }}
              />
            ))}

            {/* Overlay gradient */}
            {/* <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80 z-40 pointer-events-none"></div> */}
          </div>

          {/* Right Side: Scrollable Text Content */}
          <div className="w-full md:w-1/2 md:pb-[30vh]">
            {features.map((feat, index) => {
              const IconComponent = feat.Icon;

              return (
                <div
                  key={`block-${feat.id}`}
                  data-index={feat.id}
                  ref={(el) => (blockRefs.current[index] = el)}
                  // LOGIC: Only the active block is visible. Others are opacity-0 and pushed down.
                  className={`min-h-[100vh] flex flex-col justify-center transition-all duration-[600ms] ${
                    activeFeature === feat.id
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${feat.bgGlow} ${feat.borderGlow} ${feat.shadow}`}
                  >
                    <IconComponent className={`w-8 h-8 ${feat.themeColor}`} />
                  </div>
                  <h3 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
                    {feat.title}
                  </h3>
                  <p className="text-[#a1a1aa] text-lg md:text-xl leading-relaxed max-w-md">
                    {feat.desc}
                  </p>

                  {/* Mobile-only image fallback */}
                  <div className="md:hidden w-full h-[250px] mt-8 rounded-2xl overflow-hidden border border-white/10">
                    <img
                      src={feat.image}
                      alt={feat.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
