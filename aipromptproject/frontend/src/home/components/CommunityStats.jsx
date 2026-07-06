// src/components/CommunityStats.jsx

export default function CommunityStats() {
  // Stat cards array configuration for easy maintenance or dynamic integration later
  const statsData = [
    {
      id: 1,
      value: "10K+",
      label: "Active Creators",
      borderColor: "hover:border-[#fca311]/30",
      textColor: "text-[#fca311]",
    },
    {
      id: 2,
      value: "50K+",
      label: "Generated Prompts",
      borderColor: "hover:border-[#3b82f6]/30",
      textColor: "text-[#3b82f6]",
    },
    {
      id: 3,
      value: "99%",
      label: "Satisfaction Rate",
      borderColor: "hover:border-[#10a37f]/30",
      textColor: "text-[#10a37f]",
    },
  ];

  // Static array of community member avatars to keep your section lively
  const avatars = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
  ];

  return (
    <section
      id="community-stats"
      className="w-full max-w-[1400px] mx-auto px-6 md:px-10 py-20 text-center relative z-40"
    >
      {/* Dynamic Glow Backdrops */}
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#fca311]/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2"></div>

      {/* Avatar Stack Section */}
      <div className="flex justify-center mb-6 relative z-10">
        <div className="flex -space-x-4 hover:-space-x-2 transition-all duration-300">
          {avatars.map((avatar) => (
            <img
              key={avatar.id}
              className="w-14 h-14 rounded-full border-[3px] border-[#050505] object-cover"
              src={avatar.url}
              alt="Community Member"
            />
          ))}
          <div className="w-14 h-14 rounded-full border-[3px] border-[#050505] bg-[#fca311] text-black font-black flex items-center justify-center text-sm shadow-[0_0_15px_rgba(252,163,17,0.5)] z-10 relative">
            +10K
          </div>
        </div>
      </div>

      {/* Typography Elements */}
      <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 relative z-10 tracking-tight">
        Trusted by a Global Community
      </h2>
      <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto mb-16 relative z-10">
        Join thousands of prompt engineers who are already creating the future
        of AI art and text.
      </p>

      {/* Stat Cards Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {statsData.map((stat) => (
          <div
            key={stat.id}
            className={`p-8 rounded-[24px] bg-[#111] border border-white/5 ${stat.borderColor} transition-colors duration-300 shadow-lg`}
          >
            <h3 className={`text-5xl font-black ${stat.textColor} mb-3`}>
              {stat.value}
            </h3>
            <p className="text-[#a1a1aa] uppercase tracking-widest text-sm font-bold">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
