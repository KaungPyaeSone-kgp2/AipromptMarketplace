import React from "react";

export default function Favorites() {
  return (
    <div className="glass-panel p-8">
      <p className="text-xs font-black uppercase tracking-widest text-violet-300">
        Favorites
      </p>
      <h1 className="mt-1 text-2xl font-black text-white">Your saved prompts</h1>
      <p className="mt-3 text-sm text-slate-400">
        Wishlist and starred prompts will appear here after the database is
        connected.
      </p>
    </div>
  );
}
