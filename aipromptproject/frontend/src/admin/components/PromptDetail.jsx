// import {
//   ArrowLeft,
//   Mail,
//   Calendar,
//   Bookmark,
//   MessageSquare,
//   Star,
//   UserCircle,
// } from "lucide-react";
// import PromptAnalytics from "./PromptAnalytics.jsx";
// import { StatCard } from "./StatCard.jsx";

// export const PromptDetail = ({ prompt, onBack }) => {
//   const isActive = prompt.status === "Active";

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-end">
//         <button
//           onClick={onBack}
//           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
//           style={{
//             color: "#A78BFA",
//             border: "1px solid rgba(139,92,246,0.4)",
//             background: "rgba(139,92,246,0.08)",
//           }}
//         >
//           <ArrowLeft size={16} />
//           Back
//         </button>
//       </div>

//       {/* Section 1: Prompt info */}
//       <div
//         className="rounded-2xl p-6 grid md:grid-cols-[280px_1fr] gap-6"
//         style={{
//           background:
//             "linear-gradient(180deg, rgba(17,24,39,0.9), rgba(11,16,32,0.9))",
//           border: "1px solid rgba(139,92,246,0.25)",
//           boxShadow: "0 20px 60px -30px rgba(139,92,246,0.45)",
//         }}
//       >
//         <img
//           src={prompt.thumbnail}
//           alt={prompt.title}
//           className="w-full h-64 md:h-full object-cover rounded-xl"
//           style={{ border: "1px solid rgba(139,92,246,0.3)" }}
//         />
//         <div className="flex flex-col gap-4">
//           <div className="flex items-start justify-between gap-4 flex-wrap">
//             <h2 className="text-2xl font-semibold" style={{ color: "#FFFFFF" }}>
//               {prompt.title}
//             </h2>
//             <span
//               className="px-3 py-1 rounded-full text-xs font-medium"
//               style={{
//                 background: isActive
//                   ? "rgba(139,92,246,0.15)"
//                   : "rgba(239,68,68,0.15)",
//                 color: isActive ? "#A78BFA" : "#F87171",
//                 border: `1px solid ${isActive ? "rgba(139,92,246,0.4)" : "rgba(239,68,68,0.4)"}`,
//               }}
//             >
//               {prompt.status}
//             </span>
//           </div>

//           <div
//             className="flex items-center gap-4 p-4 rounded-xl"
//             style={{
//               background: "rgba(3,7,18,0.5)",
//               border: "1px solid rgba(139,92,246,0.15)",
//             }}
//           >
//             {prompt.creator_image ? (
//               <img
//                 src={prompt.creator_image}
//                 alt={prompt.creator_name}
//                 className="w-14 h-14 rounded-full object-cover"
//                 style={{ border: "2px solid rgba(139,92,246,0.4)" }}
//               />
//             ) : (
//               <div
//                 className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-gray-400"
//                 style={{ border: "2px solid rgba(139,92,246,0.2)" }}
//               >
//                 <UserCircle size={32} />
//               </div>
//             )}

//             <div className="flex flex-col">
//               <span className="font-semibold" style={{ color: "#FFFFFF" }}>
//                 {prompt.creator_name}
//               </span>
//               <span
//                 className="text-sm flex items-center gap-1.5"
//                 style={{ color: "#9CA3AF" }}
//               >
//                 <Mail size={12} /> {prompt.creator_email}
//               </span>
//             </div>
//           </div>

//           <div
//             className="flex items-center gap-2 text-sm"
//             style={{ color: "#9CA3AF" }}
//           >
//             <Calendar size={14} />
//             <span>
//               Created at {prompt.date} · {prompt.time}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Section 2/3 + Analytics */}
//       <div className="grid lg:grid-cols-2 gap-6">
//         <div className="flex flex-col gap-6">
//           <div
//             className="rounded-2xl p-6"
//             style={{
//               background:
//                 "linear-gradient(180deg, rgba(17,24,39,0.9), rgba(11,16,32,0.9))",
//               border: "1px solid rgba(139,92,246,0.25)",
//             }}
//           >
//             <h3
//               className="text-lg font-semibold mb-3"
//               style={{ color: "#FFFFFF" }}
//             >
//               Prompt Text
//             </h3>
//             <div
//               className="rounded-xl p-4 text-sm leading-relaxed"
//               style={{
//                 background: "rgba(3,7,18,0.7)",
//                 border: "1px solid rgba(139,92,246,0.15)",
//                 color: "#D1D5DB",
//                 minHeight: 140,
//               }}
//             >
//               {prompt.promptText}
//             </div>
//           </div>

//           <div
//             className="rounded-2xl p-6"
//             style={{
//               background:
//                 "linear-gradient(180deg, rgba(17,24,39,0.9), rgba(11,16,32,0.9))",
//               border: "1px solid rgba(139,92,246,0.25)",
//             }}
//           >
//             <h3
//               className="text-lg font-semibold mb-3"
//               style={{ color: "#FFFFFF" }}
//             >
//               Description
//             </h3>
//             <div
//               className="rounded-xl p-4 text-sm leading-relaxed"
//               style={{
//                 background: "rgba(3,7,18,0.7)",
//                 border: "1px solid rgba(139,92,246,0.15)",
//                 color: "#D1D5DB",
//                 minHeight: 120,
//               }}
//             >
//               {prompt.description}
//             </div>
//           </div>
//         </div>

//         <PromptAnalytics data={prompt.analytics} />
//       </div>

//       <div className="grid sm:grid-cols-3 gap-4">
//         <StatCard
//           icon={Bookmark}
//           label="Save Count"
//           value={prompt.stats?.save || 0}
//         />
//         <StatCard
//           icon={MessageSquare}
//           label="Review Count"
//           value={prompt.stats?.review || 0}
//         />
//         <StatCard
//           icon={Star}
//           label="Rating Count"
//           value={prompt.stats?.rating || 0}
//         />
//       </div>
//     </div>
//   );
// };

import {
  ArrowLeft,
  Mail,
  Calendar,
  Bookmark,
  MessageSquare,
  Star,
  UserCircle,
} from "lucide-react";
import PromptAnalytics from "./PromptAnalytics.jsx";
import { StatCard } from "./StatCard.jsx";

export const PromptDetail = ({ prompt, onBack }) => {
  const isActive = prompt.status === "Active";

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] backdrop-blur-md"
          style={{
            color: "#A78BFA",
            border: "1px solid rgba(139,92,246,0.4)",
            background: "rgba(139,92,246,0.08)",
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div
        className="rounded-2xl p-6 grid md:grid-cols-[280px_1fr] gap-6 backdrop-blur-xl"
        style={{
          background:
            "linear-gradient(180deg, rgba(17,24,39,0.7), rgba(11,16,32,0.8))",
          border: "1px solid rgba(139,92,246,0.25)",
          boxShadow: "0 20px 60px -30px rgba(139,92,246,0.45)",
        }}
      >
        <img
          src={prompt.thumbnail}
          alt={prompt.title}
          className="w-full h-64 md:h-full object-cover rounded-xl"
          style={{ border: "1px solid rgba(139,92,246,0.3)" }}
        />
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h2 className="text-2xl font-semibold" style={{ color: "#FFFFFF" }}>
              {prompt.title}
            </h2>
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: isActive
                  ? "rgba(16, 185, 129, 0.15)"
                  : "rgba(239,68,68,0.15)",
                color: isActive ? "#34D399" : "#F87171",
                border: `1px solid ${isActive ? "rgba(16, 185, 129, 0.4)" : "rgba(239,68,68,0.4)"}`,
              }}
            >
              {prompt.status}
            </span>
          </div>

          <div
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{
              background: "rgba(3,7,18,0.4)",
              border: "1px solid rgba(139,92,246,0.15)",
            }}
          >
            {prompt.creator_image ? (
              <img
                src={prompt.creator_image}
                alt={prompt.creator_name}
                className="w-14 h-14 rounded-full object-cover"
                style={{ border: "2px solid rgba(139,92,246,0.4)" }}
              />
            ) : (
              <div
                className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-gray-400"
                style={{ border: "2px solid rgba(139,92,246,0.2)" }}
              >
                <UserCircle size={32} />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-semibold" style={{ color: "#FFFFFF" }}>
                {prompt.creator_name}
              </span>
              <span
                className="text-sm flex items-center gap-1.5"
                style={{ color: "#9CA3AF" }}
              >
                <Mail size={12} /> {prompt.creator_email}
              </span>
            </div>
          </div>

          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: "#9CA3AF" }}
          >
            <Calendar size={14} />
            <span>
              Created at {prompt.date} · {prompt.time}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <div
            className="rounded-2xl p-6 backdrop-blur-md"
            style={{
              background: "rgba(17,24,39,0.6)",
              border: "1px solid rgba(139,92,246,0.25)",
            }}
          >
            <h3
              className="text-lg font-semibold mb-3"
              style={{ color: "#FFFFFF" }}
            >
              Prompt Text
            </h3>
            <div
              className="rounded-xl p-4 text-sm leading-relaxed"
              style={{
                background: "rgba(3,7,18,0.5)",
                border: "1px solid rgba(139,92,246,0.15)",
                color: "#D1D5DB",
                minHeight: 140,
              }}
            >
              {prompt.promptText}
            </div>
          </div>

          <div
            className="rounded-2xl p-6 backdrop-blur-md"
            style={{
              background: "rgba(17,24,39,0.6)",
              border: "1px solid rgba(139,92,246,0.25)",
            }}
          >
            <h3
              className="text-lg font-semibold mb-3"
              style={{ color: "#FFFFFF" }}
            >
              Description
            </h3>
            <div
              className="rounded-xl p-4 text-sm leading-relaxed"
              style={{
                background: "rgba(3,7,18,0.5)",
                border: "1px solid rgba(139,92,246,0.15)",
                color: "#D1D5DB",
                minHeight: 120,
              }}
            >
              {prompt.description}
            </div>
          </div>
        </div>

        {/* Dynamic Chart mapped from the 7-day stats */}
        <PromptAnalytics data={prompt.analytics} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          icon={Bookmark}
          label="Save Count"
          value={prompt.stats?.save || 0}
        />
        <StatCard
          icon={MessageSquare}
          label="Review Count"
          value={prompt.stats?.review || 0}
          accent="#3B82F6"
        />
        <StatCard
          icon={Star}
          label="Rating Count"
          value={prompt.stats?.rating || 0}
          accent="#F59E0B"
        />
      </div>
    </div>
  );
};
