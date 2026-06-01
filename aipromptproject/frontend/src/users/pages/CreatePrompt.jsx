import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  fetchCategoryOptions,
  fetchPromptById,
  createPrompt,
  updatePrompt,
} from "../services/promptService.js";
import { getCurrentUserId } from "../services/currentUser.js";

const MODEL_TYPES = ["ChatGPT", "Claude", "Gemini", "Midjourney", "StableDiffusion"];
const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e",
  "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899",
];

export default function CreatePrompt() {
  const navigate = useNavigate();
  const { promptId } = useParams();
  const isEditMode = Boolean(promptId);
  const fileInputRef = useRef(null);
  const backdropRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [variables, setVariables] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    categoryId: "",
    modelType: MODEL_TYPES[0],
    saleCoin: 0,
    thumbnail: null,
  });

  const addVariable = () => {
    setVariables((current) => [
      ...current,
      { name: "", color: PRESET_COLORS[current.length % PRESET_COLORS.length] },
    ]);
  };

  const updateVariable = (index, field, value) => {
    setVariables((current) =>
      current.map((variable, currentIndex) =>
        currentIndex === index ? { ...variable, [field]: value } : variable
      )
    );
  };

  const removeVariable = (index) => {
    setVariables((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const renderHighlightedContent = () => {
    let escapedText = formData.content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    variables.forEach((variable) => {
      if (!variable.name.trim()) return;
      const safeName = variable.name
        .trim()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\[?${safeName}\\]?`, "gi");
      escapedText = escapedText.replace(regex, (match) => (
        `<mark class="rounded" style="background-color: ${variable.color}; color: transparent;">${match}</mark>`
      ));
    });

    if (escapedText.endsWith("\n")) escapedText += "<br/>";
    return { __html: escapedText };
  };

  const handleScroll = (event) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = event.target.scrollTop;
      backdropRef.current.scrollLeft = event.target.scrollLeft;
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadFormData() {
      try {
        const categoryRows = await fetchCategoryOptions();
        if (cancelled) return;

        setCategories(categoryRows);
        if (categoryRows.length > 0 && !isEditMode) {
          setFormData((prev) => ({ ...prev, categoryId: categoryRows[0].id }));
        }

        if (!isEditMode) return;

        const prompt = await fetchPromptById(promptId);
        if (cancelled) return;

        if (!prompt) {
          setError("Prompt not found.");
          return;
        }

        setFormData({
          title: prompt.title ?? "",
          description: prompt.description ?? "",
          content: prompt.promptText ?? "",
          categoryId: prompt.categoryId ?? "",
          modelType: prompt.model ?? MODEL_TYPES[0],
          saleCoin: Number(prompt.price ?? 0),
          thumbnail: null,
        });
        setVariables(Array.isArray(prompt.promptVariables) ? prompt.promptVariables : []);
        setPreviewImage(prompt.imageUrl ?? null);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load prompt form data", err);
          setError(err.message || "Failed to load prompt form data");
        }
      }
    }

    loadFormData();

    return () => {
      cancelled = true;
    };
  }, [isEditMode, promptId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, thumbnail: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isEditMode && !formData.thumbnail) {
      setError("Please select a thumbnail image.");
      return;
    }

    setLoading(true);
    setError(null);

    const submission = new FormData();
    submission.append("creator_id", getCurrentUserId());
    submission.append("sale_coin", formData.saleCoin);
    submission.append("prompt_variables", JSON.stringify(variables));

    if (isEditMode) {
      submission.append("prompt_id", promptId);
    } else {
      submission.append("title", formData.title);
      submission.append("prompt_description", formData.description);
      submission.append("full_prompt_content", formData.content);
      submission.append("category_id", formData.categoryId);
      submission.append("model_type", formData.modelType);
      submission.append("thumbnail", formData.thumbnail);
    }

    try {
      if (isEditMode) {
        await updatePrompt(submission);
      } else {
        await createPrompt(submission);
      }
      navigate("/creator");
    } catch (err) {
      setError(err.message || (isEditMode ? "Failed to update prompt" : "Failed to create prompt"));
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-violet-300">
          Creator Panel
        </p>
        <h1 className="mt-1 text-2xl font-black text-white">
          {isEditMode ? "Edit Prompt" : "Create Prompt"}
        </h1>
        {isEditMode && (
          <p className="mt-2 text-sm text-slate-400">
            You can edit only Prompt Variables and Price for an existing prompt.
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-bold text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel space-y-6 p-6 sm:p-8">
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-300">
            Thumbnail Image {!isEditMode && <span className="text-rose-400">*</span>}
          </label>
          <div className="flex items-center gap-6">
            <button
              type="button"
              disabled={isEditMode}
              onClick={() => fileInputRef.current?.click()}
              className="relative flex h-32 w-32 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 transition hover:border-violet-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {previewImage ? (
                <img src={previewImage} alt="Thumbnail preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-slate-500">Upload</span>
              )}
            </button>
            <div className="text-sm text-slate-400">
              <p>Recommended size: 800x800px</p>
              <p>Format: JPG, PNG, WEBP</p>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isEditMode}
              className="hidden"
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="title" className="block text-sm font-bold text-slate-300">
              Prompt Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              disabled={isEditMode}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm font-medium text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-70"
              placeholder="e.g., Cinematic Sci-Fi Cityscape"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="categoryId" className="block text-sm font-bold text-slate-300">
              Category <span className="text-rose-400">*</span>
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              value={formData.categoryId}
              onChange={handleChange}
              disabled={isEditMode}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm font-medium text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="modelType" className="block text-sm font-bold text-slate-300">
              Model Type <span className="text-rose-400">*</span>
            </label>
            <select
              id="modelType"
              name="modelType"
              required
              value={formData.modelType}
              onChange={handleChange}
              disabled={isEditMode}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm font-medium text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {MODEL_TYPES.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-bold text-slate-300">
            Description <span className="text-rose-400">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={3}
            value={formData.description}
            onChange={handleChange}
            disabled={isEditMode}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm font-medium text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-70"
            placeholder="Briefly describe what this prompt does..."
          />
        </div>

        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-slate-300">
              Prompt Variables (Highlights)
            </label>
            <button
              type="button"
              onClick={addVariable}
              className="text-xs font-bold text-violet-400 transition hover:text-violet-300"
            >
              + Add Variable
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Define variables like <span className="font-mono text-slate-300">[subject]</span>. Use these exact bracket tags in your prompt content below.
          </p>

          {variables.length > 0 && (
            <div className="space-y-3 rounded-xl border border-slate-700/50 bg-slate-900/30 p-4">
              {variables.map((variable, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={variable.name}
                    onChange={(event) => updateVariable(index, "name", event.target.value)}
                    className="w-1/2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    placeholder="Variable name (e.g. subject)"
                  />
                  <input
                    type="color"
                    value={variable.color}
                    onChange={(event) => updateVariable(index, "color", event.target.value)}
                    className="h-9 w-9 cursor-pointer rounded border border-slate-700 bg-transparent p-1"
                    title="Choose highlight color"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariable(index)}
                    className="p-2 text-rose-400 transition hover:text-rose-300"
                    title="Remove Variable"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="block text-sm font-bold text-slate-300">
            Full Prompt Content <span className="text-rose-400">*</span>
          </label>
          <div className="group relative w-full rounded-xl border border-slate-700 bg-slate-900/50 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500">
            <div
              ref={backdropRef}
              className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words px-4 py-3 font-mono text-sm font-medium text-transparent"
              dangerouslySetInnerHTML={renderHighlightedContent()}
              aria-hidden="true"
            />
            <textarea
              id="content"
              name="content"
              required
              rows={5}
              value={formData.content}
              onChange={handleChange}
              onScroll={handleScroll}
              disabled={isEditMode}
              className="relative z-10 m-0 w-full resize-y rounded-xl border-none bg-transparent px-4 py-3 font-mono text-sm font-medium text-white placeholder-slate-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
              placeholder="Enter the exact prompt here... Use [brackets] for variables."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="saleCoin" className="block text-sm font-bold text-slate-300">
            Price (Coins) <span className="text-rose-400">*</span>
          </label>
          <input
            type="number"
            id="saleCoin"
            name="saleCoin"
            required
            min="0"
            value={formData.saleCoin}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm font-medium text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <p className="text-xs text-slate-500">Set to 0 to make it free.</p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={() => navigate("/creator")}
            disabled={loading}
            className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            {loading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Confirm & Update" : "Confirm & Create")}
          </button>
        </div>
      </form>
    </div>
  );
}