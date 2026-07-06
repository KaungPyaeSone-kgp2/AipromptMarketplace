// import { useState, useEffect } from "react";
// import { RefreshCw } from "lucide-react";
// import { PromptTable } from "../components/PromptTable.jsx";
// import { PromptDetail } from "../components/PromptDetail.jsx";

// export default function PromptManagement() {
//   const [prompts, setPrompts] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [spinning, setSpinning] = useState(false);

//   // --- FETCH PROMPTS API ---
//   const loadPrompts = async (isRefresh = false) => {
//     try {
//       if (isRefresh) setSpinning(true);

//       const API_URL =
//         import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
//       const response = await fetch(`${API_URL}/api/admin/get-prompts.php`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ refresh: isRefresh }),
//       });

//       const result = await response.json();
//       if (result.success && result.data?.prompts) {
//         setPrompts(result.data.prompts);

//         if (selected) {
//           const updatedSelected = result.data.prompts.find(
//             (p) => p.id === selected.id,
//           );
//           if (updatedSelected) setSelected(updatedSelected);
//         }
//       }
//     } catch (error) {
//       console.error("Failed to load prompts", error);
//     } finally {
//       if (isRefresh) {
//         setTimeout(() => setSpinning(false), 600);
//       }
//     }
//   };

//   // Load initially when the component mounts
//   useEffect(() => {
//     loadPrompts();
//   }, []);

//   const handleRefresh = () => {
//     loadPrompts(true);
//   };

//   // --- TOGGLE STATUS API ---
//   const handleToggleStatus = async (id, currentStatus) => {
//     const nextStatus = currentStatus === "Active" ? "Banned" : "Active";

//     // Optimistically update the UI immediately
//     // setPrompts((prev) =>
//     //   prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p)),
//     // );

//     setPrompts((prev) =>
//       prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p)),
//     );
//     if (selected && selected.id === id) {
//       setSelected((prev) => ({ ...prev, status: nextStatus }));
//     }

//     try {
//       const API_URL =
//         import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
//       const response = await fetch(
//         `${API_URL}/api/admin/toggle-prompt-status.php`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ prompt_id: id, new_status: nextStatus }),
//         },
//       );

//       const result = await response.json();

//       // if (!result.success) {
//       //   // Revert if the backend fails
//       //   console.error("Failed to update status on server");
//       //   loadPrompts(true);
//       // }
//       if (!result.success) {
//         console.error("Failed to update status on server");
//         loadPrompts(true); // Revert on fail
//       } else {
//         // Silently pull fresh data from DB to ensure cache cleared and UI is fully synced
//         loadPrompts(true);
//       }
//     } catch (error) {
//       console.error("Network error toggling status", error);
//       loadPrompts(true); // Revert on network error
//     }
//   };

//   return (
//     <div className="min-h-screen w-full">
//       <div className="max-w-8xl mx-auto">
//         {!selected && (
//           <div className="flex items-center justify-between mb-8">
//             <div>
//               <h1
//                 className="text-3xl font-semibold tracking-tight"
//                 style={{ color: "#FFFFFF" }}
//               >
//                 Prompt Management
//               </h1>
//               <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>
//                 Manage, review, and moderate community prompts.
//               </p>
//             </div>
//             <button
//               onClick={handleRefresh}
//               disabled={spinning}
//               className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-70"
//               style={{
//                 background: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
//                 color: "#FFFFFF",
//                 boxShadow: "0 10px 30px -10px rgba(139,92,246,0.6)",
//               }}
//             >
//               <RefreshCw size={16} className={spinning ? "animate-spin" : ""} />
//             </button>
//           </div>
//         )}

//         {selected ? (
//           <PromptDetail prompt={selected} onBack={() => setSelected(null)} />
//         ) : (
//           <PromptTable
//             prompts={prompts}
//             onViewDetail={(p) => setSelected(p)}
//             onToggleStatus={handleToggleStatus}
//           />
//         )}
//       </div>
//     </div>
//   );
// }

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { PromptTable } from "../components/PromptTable.jsx";
import { PromptDetail } from "../components/PromptDetail.jsx";

export default function PromptManagement() {
  const [prompts, setPrompts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [spinning, setSpinning] = useState(false);

  // --- FETCH PROMPTS API (Wrapped in useCallback) ---
  const loadPrompts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setSpinning(true);

      const response = await fetch(`/api/admin/get-prompts.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: isRefresh }),
      });

      const result = await response.json();
      if (result.success && result.data?.prompts) {
        setPrompts(result.data.prompts);

        // Functional state update removes the need to add 'selected' as a hook dependency
        setSelected((prevSelected) => {
          if (!prevSelected) return null;
          return (
            result.data.prompts.find((p) => p.id === prevSelected.id) ||
            prevSelected
          );
        });
      }
    } catch (error) {
      console.error("Failed to load prompts", error);
    } finally {
      if (isRefresh) {
        setTimeout(() => setSpinning(false), 600);
      }
    }
  }, []); // <-- Empty array: this function is now stable and won't trigger infinite loops

  // Load initially when the component mounts
  useEffect(() => {
    // Calling it safely now that it is memoized
    loadPrompts(false);
  }, [loadPrompts]); // <-- Dependency satisfied

  const handleRefresh = () => {
    loadPrompts(true);
  };

  // --- TOGGLE STATUS API ---
  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Banned" : "Active";

    // Optimistically update the UI immediately
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p)),
    );

    setSelected((prev) => {
      if (prev && prev.id === id) {
        return { ...prev, status: nextStatus };
      }
      return prev;
    });

    try {
      const response = await fetch(
        `/api/admin/toggle-prompt-status.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt_id: id, new_status: nextStatus }),
        },
      );

      const result = await response.json();

      if (!result.success) {
        console.error("Failed to update status on server");
        loadPrompts(true);
      } else {
        // Sync cache in background
        loadPrompts(true);
      }
    } catch (error) {
      console.error("Network error toggling status", error);
      loadPrompts(true);
    }
  };

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-8xl mx-auto">
        {!selected && (
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1
                className="text-3xl font-semibold tracking-tight"
                style={{ color: "#FFFFFF" }}
              >
                Prompt Management
              </h1>
              <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>
                Manage, review, and moderate community prompts.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={spinning}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-70"
              style={{
                background: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
                color: "#FFFFFF",
                boxShadow: "0 10px 30px -10px rgba(139,92,246,0.6)",
              }}
            >
              <RefreshCw size={16} className={spinning ? "animate-spin" : ""} />
            </button>
          </div>
        )}

        {selected ? (
          <PromptDetail prompt={selected} onBack={() => setSelected(null)} />
        ) : (
          <PromptTable
            prompts={prompts}
            onViewDetail={(p) => setSelected(p)}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </div>
    </div>
  );
}
