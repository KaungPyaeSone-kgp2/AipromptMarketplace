import React from "react";
import PromptCard from "../components/PromptCard";
import { mockCreatorPrompts } from "../data/mockData";

export default function CreatorHome() {
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
            This is mock frontend data only. No database connection.
          </p>
        </div>

        <button
          type="button"
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-500"
        >
          Create Prompt
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {mockCreatorPrompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} actionLabel="Manage" />
        ))}
      </div>
    </div>
  );
}
