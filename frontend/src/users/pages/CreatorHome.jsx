import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import PromptCard from "../components/PromptCard";
import { fetchCreatorPrompts } from "../services/promptService.js";

export default function CreatorHome() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPrompts() {
      setLoading(true);

      try {
        const data = await fetchCreatorPrompts();
        if (!cancelled) setPrompts(data);
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

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-violet-300">
            Creator Home
          </p>

          <h1 className="mt-1 text-2xl font-black text-white">
            Your Posted Prompts
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Prompt posts from your creator account.
          </p>
        </div>

        <Link
          to="/creator/promptcreate"
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-500"
        >
          Create Prompt
        </Link>
      </div>

      {loading ? (
        <div className="glass-panel p-10 text-center text-sm text-slate-400">
          Loading your posted prompts...
        </div>
      ) : prompts.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} actionLabel="Manage" />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-10 text-center text-sm text-slate-400">
          You have not posted any prompts yet.
        </div>
      )}
    </div>
  );
}
