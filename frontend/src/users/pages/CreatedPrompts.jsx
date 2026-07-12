import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import PromptCard from "../components/PromptCard";
import { fetchCreatorPrompts, fetchDraftPrompts } from "../services/promptService.js";

export default function CreatedPrompts() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("published");

  useEffect(() => {
    let cancelled = false;

    async function loadPrompts() {
      setLoading(true);

      try {
        const [published, drafts] = await Promise.all([
          fetchCreatorPrompts(),
          fetchDraftPrompts()
        ]);
        if (!cancelled) setPrompts([...published, ...drafts]);
      } catch (error) {
        console.error("Failed to load creator prompts", error);
        if (!cancelled) setPrompts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPrompts();

    return () => {
      cancelled = true;
    };
  }, []);

  const publishedPrompts = prompts.filter(p => (p.visibility || "").toLowerCase() !== "draft");
  const draftPrompts = prompts.filter(p => (p.visibility || "").toLowerCase() === "draft");

  const displayedPrompts = tab === "published" ? publishedPrompts : draftPrompts;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mt-1 text-4xl font-black text-violet-600 dark:text-violet-400">
            Created Prompts
          </h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Manage your prompts and track their performance.
          </p>
        </div>

        <Link
          to="/user/createpost"
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-slate-900 dark:text-white transition hover:bg-violet-500"
        >
          Create Prompt
        </Link>
      </div>

      <div className="flex gap-2 border-b border-slate-400/50 dark:border-slate-700/50 pb-4">
        <button
          type="button"
          onClick={() => setTab("published")}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition ${tab === "published"
            ? "bg-violet-600/20 text-violet-700 dark:text-violet-300 ring-1 ring-violet-500/50"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
        >
          Published ({publishedPrompts.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("drafts")}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition ${tab === "drafts"
            ? "bg-violet-600/20 text-violet-700 dark:text-violet-300 ring-1 ring-violet-500/50"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
        >
          Drafts ({draftPrompts.length})
        </button>
      </div>

      {loading ? (
        <div className="glass-panel p-10 text-center text-sm text-slate-600 dark:text-slate-400">
          Loading your prompts...
        </div>
      ) : displayedPrompts.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {displayedPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              actionLabel="Edit Prompt"
              actionTo={`/user/createpost/${prompt.id}`}
              showVisibilityBadge={true}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-10 text-center text-sm text-slate-600 dark:text-slate-400">
          You have no {tab} prompts yet.
        </div>
      )}
    </div>
  );
}
