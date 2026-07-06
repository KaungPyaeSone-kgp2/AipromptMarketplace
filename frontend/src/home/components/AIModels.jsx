// src/components/AIModels.jsx
import { useNavigate } from "react-router";

import midjourney from "../../assets/midjourney.JPEG";
import chatgpt from "../../assets/chatgpt.JPEG";
import gemini from "../../assets/gemini.JPEG";
import claude from "../../assets/claude.JPEG";
import stablediffusion from "../../assets/stablediffusion.JPEG";

export default function AIModels() {
  const navigate = useNavigate();

  // Array of AI Models for easy mapping and maintenance
  const aiModels = [
    {
      id: "midjourney",
      name: "Midjourney",
      image: midjourney, // Update this path to your actual assets folder
      color: "#fca311",
      link: "/explore?model=Midjourney&ref=ai-models",
    },
    {
      id: "chatgpt",
      name: "ChatGPT",
      image: chatgpt,
      color: "#10a37f",
      link: "/explore?model=ChatGPT&ref=ai-models",
    },
    {
      id: "gemini",
      name: "Gemini",
      image: gemini,
      color: "#c084fc",
      link: "/explore?model=Gemini&ref=ai-models",
    },
    {
      id: "claude",
      name: "Claude",
      image: claude,
      color: "#d97757",
      link: "/explore?model=Claude&ref=ai-models",
    },
    {
      id: "stablediffusion",
      name: "Stable Diffusion",
      image: stablediffusion,
      color: "#3b82f6",
      link: "/explore?model=StableDiffusion&ref=ai-models",
    },
  ];

  return (
    <section
      id="ai-models"
      className="w-full max-w-[1400px] mx-auto px-6 md:px-10 py-16 z-30"
    >
      {/* Header */}
      <div className="mb-10 flex flex-col items-center text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
          Explore AI Models
        </h2>
        <p className="text-[#71717a]">
          Discover prompts dedicated to the world's leading AI systems.
        </p>
      </div>

      {/* The parent 'group' class enables the "dim others on hover" effect. 
        When you hover over the container, all child cards dim, but the specific 
        card you hover over overrides the dimming with '!opacity-100'
      */}
      <div className="grid grid-cols-1 md:grid-cols-5 h-[400px] md:h-[500px] gap-4 group">
        {aiModels.map((model) => (
          <div
            key={model.id}
            onClick={() => navigate(model.link)}
            className="relative overflow-hidden rounded-xl cursor-pointer group/card md:grayscale-[0.8] md:opacity-80 md:group-hover:opacity-40 md:hover:!opacity-100 md:hover:!grayscale-0 transition-all duration-500 bg-[#0a0a0a] border border-white/5 hover:border-white/20 flex flex-col items-center justify-center"
          >
            {/* Colored Glow Backdrop */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-[60px] opacity-20 group-hover/card:opacity-60 transition-opacity duration-700 pointer-events-none z-0"
              style={{ backgroundColor: model.color }}
            ></div>

            {/* Background Image */}
            <img
              src={model.image}
              alt={`${model.name} Logo`}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/card:opacity-100 transition-all duration-700 group-hover/card:scale-110 z-0"
            />

            {/* Bottom Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/10 to-transparent z-10 pointer-events-none"></div>

            {/* Text Content & Button */}
            <div className="absolute inset-0 flex flex-col items-start justify-end p-6 md:p-8 pointer-events-none z-20">
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-widest transition-transform duration-500 group-hover/card:-translate-y-2 drop-shadow-md">
                {model.name}
              </h3>

              {/* Expanding Colored Line */}
              <div
                className="w-8 h-[2px] bg-white/40 my-4 transition-all duration-500 group-hover/card:w-16"
                style={{ backgroundColor: "transparent" }} // Let CSS transitions handle the color swap gracefully
              >
                <div
                  className="w-full h-full transition-colors duration-500 group-hover/card:bg-current"
                  style={{ color: model.color }}
                >
                  <div className="w-full h-full bg-white/40 group-hover/card:hidden"></div>
                  <div
                    className="w-full h-full hidden group-hover/card:block"
                    style={{ backgroundColor: model.color }}
                  ></div>
                </div>
              </div>

              {/* Reveal Button */}
              <button
                className="opacity-0 -translate-x-4 group-hover/card:opacity-100 group-hover/card:translate-x-0 transition-all duration-500 ease-out border text-white px-4 py-2 hover:text-white font-medium text-xs tracking-[0.2em] pointer-events-auto backdrop-blur-sm"
                style={{
                  borderColor: `${model.color}80`, // 50% opacity hex
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = model.color;
                  e.currentTarget.style.color = "#000"; // Assuming dark text looks better on these bright colors
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#fff";
                }}
              >
                MORE +
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
