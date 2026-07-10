import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Plus, Eye, Pencil, X } from "lucide-react";
import { useSocket } from "../../users/context/SocketContext";

function GradientButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-600/30 transition hover:from-violet-400 hover:to-purple-500 hover:shadow-violet-500/40 ${className}`}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, className = "", disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl border border-violet-500/25 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-violet-500/10 hover:text-white disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function IconButton({ icon: Icon, onClick, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-violet-500/25 bg-white/[0.02] text-gray-300 transition hover:border-violet-400/60 hover:bg-violet-500/10 hover:text-white"
    >
      <Icon size={16} />
    </button>
  );
}

function CategoryFormCard({ title, initial, onCancel, onSubmit, submitLabel }) {
  const [name, setName] = useState(initial?.name || "");

  return (
    <div className="rounded-2xl border border-violet-500/25 bg-[#0B1020]/90 p-6 shadow-2xl shadow-violet-900/20 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button
          onClick={onCancel}
          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white/5 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Category Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter category name"
            className="w-full rounded-xl border border-violet-500/20 bg-[#030712] px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <GhostButton onClick={onCancel}>Cancel</GhostButton>
          <GradientButton
            onClick={() => {
              if (!name.trim()) return;
              onSubmit({ name: name.trim() });
            }}
          >
            {submitLabel}
          </GradientButton>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ category, onClose }) {
  // State to manage the toggle of the prompt list
  const [showAll, setShowAll] = useState(false);

  // Determine which prompts to display based on state
  const displayedPrompts = showAll
    ? category.prompts
    : category.prompts?.slice(0, 5) || [];

  return (
    <>
      {/* <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-violet-500/25 bg-[#0B1020] shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-violet-500/15 px-6 py-5">
          <h3 className="text-lg font-semibold text-white">Category Details</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div> */}
      {/* Background Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />

      {/* Panel Container - Add stopPropagation here! */}
      <aside
        onClick={(e) => e.stopPropagation()}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-violet-500/25 bg-[#0B1020] shadow-2xl shadow-black/50"
      >
        <div className="flex items-center justify-between border-b border-violet-500/15 px-6 py-5">
          <h3 className="text-lg font-semibold text-white">Category Details</h3>

          {/* Close Button - Explicitly triggering onClose */}
          <button
            onClick={() => {
              console.log("Close clicked");
              onClose();
            }}
            type="button"
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xl font-semibold text-white">
                {category.name}
              </div>
              <div className="text-sm text-gray-400">Prompt category</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <Stat label="Total Prompts" value={category.total} />
            <Stat
              label="Created At"
              value={`${category.createdAt} · ${category.createdTime}`}
            />
            {/* Newly added Updated At UI */}
            <Stat label="Last Updated" value={category.lastUpdated} />
          </div>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">
                Recent Prompts
              </h4>
              {/* Dynamic Toggle Button */}
              {category.prompts && category.prompts.length > 5 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-xs font-medium text-violet-300 transition hover:text-violet-200"
                >
                  {showAll ? "Show Less" : "View All"}
                </button>
              )}
            </div>
            <ul className="space-y-2">
              {displayedPrompts.length > 0 ? (
                displayedPrompts.map((p, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-violet-500/15 bg-white/[0.02] px-4 py-3 text-sm text-gray-200 transition hover:border-violet-400/40 hover:bg-violet-500/10"
                  >
                    {p}
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500 italic">
                  No prompts yet.
                </li>
              )}
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-violet-500/15 bg-white/[0.02] px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadCategories = useCallback(async (isRefresh = false) => {
    try {
      const response = await fetch(`/api/admin/get-categories.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: isRefresh }),
      });

      const result = await response.json();
      if (result.success && result.data?.categories) {
        setCategories(result.data.categories);
      } else {
        console.error("Backend Error:", result);
        if (result.error) alert(`Database Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  }, []);

  const socket = useSocket();

  useEffect(() => {
    loadCategories(false);
  }, [loadCategories]);

  // Realtime updates listener
  useEffect(() => {
    if (!socket) return;

    const handleCategoriesUpdated = (data) => {
      console.log("Realtime update received for categories:", data);
      loadCategories(true);
    };

    socket.on("categories_updated", handleCategoriesUpdated);

    return () => {
      socket.off("categories_updated", handleCategoriesUpdated);
    };
  }, [socket, loadCategories]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCategories(true);
    setRefreshing(false);
  };

  const handleCreate = async ({ name }) => {
    setAdding(false);
    setRefreshing(true);

    try {
      const response = await fetch(`/api/admin/add-category.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const result = await response.json();
      if (!result.success) alert(result.message);

      await loadCategories(true);
    } catch (error) {
      console.error("Failed to create category", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveEdit = async ({ name }) => {
    const editId = editing.id;
    setEditing(null);
    setRefreshing(true);

    try {
      const response = await fetch(`/api/admin/edit-category.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, name }),
      });

      const result = await response.json();
      if (!result.success) alert(result.message);

      await loadCategories(true);
    } catch (error) {
      console.error("Failed to update category", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-700/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-8xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Category Management
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Manage all prompt categories
            </p>
          </div>
          <div className="flex items-center gap-3">
            <GhostButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </GhostButton>
            <GradientButton onClick={() => setAdding(true)}>
              <Plus size={16} />
              Add Category
            </GradientButton>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-violet-500/25 bg-[#0B1020]/80 shadow-2xl shadow-violet-900/10 backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-violet-500/15 bg-white/[0.02] text-left text-xs uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-4 font-medium">Category Name</th>
                  <th className="px-6 py-4 font-medium">Total Prompts</th>
                  <th className="px-6 py-4 font-medium">Created At</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-12 text-center text-gray-500 text-sm"
                    >
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-violet-500/10 transition last:border-0 hover:bg-violet-500/5"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium text-white">{c.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-sm font-semibold text-violet-200">
                          {c.total.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-200">
                          {c.createdAt}
                        </div>
                        <div className="text-xs text-gray-500">
                          {c.createdTime}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <IconButton
                            icon={Eye}
                            label="View"
                            onClick={() => setViewing(c)}
                          />
                          <IconButton
                            icon={Pencil}
                            label="Edit"
                            onClick={() => setEditing(c)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {(adding || editing) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl">
              {adding && (
                <CategoryFormCard
                  title="Add Category"
                  onCancel={() => setAdding(false)}
                  onSubmit={handleCreate}
                  submitLabel="Create Category"
                />
              )}
              {editing && (
                <CategoryFormCard
                  title="Edit Category"
                  initial={editing}
                  onCancel={() => setEditing(null)}
                  onSubmit={handleSaveEdit}
                  submitLabel="Save Changes"
                />
              )}
            </div>
          </div>
        )}

        {viewing && (
          <DetailPanel category={viewing} onClose={() => setViewing(null)} />
        )}
        {/* {viewing && (
          <DetailPanel
            category={viewing}
            onClose={() => {
              console.log("setViewing(null)");
              setViewing(null);
            }}
          />
        )} */}
      </div>
    </div>
  );
}
