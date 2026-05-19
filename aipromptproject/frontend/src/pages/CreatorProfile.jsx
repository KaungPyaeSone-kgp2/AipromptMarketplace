import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import PromptCard from "../components/PromptCard.jsx";
import { fetchHomePrompts } from "../services/promptService.js";

export default function CreatorProfile() {
  const { creatorId } = useParams();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomePrompts()
      .then((all) => {
        setPrompts(all.filter((p) => String(p.creatorId) === String(creatorId)));
      })
      .finally(() => setLoading(false));
  }, [creatorId]);

  const creator = useMemo(() => prompts[0] ?? null, [prompts]);

  if (loading) {
    return (
      <div className="glass-panel p-10 text-center text-sm text-slate-400">
        Loading creator profile...
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="glass-panel p-10 text-center">
        <p className="text-sm text-slate-400">Creator not found.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-bold text-violet-300">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="surface-strong flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
        <img
          src={creator.creatorAvatarUrl}
          alt={creator.creatorName}
          className="h-20 w-20 rounded-full object-cover ring-4 ring-violet-500/30"
        />
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-violet-300">
            Creator account
          </p>
          <h1 className="text-lg font-black text-white">{creator.creatorName}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {prompts.length} prompt post{prompts.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} variant="grid" />
        ))}
      </div>
    </div>
  );
}
