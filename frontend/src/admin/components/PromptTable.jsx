// import { Eye } from "lucide-react";

// export const PromptTable = ({ prompts, onViewDetail, onToggleStatus }) => {
//   return (
//     <div
//       className="rounded-2xl overflow-hidden"
//       style={{
//         background:
//           "linear-gradient(180deg, rgba(17,24,39,0.85), rgba(11,16,32,0.85))",
//         border: "1px solid rgba(139,92,246,0.25)",
//         boxShadow: "0 20px 60px -30px rgba(139,92,246,0.45)",
//       }}
//     >
//       <div className="overflow-x-auto">
//         <table className="w-full text-left">
//           <thead>
//             <tr
//               style={{
//                 color: "#9CA3AF",
//                 borderBottom: "1px solid rgba(139,92,246,0.15)",
//               }}
//             >
//               <th className="px-6 py-4 text-xs uppercase tracking-wider font-medium">
//                 Prompt Title
//               </th>
//               <th className="px-6 py-4 text-xs uppercase tracking-wider font-medium">
//                 Creator
//               </th>
//               <th className="px-6 py-4 text-xs uppercase tracking-wider font-medium">
//                 Created At
//               </th>
//               <th className="px-6 py-4 text-xs uppercase tracking-wider font-medium">
//                 Status
//               </th>
//               <th className="px-6 py-4 text-xs uppercase tracking-wider font-medium">
//                 Detail
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {prompts.map((p) => (
//               <tr
//                 key={p.id}
//                 className="transition-colors hover:bg-white/[0.03]"
//                 style={{
//                   borderBottom: "1px solid rgba(139,92,246,0.08)",
//                   color: "#D1D5DB",
//                 }}
//               >
//                 <td className="px-6 py-5">
//                   <span className="font-medium" style={{ color: "#FFFFFF" }}>
//                     {p.title}
//                   </span>
//                 </td>
//                 <td className="px-6 py-5">
//                   <div className="flex items-center gap-3">
//                     <img
//                       src={p.creator.avatar}
//                       alt={p.creator.name}
//                       className="w-9 h-9 rounded-full object-cover"
//                       style={{ border: "2px solid rgba(139,92,246,0.4)" }}
//                     />
//                     <span className="text-sm">{p.creator.name}</span>
//                   </div>
//                 </td>
//                 <td className="px-6 py-5">
//                   <div className="flex flex-col">
//                     <span className="text-sm" style={{ color: "#FFFFFF" }}>
//                       {p.date}
//                     </span>
//                     <span className="text-xs" style={{ color: "#9CA3AF" }}>
//                       {p.time}
//                     </span>
//                   </div>
//                 </td>
//                 <td className="px-6 py-5">
//                   <button
//                     onClick={() => onToggleStatus(p.id)}
//                     className="px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-opacity hover:opacity-80"
//                     style={{
//                       background: p.active
//                         ? "rgba(139,92,246,0.15)"
//                         : "rgba(239,68,68,0.15)",
//                       color: p.active ? "#A78BFA" : "#F87171",
//                       border: `1px solid ${p.active ? "rgba(139,92,246,0.4)" : "rgba(239,68,68,0.4)"}`,
//                     }}
//                   >
//                     {p.active ? "Active" : "Banned"}
//                   </button>
//                 </td>
//                 <td className="px-6 py-5">
//                   <button
//                     onClick={() => onViewDetail(p)}
//                     className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
//                     style={{
//                       color: "#A78BFA",
//                       border: "1px solid rgba(139,92,246,0.5)",
//                       background: "rgba(139,92,246,0.08)",
//                     }}
//                   >
//                     <Eye size={14} />
//                     View Detail
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

import { Eye, UserCircle } from "lucide-react";

export const PromptTable = ({ prompts, onViewDetail, onToggleStatus }) => {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(17,24,39,0.85), rgba(11,16,32,0.85))",
        border: "1px solid rgba(139,92,246,0.25)",
        boxShadow: "0 20px 60px -30px rgba(139,92,246,0.45)",
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr
              style={{
                color: "#9CA3AF",
                borderBottom: "1px solid rgba(139,92,246,0.15)",
              }}
            >
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-medium">
                Prompt Title
              </th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-medium">
                Creator
              </th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-medium">
                Created At
              </th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-medium">
                Status
              </th>
              <th className="px-6 py-4 text-xs uppercase tracking-wider font-medium">
                Detail
              </th>
            </tr>
          </thead>
          <tbody>
            {!prompts || prompts.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-gray-400 text-sm"
                >
                  No prompts found.
                </td>
              </tr>
            ) : (
              prompts.map((p) => {
                // Determine if it is active based on the backend string
                const isActive = p.status === "Active";

                return (
                  <tr
                    key={p.id}
                    className="transition-colors hover:bg-white/[0.03]"
                    style={{
                      borderBottom: "1px solid rgba(139,92,246,0.08)",
                      color: "#D1D5DB",
                    }}
                  >
                    <td className="px-6 py-5">
                      <span
                        className="font-medium"
                        style={{ color: "#FFFFFF" }}
                      >
                        {p.title}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {p.creator_image ? (
                          <img
                            src={p.creator_image}
                            alt={p.creator_name}
                            className="w-9 h-9 rounded-full object-cover"
                            style={{ border: "2px solid rgba(139,92,246,0.4)" }}
                          />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400"
                            style={{ border: "2px solid rgba(139,92,246,0.2)" }}
                          >
                            <UserCircle size={20} />
                          </div>
                        )}
                        <span className="text-sm">{p.creator_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-gray-300">
                        {p.created_at}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        // Pass both the ID and the current status back to the parent
                        onClick={() => onToggleStatus(p.id, p.status)}
                        className="px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-opacity hover:opacity-80"
                        style={{
                          background: isActive
                            ? "rgba(16, 185, 129, 0.15)"
                            : "rgba(239,68,68,0.15)",
                          color: isActive ? "#34D399" : "#F87171",
                          border: `1px solid ${isActive ? "rgba(16, 185, 129, 0.4)" : "rgba(239,68,68,0.4)"}`,
                        }}
                      >
                        {p.status}
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => onViewDetail(p)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                        style={{
                          color: "#A78BFA",
                          border: "1px solid rgba(139,92,246,0.5)",
                          background: "rgba(139,92,246,0.08)",
                        }}
                      >
                        <Eye size={14} />
                        View Detail
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
