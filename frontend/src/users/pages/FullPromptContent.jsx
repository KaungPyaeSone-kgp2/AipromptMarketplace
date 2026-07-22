import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { fetchPromptById } from "../services/promptService.js";
import { useToast } from "../components/Toast.jsx";

export default function FullPromptContent() {
  const { promptId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadPrompt() {
      try {
        const data = await fetchPromptById(promptId);
        if (!cancelled) setPrompt(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadPrompt();
    return () => {
      cancelled = true;
    };
  }, [promptId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-sm font-bold text-slate-600 dark:text-slate-400">Loading full content...</div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">Prompt not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-bold text-violet-600 dark:text-violet-400 hover:text-violet-300"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 hover:text-violet-300"
          >
            &larr; Back to Details
          </button>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">{prompt.title}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Full Prompt Content</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-300 dark:border-slate-700/60 bg-slate-100 dark:bg-[#0b0f19] shadow-2xl backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-800/80 bg-slate-200 dark:bg-[#070a11] px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500/80"></span>
            <span className="h-3 w-3 rounded-full bg-amber-500/80"></span>
            <span className="h-3 w-3 rounded-full bg-emerald-500/80"></span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(prompt.promptText || "");
              showToast("Copied to clipboard!", "success");
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-2 rounded-lg bg-violet-600/20 px-3 py-1.5 text-xs font-bold text-violet-700 dark:text-violet-300 transition hover:bg-violet-600/40"
          >
            {copied ? (
              <>
                <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>Copy Content</span>
              </>
            )}
          </button>
        </div>

        <div
          className="p-6 font-mono text-sm leading-loose text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words md:p-10"
          dangerouslySetInnerHTML={(() => {
            let text = prompt.promptText || "No content provided.";
            let escapedText = text
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;");
            const vars = prompt.promptVariables || [];
            vars.forEach((v) => {
              if (!v.name) return;
              let safeName = v.name
                .trim()
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const regex = new RegExp(`\\[?${safeName}\\]?`, "gi");
              escapedText = escapedText.replace(regex, (match) => {
                return `<span class="rounded font-bold text-slate-900 dark:text-white shadow-sm" style="background-color: ${v.color || '#8b5cf6'}; padding: 0.1rem 0.4rem;">${match}</span>`;
              });
            });
            return { __html: escapedText };
          })()}
        />
      </div>
    </div>
  );
}
