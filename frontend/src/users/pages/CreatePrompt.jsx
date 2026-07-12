import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  fetchCategoryOptions,
  fetchPromptById,
  createPrompt,
  updatePrompt,
} from "../services/promptService.js";
import { getCurrentUserId } from "../services/currentUser.js";
import { GlobeIcon, FollowersIcon, DraftIcon } from "../components/Icon.jsx";

const CustomSelect = ({ options, value, onChange, disabled, name, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(options.findIndex((o) => o.value === value));
    } else {
      setFocusedIndex(-1);
    }
  }, [isOpen, value, options]);

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      if (isOpen && focusedIndex >= 0 && focusedIndex < options.length) {
        e.preventDefault();
        onChange({ target: { name, value: options[focusedIndex].value } });
        setIsOpen(false);
      } else if (!isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
    } else if (e.key === "Escape") {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    }
  };

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="flex w-full items-center justify-between rounded-2xl border border-violet-500/50 bg-violet-900/10 px-4 py-3 text-sm font-medium text-violet-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-70 transition-colors hover:border-violet-500"
      >
        <span>{selectedOption?.label}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-violet-600 dark:text-violet-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-400 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 p-1 shadow-xl app-scrollbar">
          {options.map((opt, index) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange({ target: { name, value: opt.value } });
                setIsOpen(false);
              }}
              onMouseEnter={() => setFocusedIndex(index)}
              className={`w-full rounded-xl px-4 py-2.5 text-left text-sm transition-colors ${value === opt.value
                ? "bg-violet-600 text-slate-900 dark:text-white font-bold"
                : focusedIndex === index
                  ? "bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const MODEL_TYPES = ["ChatGPT", "Claude", "Gemini", "Midjourney", "StableDiffusion"];
const VARIABLE_COLOR = "#8b5cf6";

const VISIBILITY_OPTIONS = [
  {
    value: "public",
    label: "Public",
    description: "Visible to everyone",
    icon: GlobeIcon,
    color: "emerald",
  },
  {
    value: "followers_only",
    label: "Only Followings",
    description: "Only your followers can see this",
    icon: FollowersIcon,
    color: "sky",
  },
  {
    value: "draft",
    label: "Draft",
    description: "Save as draft, not visible to anyone",
    icon: DraftIcon,
    color: "amber",
  },
];

export default function CreatePrompt() {
  const navigate = useNavigate();
  const { promptId } = useParams();
  const isEditMode = Boolean(promptId);
  const fileInputRef = useRef(null);
  const backdropRef = useRef(null);
  const descriptionRef = useRef(null);
  const contentRef = useRef(null);

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
    thumbnail: null,
    visibility: "public",
  });

  const addVariable = () => {
    let newVariableName = "";
    // let updatedContent = formData.content;

    if (contentRef.current) {
      const start = contentRef.current.selectionStart;
      const end = contentRef.current.selectionEnd;
      if (start !== end) {
        newVariableName = formData.content.substring(start, end).trim();

        // if (newVariableName && !newVariableName.startsWith("[") && !newVariableName.endsWith("]")) {
        //    const before = formData.content.substring(0, start);
        //    const after = formData.content.substring(end);
        //    updatedContent = `${before}[${newVariableName}]${after}`;
        // } else if (newVariableName.startsWith("[") && newVariableName.endsWith("]")) {
        //    newVariableName = newVariableName.substring(1, newVariableName.length - 1);
        // }
      }
    }

    setVariables((current) => [
      ...current,
      { name: newVariableName, color: VARIABLE_COLOR },
    ]);

    // if (updatedContent !== formData.content) {
    //   setFormData((prev) => ({ ...prev, content: updatedContent }));
    // }
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
        `<mark class="rounded" style="background-color: ${variable.color || VARIABLE_COLOR}; color: transparent;">${match}</mark>`
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
          categoryId: prompt.categoryId ?? prompt.category_id ?? "",
          modelType: prompt.modelType ?? prompt.model_type ?? prompt.model ?? MODEL_TYPES[0],
          thumbnail: null,
          visibility: prompt.visibility ?? "public",
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

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.style.height = "auto";
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  }, [formData.description]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = "auto";
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
  }, [formData.content]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
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
    submission.append("prompt_variables", JSON.stringify(variables));
    submission.append("visibility", formData.visibility);

    if (isEditMode) {
      submission.append("prompt_id", promptId);
      if (formData.thumbnail) {
        submission.append("thumbnail", formData.thumbnail);
      }
      submission.append("title", formData.title);
      submission.append("prompt_description", formData.description);
      submission.append("full_prompt_content", formData.content);
      submission.append("category_id", formData.categoryId);
      submission.append("model_type", formData.modelType);
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
      navigate("/user/created-prompts");
    } catch (err) {
      setError(err.message || (isEditMode ? "Failed to update prompt" : "Failed to create prompt"));
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="mt-1 text-2xl font-black text-violet-600 dark:text-violet-400">
          {isEditMode ? "Edit Prompt" : "Create Prompt"}
        </h1>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-bold text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel space-y-6 p-6 sm:p-8">
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
            Thumbnail Image {!isEditMode && <span className="text-rose-600 dark:text-rose-400">*</span>}
          </label>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isEditMode}
              className="relative flex h-32 w-32 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-400 dark:border-slate-700 bg-slate-200/50 dark:bg-slate-800/50 transition hover:border-violet-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {previewImage ? (
                <img src={previewImage} alt="Thumbnail preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-slate-500">Upload</span>
              )}
            </button>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <p>Recommended size: 800x800px</p>
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
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="title" className="block text-sm font-bold text-slate-700 dark:text-slate-300">
              Prompt Title <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-400 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
              placeholder="e.g., Cinematic Sci-Fi Cityscape"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="categoryId" className="block text-sm font-bold text-slate-700 dark:text-slate-300">
              Category <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <CustomSelect
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              options={categories.map(c => ({ label: c.name, value: c.id }))}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="modelType" className="block text-sm font-bold text-slate-700 dark:text-slate-300">
              Model Type <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <CustomSelect
              id="modelType"
              name="modelType"
              value={formData.modelType}
              onChange={handleChange}
              options={MODEL_TYPES.map(m => ({ label: m, value: m }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-bold text-slate-700 dark:text-slate-300">
            Description <span className="text-rose-600 dark:text-rose-400">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            ref={descriptionRef}
            required
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="w-full resize-none overflow-hidden rounded-xl border border-slate-400 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
            placeholder="Briefly describe what this prompt does..."
          />
        </div>

        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
              Prompt Variables (Highlights)
            </label>
            <button
              type="button"
              onClick={addVariable}
              className="text-xs font-bold text-violet-600 dark:text-violet-400 transition hover:text-violet-300"
            >
              + Add Variable
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Define variables like <span className="font-mono text-slate-700 dark:text-slate-300">[subject]</span>. Use these exact bracket tags in your prompt content below.
          </p>

          {variables.length > 0 && (
            <div className="space-y-3 rounded-xl border border-slate-400/50 dark:border-slate-700/50 bg-slate-900/30 p-4">
              {variables.map((variable, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={variable.name}
                    readOnly
                    // onChange={(event) => updateVariable(index, "name", event.target.value)}
                    className="w-1/2 rounded-lg border border-slate-400 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 focus:outline-none cursor-not-allowed"
                    placeholder="Variable name (select text first)"
                  />
                  <input
                    type="color"
                    value={variable.color}
                    onChange={(event) => updateVariable(index, "color", event.target.value)}
                    className="h-9 w-9 cursor-pointer rounded border border-slate-400 dark:border-slate-700 bg-transparent p-1"
                    title="Choose highlight color"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariable(index)}
                    className="p-2 text-rose-600 dark:text-rose-400 transition hover:text-rose-300"
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
          <label htmlFor="content" className="block text-sm font-bold text-slate-700 dark:text-slate-300">
            Full Prompt Content <span className="text-rose-600 dark:text-rose-400">*</span>
          </label>
          <div className="group relative w-full overflow-hidden rounded-xl border border-slate-400 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-900/50 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500">
            <div
              ref={backdropRef}
              className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words px-4 py-3 font-mono text-sm font-medium text-transparent"
              dangerouslySetInnerHTML={renderHighlightedContent()}
              aria-hidden="true"
            />
            <textarea
              id="content"
              name="content"
              ref={contentRef}
              required
              rows={5}
              value={formData.content}
              onChange={handleChange}
              onScroll={handleScroll}
              className="relative z-10 m-0 w-full resize-none overflow-hidden border-none bg-transparent px-4 py-3 font-mono text-sm font-medium text-slate-900 dark:text-white placeholder-slate-500 focus:border-transparent focus:outline-none focus:ring-0"
              placeholder="Enter the exact prompt here... Use [brackets] for variables."
            />
          </div>
        </div>

        {/* ── Visibility Selector ── */}
        <div className="space-y-3 border-t border-slate-300 dark:border-slate-800 pt-5">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
            Post Visibility <span className="text-rose-600 dark:text-rose-400">*</span>
          </label>
          <p className="text-xs text-slate-500">
            Choose who can see this prompt post.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {VISIBILITY_OPTIONS.map((option) => {
              const isSelected = formData.visibility === option.value;
              const IconComponent = option.icon;

              const borderColor = isSelected
                ? option.color === "emerald"
                  ? "border-emerald-500 ring-1 ring-emerald-500/30"
                  : option.color === "sky"
                    ? "border-sky-500 ring-1 ring-sky-500/30"
                    : "border-amber-500 ring-1 ring-amber-500/30"
                : "border-slate-400 dark:border-slate-700 hover:border-slate-600";

              const iconColor = isSelected
                ? option.color === "emerald"
                  ? "text-emerald-400"
                  : option.color === "sky"
                    ? "text-sky-400"
                    : "text-amber-400"
                : "text-slate-500";

              const bgColor = isSelected
                ? option.color === "emerald"
                  ? "bg-emerald-500/10"
                  : option.color === "sky"
                    ? "bg-sky-500/10"
                    : "bg-amber-500/10"
                : "bg-slate-100/50 dark:bg-slate-900/50";

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, visibility: option.value }))
                  }
                  className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-4 text-center transition-all duration-200 ${borderColor} ${bgColor}`}
                >
                  <div className={`${iconColor} transition-colors`}>
                    <IconComponent />
                  </div>
                  <span className={`text-sm font-bold ${isSelected ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                    }`}>
                    {option.label}
                  </span>
                  <span className="text-[11px] leading-tight text-slate-500">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-300 dark:border-slate-800 pt-4">
          <button
            type="button"
            onClick={() => navigate("/user/created-prompts")}
            disabled={loading}
            className="rounded-xl bg-slate-200 dark:bg-slate-800 px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-slate-900 dark:text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            {loading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Confirm & Update" : "Confirm & Create")}
          </button>
        </div>
      </form>
    </div>
  );
}
