import React from "react";
import Tag from "./Tag.jsx";

export default function PromptCard({
  prompt,
  actionLabel = "View Prompt",
  variant = "detailed",
}) {
  if (variant === "grid") {
    return (
      <article className="surface overflow-hidden transition hover:-translate-y-0.5 hover:border-violet-400/40">
        <div
          className="flex aspect-[4/3] items-center justify-center border-b border-dashed border-slate-700/50"
          style={{
            background: "rgba(2, 6, 23, 0.55)",
            color: "var(--muted-2)",
          }}
        >
          {prompt.imageUrl ? (
            <img
              src={prompt.imageUrl}
              alt={prompt.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold">Prompt Image</span>
          )}
        </div>
        <h3 className="line-clamp-2 px-4 py-3 text-sm font-bold text-white">
          {prompt.title}
        </h3>
      </article>
    );
  }

  return (
    <article className="surface overflow-hidden p-5 transition hover:-translate-y-0.5 hover:border-violet-400/40">
      <div
        className="mb-4 flex h-40 items-center justify-center rounded-2xl border border-dashed"
        style={{
          background: "rgba(2, 6, 23, 0.45)",
          borderColor: "rgba(148, 163, 184, 0.18)",
          color: "var(--muted-2)",
        }}
      >
        {prompt.imageUrl ? (
          <img
            src={prompt.imageUrl}
            alt={prompt.title}
            className="h-full w-full rounded-2xl object-cover"
          />
        ) : (
          "Prompt Image"
        )}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="line-clamp-1 text-base font-bold text-white">
            {prompt.title}
          </h3>
          {prompt.creator && (
            <p className="mt-1 text-xs text-slate-500">by {prompt.creator}</p>
          )}
        </div>

        {typeof prompt.rating === "number" && (
          <span className="badge-pill bg-yellow-500/15 text-yellow-300">
            ★ {prompt.rating}
          </span>
        )}
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
        {prompt.description || prompt.promptText}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {prompt.model && <Tag label={prompt.model} />}
        {prompt.category && <Tag label={prompt.category} />}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        {typeof prompt.price === "number" ? (
          <p className="text-sm font-bold text-violet-300">
            {prompt.price} coins
          </p>
        ) : (
          <p className="text-xs text-slate-500">
            {prompt.purchasedAt ? `Purchased ${prompt.purchasedAt}` : "Ready"}
          </p>
        )}

        <button
          type="button"
          className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-500"
        >
          {actionLabel}
        </button>
      </div>
    </article>
  );
}

