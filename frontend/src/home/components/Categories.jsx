import {
  Flame,
  Crown,
  Medal,
  Award,
  Star,
  Bookmark,
  ArrowRight,
} from "lucide-react";

export default function Categories({ data = {}, isLoading }) {
  const prompts = data.prompts || [];

  const topPrompts = [...prompts]
    .sort((a, b) => Number(b.average_rating) - Number(a.average_rating))
    .slice(0, 3);

  const prompt1 = topPrompts[0];
  const prompt2 = topPrompts[1];
  const prompt3 = topPrompts[2];

  return (
    <div
      id="categories"
      className="relative w-full z-30 bg-[#050505] pt-20 pb-28 border-t border-white/5 scroll-mt-[80px]"
    >
      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 mb-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fca311]/10 text-[#fca311] text-sm font-semibold mb-4 border border-[#fca311]/20 shadow-[0_0_15px_rgba(252,163,17,0.15)]">
          <Flame className="w-4 h-4" /> Trending Now
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Top 3 Highest Rated Prompts
        </h2>
        <p className="text-[#a1a1aa] text-base md:text-lg max-w-2xl">
          Explore our crown-jewel prompt configurations, calculated directly by
          community feedback and live ratings.
        </p>
      </div>

      {/* Loading Skeleton handling */}
      {isLoading ? (
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="w-full h-[450px] rounded-2xl bg-white/5 animate-pulse border border-white/5"
            ></div>
          ))}
        </div>
      ) : (
        /* BENTO GRID LAYOUT MATCHING REFERENCE */
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[600px]">
            {/* Rank #1 Prompt (Large - Spans 2 Columns) */}
            {prompt1 && (
              <a
                href={`/prompt/${prompt1.slug}`}
                className="lg:col-span-2 block relative w-full h-[400px] lg:h-full rounded-[24px] overflow-hidden group border border-white/10 bg-[#0a0a0a] transition-all duration-500 hover:border-[#fca311]/50 hover:shadow-[0_0_40px_rgba(252,163,17,0.1)]"
              >
                {/* Prompt Cover Image */}
                <img
                  src={prompt1.thumbnail}
                  alt={prompt1.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10"></div>
                <div className="absolute inset-0 z-10 bg-[#fca311]/0 group-hover:bg-[#fca311]/10 transition-colors duration-500"></div>

                {/* NOT Hovered UI Status */}
                <div className="absolute inset-0 p-8 flex flex-col justify-between items-start transition-all duration-300 opacity-100 group-hover:opacity-0 group-hover:scale-95 pointer-events-none z-20">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-[#fca311]">
                    {prompt1.model_type}
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#fca311]/20 border border-[#fca311]/40 flex items-center justify-center text-[#fca311] shadow-[0_0_20px_rgba(252,163,17,0.3)] backdrop-blur-sm">
                      <Crown className="w-7 h-7 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#a1a1aa] uppercase tracking-widest font-bold block">
                        Top Performing
                      </span>
                      <h3 className="text-3xl font-black text-white">
                        Rank #1
                      </h3>
                    </div>
                  </div>
                </div>

                {/* HOVERED UI Status */}
                <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 z-20 h-full">
                  <div className="mb-auto flex justify-between items-center w-full">
                    <span className="px-3 py-1 rounded-full bg-[#fca311]/20 border border-[#fca311]/30 text-xs font-semibold text-[#fca311]">
                      {prompt1.model_type}
                    </span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/40 border border-white/10 backdrop-blur-md">
                      <Star className="w-3.5 h-3.5 fill-[#fca311] text-[#fca311]" />
                      <span className="text-white text-xs font-bold">
                        {Number(prompt1.average_rating).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-auto w-full">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold mb-4 uppercase tracking-wider">
                        Rank #1
                      </div>
                      <h3 className="text-2xl md:text-4xl font-bold text-white mb-3 group-hover:text-[#fca311] transition-colors drop-shadow-md leading-tight">
                        {prompt1.title}
                      </h3>
                      <p className="text-[#a1a1aa] text-sm md:text-base line-clamp-2 mb-4 leading-relaxed max-w-md">
                        {prompt1.prompt_description}
                      </p>
                      <span className="text-xs text-[#71717a] flex items-center gap-1.5 pt-2">
                        <Bookmark className="w-3.5 h-3.5 text-[#fca311] fill-[#fca311]" />{" "}
                        {prompt1.save_count} Saves
                      </span>
                    </div>

                    {/* Arrow Button */}
                    <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center transform translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.3)] shrink-0 mb-2">
                      <ArrowRight className="w-6 h-6 transform -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                    </div>
                  </div>
                </div>
              </a>
            )}

            {/* Right Side Stack (Categories 2 & 3) */}
            <div className="flex flex-col gap-6 h-auto lg:h-full">
              {/* Rank #2 Prompt */}
              {prompt2 && (
                <a
                  href={`/prompt/${prompt2.slug}`}
                  className="flex-1 block relative w-full h-[250px] lg:h-auto rounded-[24px] overflow-hidden group border border-white/10 bg-[#0a0a0a] transition-all duration-500 hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.1)]"
                >
                  {/* Prompt Cover Image */}
                  <img
                    src={prompt2.thumbnail}
                    alt={prompt2.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10"></div>
                  <div className="absolute inset-0 z-10 bg-blue-500/0 group-hover:bg-blue-500/15 transition-colors duration-500"></div>

                  {/* NOT Hovered UI Status */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-between items-start transition-all duration-300 opacity-100 group-hover:opacity-0 group-hover:scale-95 pointer-events-none z-20">
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-blue-400">
                      {prompt2.model_type}
                    </span>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)] backdrop-blur-sm">
                        <Medal className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#a1a1aa] uppercase tracking-widest font-bold block">
                          Highly Rated
                        </span>
                        <h3 className="text-2xl font-black text-white">
                          Rank #2
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* HOVERED UI Status */}
                  <div className="absolute inset-0 p-6 md:p-8 z-20 flex justify-between items-end transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 h-full w-full">
                    <div className="flex flex-col justify-end h-full w-full">
                      <div className="mb-auto flex justify-between items-center w-full">
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-xs font-semibold text-blue-400">
                          {prompt2.model_type}
                        </span>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/40 border border-white/10 backdrop-blur-md">
                          <Star className="w-3.5 h-3.5 fill-blue-400 text-blue-400" />
                          <span className="text-white text-xs font-bold">
                            {Number(prompt2.average_rating).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-end w-full mt-4">
                        <div>
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold mb-3 uppercase tracking-wider">
                            Rank #2
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-blue-400 transition-colors drop-shadow-md leading-tight">
                            {prompt2.title}
                          </h3>
                          <span className="text-[11px] text-[#71717a] flex items-center gap-1 mt-1">
                            <Bookmark className="w-3 h-3 text-blue-400 fill-blue-400" />{" "}
                            {prompt2.save_count} Saves
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 shrink-0">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              )}

              {/* Rank #3 Prompt */}
              {prompt3 && (
                <a
                  href={`/prompt/${prompt3.slug}`}
                  className="flex-1 block relative w-full h-[250px] lg:h-auto rounded-[24px] overflow-hidden group border border-white/10 bg-[#0a0a0a] transition-all duration-500 hover:border-purple-500/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.1)]"
                >
                  {/* Prompt Cover Image */}
                  <img
                    src={prompt3.thumbnail}
                    alt={prompt3.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10"></div>
                  <div className="absolute inset-0 z-10 bg-purple-500/0 group-hover:bg-purple-500/15 transition-colors duration-500"></div>

                  {/* NOT Hovered UI Status */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-between items-start transition-all duration-300 opacity-100 group-hover:opacity-0 group-hover:scale-95 pointer-events-none z-20">
                    <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-semibold text-purple-400">
                      {prompt3.model_type}
                    </span>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)] backdrop-blur-sm">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#a1a1aa] uppercase tracking-widest font-bold block">
                          Community Choice
                        </span>
                        <h3 className="text-2xl font-black text-white">
                          Rank #3
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* HOVERED UI Status */}
                  <div className="absolute inset-0 p-6 md:p-8 z-20 flex justify-between items-end transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 h-full w-full">
                    <div className="flex flex-col justify-end h-full w-full">
                      <div className="mb-auto flex justify-between items-center w-full">
                        <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-semibold text-purple-400">
                          {prompt3.model_type}
                        </span>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/40 border border-white/10 backdrop-blur-md">
                          <Star className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
                          <span className="text-white text-xs font-bold">
                            {Number(prompt3.average_rating).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-end w-full mt-4">
                        <div>
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold mb-3 uppercase tracking-wider">
                            Rank #3
                          </div>
                          <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-purple-400 transition-colors drop-shadow-md leading-tight">
                            {prompt3.title}
                          </h3>
                          <span className="text-[11px] text-[#71717a] flex items-center gap-1 mt-1">
                            <Bookmark className="w-3 h-3 text-purple-400 fill-purple-400" />{" "}
                            {prompt3.save_count} Saves
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 shrink-0">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Button - Points directly to /explore page */}
      <div className="mt-16 w-full flex justify-center px-6">
        <a
          href="/explore?ref=categories"
          className="inline-flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-[#333] text-white font-bold text-base md:text-lg rounded-full hover:bg-white hover:text-black hover:border-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)] transform hover:-translate-y-1 group"
        >
          Explore All Prompts
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </div>
  );
}
