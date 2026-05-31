import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { fetchCategoryOptions, createPrompt } from "../services/promptService.js";
import { getCurrentUserId } from "../services/currentUser.js";

const MODEL_TYPES = ["ChatGPT", "Claude", "Gemini", "Midjourney", "StableDiffusion"];

export default function CreatePrompt() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    categoryId: "",
    modelType: MODEL_TYPES[0],
    saleCoin: 0,
    thumbnail: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  
  const [variables, setVariables] = useState([]);
  const backdropRef = useRef(null);

  const PRESET_COLORS = [
    "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", 
    "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899"
  ];

  const addVariable = () => {
    setVariables([...variables, { name: "", color: PRESET_COLORS[variables.length % PRESET_COLORS.length] }]);
  };

  const updateVariable = (index, field, value) => {
    const newVars = [...variables];
    newVars[index][field] = value;
    setVariables(newVars);
  };

  const removeVariable = (index) => {
    const newVars = variables.filter((_, i) => i !== index);
    setVariables(newVars);
  };

  const renderHighlightedContent = () => {
    let text = formData.content;
    let escapedText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    variables.forEach(v => {
      if (!v.name.trim()) return;
      let safeName = v.name.trim()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\[?${safeName}\\]?`, 'gi');
      escapedText = escapedText.replace(regex, (match) => {
        return `<mark class="rounded" style="background-color: ${v.color}; color: transparent;">${match}</mark>`;
      });
    });

    if (escapedText.endsWith('\n')) {
      escapedText += '<br/>';
    }
    return { __html: escapedText };
  };

  const handleScroll = (e) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.target.scrollTop;
      backdropRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategoryOptions();
        setCategories(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: data[0].id }));
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    }
    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, thumbnail: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.thumbnail) {
      setError("Please select a thumbnail image.");
      return;
    }

    setLoading(true);
    setError(null);

    const submission = new FormData();
    submission.append("creator_id", getCurrentUserId());
    submission.append("title", formData.title);
    submission.append("prompt_description", formData.description);
    submission.append("full_prompt_content", formData.content);
    submission.append("category_id", formData.categoryId);
    submission.append("model_type", formData.modelType);
    submission.append("sale_coin", formData.saleCoin);
    submission.append("thumbnail", formData.thumbnail);
    submission.append("prompt_variables", JSON.stringify(variables));

    try {
      await createPrompt(submission);
      navigate("/creator");
    } catch (err) {
      setError(err.message || "Failed to create prompt");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-violet-300">
          Creator Panel
        </p>
        <h1 className="mt-1 text-2xl font-black text-white">Create Prompt</h1>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-500/10 p-4 text-sm font-bold text-rose-400 border border-rose-500/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel space-y-6 p-6 sm:p-8">
        
        {/* Thumbnail Image */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-300">
            Thumbnail Image <span className="text-rose-400">*</span>
          </label>
          <div className="flex items-center gap-6">
            <div 
              className="relative flex h-32 w-32 shrink-0 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 transition hover:border-violet-500 hover:bg-slate-800"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewImage ? (
                <img src={previewImage} alt="Thumbnail preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-slate-500">Upload</span>
              )}
            </div>
            <div className="text-sm text-slate-400">
              <p>Recommended size: 800x800px</p>
              <p>Format: JPG, PNG, WEBP</p>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Title */}
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
              className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm font-medium text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              placeholder="e.g., Cinematic Sci-Fi Cityscape"
            />
          </div>

          {/* Category */}
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
              className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm font-medium text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Model Type */}
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
              className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm font-medium text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              {MODEL_TYPES.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
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
            className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm font-medium text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            placeholder="Briefly describe what this prompt does..."
          />
        </div>

        {/* Prompt Variables (Highlights) */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-slate-300">
              Prompt Variables (Highlights)
            </label>
            <button
              type="button"
              onClick={addVariable}
              className="text-xs font-bold text-violet-400 hover:text-violet-300 transition"
            >
              + Add Variable
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Define variables like <span className="font-mono text-slate-300">[subject]</span>. Use these exact bracket tags in your prompt content below.
          </p>
          
          {variables.length > 0 && (
            <div className="space-y-3 rounded-xl border border-slate-700/50 bg-slate-900/30 p-4">
              {variables.map((v, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => updateVariable(idx, "name", e.target.value)}
                    className="w-1/2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    placeholder="Variable name (e.g. subject)"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={v.color}
                      onChange={(e) => updateVariable(idx, "color", e.target.value)}
                      className="h-9 w-9 cursor-pointer rounded border border-slate-700 bg-transparent p-1"
                      title="Choose highlight color"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariable(idx)}
                    className="text-rose-400 hover:text-rose-300 p-2 transition"
                    title="Remove Variable"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                      <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Full Prompt Content */}
        <div className="space-y-2">
          <label htmlFor="content" className="block text-sm font-bold text-slate-300">
            Full Prompt Content <span className="text-rose-400">*</span>
          </label>
          <div className="relative w-full rounded-xl bg-slate-900/50 group focus-within:ring-1 focus-within:ring-violet-500 focus-within:border-violet-500 border border-slate-700">
            <div 
              ref={backdropRef}
              className="absolute inset-0 overflow-hidden whitespace-pre-wrap break-words px-4 py-3 text-sm font-medium font-mono text-transparent pointer-events-none"
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
              className="relative z-10 w-full resize-y bg-transparent px-4 py-3 text-sm font-medium font-mono text-white placeholder-slate-500 focus:outline-none border-none m-0 rounded-xl"
              placeholder="Enter the exact prompt here... Use [brackets] for variables."
            />
          </div>
        </div>

        {/* Price */}
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

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
            {loading ? "Creating..." : "Confirm & Create"}
          </button>
        </div>

      </form>
    </div>
  );
}
