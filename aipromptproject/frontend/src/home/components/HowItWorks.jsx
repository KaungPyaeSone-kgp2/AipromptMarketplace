import { useState, useEffect, useRef } from "react";
import { Search, Copy, Wand2 } from "lucide-react";
import "./CSS/how_it_works.css";

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0); // 0 = Default, 1-3 = Steps
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Intersection Observer to trigger the pop-in animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.boundingClientRect.top > 0) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.4 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  // Calculate Wheel Rotation
  const getWheelRotation = () => {
    if (activeStep === 1) return 45;
    if (activeStep === 2) return 0;
    if (activeStep === 3) return -45;
    return 0; // Default
  };

  // Calculate Node Counter-Rotation so icons stay upright
  const getNodeTransform = (stepNum) => {
    let baseAngle = 0;
    if (stepNum === 1) baseAngle = -45;
    if (stepNum === 2) baseAngle = 0;
    if (stepNum === 3) baseAngle = 45;

    const targetRotation = getWheelRotation();
    const scaleVal = activeStep === stepNum ? 1.5 : 1;

    return `rotate(${-(baseAngle + targetRotation)}deg) scale(${scaleVal})`;
  };

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative w-full max-w-[1400px] mx-auto px-6 md:px-10 py-20 lg:py-28 z-30 overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[500px]">
        {/* Left Side: Dial */}
        <div className="relative h-[600px] md:h-[700px] flex items-center justify-start pointer-events-none">
          <div
            className={`absolute dial-circle rounded-full border border-white/10 border-dashed pointer-events-none transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${!isVisible ? "pop-hidden" : "opacity-100"}`}
            style={{ transform: `rotate(${getWheelRotation()}deg)` }}
          >
            {/* Step 1 Node */}
            <div
              className={`step-pos-wrapper absolute top-1/2 left-1/2 w-0 h-0 pointer-events-none step-pos-1 transition-all duration-700 ease-out delay-200 ${!isVisible ? "pop-hidden" : ""}`}
            >
              <div
                className={`item-node pointer-events-auto rounded-full flex items-center justify-center cursor-pointer transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] relative group
                  ${activeStep === 1 ? "bg-[#111] border-2 border-[#c084fc] shadow-[0_0_30px_rgba(192,132,252,0.4)]" : "bg-[#0a0a0a] border border-white/10 hover:border-[#c084fc]/50 hover:shadow-[0_0_20px_rgba(192,132,252,0.1)]"}`}
                style={{
                  width: "120px",
                  height: "120px",
                  margin: "-60px 0 0 -60px",
                  transform: getNodeTransform(1),
                }}
                onClick={() => setActiveStep(1)}
              >
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-[#c084fc] text-black font-bold text-base flex items-center justify-center border-4 border-[#050505] shadow-lg">
                  1
                </div>
                <Search
                  className={`w-9 h-9 transition-colors duration-500 ${activeStep === 1 ? "text-[#c084fc]" : "text-white group-hover:text-[#c084fc]"}`}
                />
              </div>
            </div>

            {/* Step 2 Node */}
            <div
              className={`step-pos-wrapper absolute top-1/2 left-1/2 w-0 h-0 pointer-events-none step-pos-2 transition-all duration-700 ease-out delay-100 ${!isVisible ? "pop-hidden" : ""}`}
            >
              <div
                className={`item-node pointer-events-auto rounded-full flex items-center justify-center cursor-pointer transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] relative group
                  ${activeStep === 2 ? "bg-[#111] border-2 border-[#fca311] shadow-[0_0_30px_rgba(252,163,17,0.4)]" : "bg-[#0a0a0a] border border-white/10 hover:border-[#fca311]/50 hover:shadow-[0_0_20px_rgba(252,163,17,0.1)]"}`}
                style={{
                  width: "120px",
                  height: "120px",
                  margin: "-60px 0 0 -60px",
                  transform: getNodeTransform(2),
                }}
                onClick={() => setActiveStep(2)}
              >
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-[#fca311] text-black font-bold text-base flex items-center justify-center border-4 border-[#050505] shadow-lg">
                  2
                </div>
                <Copy
                  className={`w-9 h-9 transition-colors duration-500 ${activeStep === 2 ? "text-[#fca311]" : "text-white group-hover:text-[#fca311]"}`}
                />
              </div>
            </div>

            {/* Step 3 Node */}
            <div
              className={`step-pos-wrapper absolute top-1/2 left-1/2 w-0 h-0 pointer-events-none step-pos-3 transition-all duration-700 ease-out ${!isVisible ? "pop-hidden" : ""}`}
            >
              <div
                className={`item-node pointer-events-auto rounded-full flex items-center justify-center cursor-pointer transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] relative group
                  ${activeStep === 3 ? "bg-[#111] border-2 border-white shadow-[0_0_30px_rgba(255,255,255,0.4)]" : "bg-[#0a0a0a] border border-white/10 hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"}`}
                style={{
                  width: "120px",
                  height: "120px",
                  margin: "-60px 0 0 -60px",
                  transform: getNodeTransform(3),
                }}
                onClick={() => setActiveStep(3)}
              >
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white text-black font-bold text-base flex items-center justify-center border-4 border-[#050505] shadow-lg">
                  3
                </div>
                <Wand2
                  className={`w-9 h-9 transition-colors duration-500 ${activeStep === 3 ? "text-gray-300" : "text-white group-hover:text-gray-300"}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Content Box Elements */}
        <div className="relative w-full h-[350px] flex items-center">
          {/* Default Content Layout */}
          <div
            className={`absolute inset-0 flex flex-col justify-center text-left transition-all duration-700 ease-in-out transform ${activeStep === 0 && isVisible ? "translate-x-0 opacity-100 pointer-events-auto" : "translate-x-12 opacity-0 pointer-events-none"}`}
          >
            <h2 className="text-[#fca311] font-bold uppercase text-4xl mb-4 block">
              Simple Process
            </h2>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
              How Dream Key Works
            </h2>
            <p className="text-[#a1a1aa] text-lg max-w-[500px] leading-relaxed">
              Start generating world-class AI content in seconds. No payments,
              no coins, just pure creativity. Click a step on the left to see
              details.
            </p>
          </div>

          {/* Step 1 Dynamic Content Window */}
          <div
            className={`absolute inset-0 flex flex-col justify-center text-left transition-all duration-500 ease-in-out transform ${activeStep === 1 ? "translate-x-0 opacity-100 pointer-events-auto" : "translate-x-12 opacity-0 pointer-events-none"}`}
          >
            <h2 className="text-[#c084fc] font-bold uppercase text-4xl mb-4 block">
              Step 1
            </h2>
            <div className="w-16 h-16 rounded-2xl bg-[#c084fc]/10 text-[#c084fc] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(192,132,252,0.15)]">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">
              Discover Prompts
            </h3>
            <p className="text-[#a1a1aa] text-lg leading-relaxed max-w-[450px]">
              Browse our curated library of top-tier prompts for Midjourney,
              ChatGPT, Claude, and more. Filter by category or AI model to find
              exactly what you need.
            </p>
          </div>

          {/* Step 2 Dynamic Content Window */}
          <div
            className={`absolute inset-0 flex flex-col justify-center text-left transition-all duration-500 ease-in-out transform ${activeStep === 2 ? "translate-x-0 opacity-100 pointer-events-auto" : "translate-x-12 opacity-0 pointer-events-none"}`}
          >
            <h2 className="text-[#fca311] font-bold uppercase text-4xl mb-4 block">
              Step 2
            </h2>
            <div className="w-16 h-16 rounded-2xl bg-[#fca311]/10 text-[#fca311] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(252,163,17,0.15)]">
              <Copy className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">
              Copy & Customize
            </h3>
            <p className="text-[#a1a1aa] text-lg leading-relaxed max-w-[450px]">
              Copy the prompt with a single click. Review the detailed
              instructions provided by the creator, and tweak the variables or
              keywords to fit your specific needs.
            </p>
          </div>

          {/* Step 3 Dynamic Content Window */}
          <div
            className={`absolute inset-0 flex flex-col justify-center text-left transition-all duration-500 ease-in-out transform ${activeStep === 3 ? "translate-x-0 opacity-100 pointer-events-auto" : "translate-x-12 opacity-0 pointer-events-none"}`}
          >
            <h2 className="text-white font-bold uppercase text-4xl mb-4 block">
              Step 3
            </h2>
            <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.15)]">
              <Wand2 className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Generate</h3>
            <p className="text-[#a1a1aa] text-lg leading-relaxed max-w-[450px]">
              Paste the customized prompt into your favorite AI tool and watch
              it generate stunning images or highly accurate text.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
