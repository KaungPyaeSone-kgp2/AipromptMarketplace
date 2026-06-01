import { useEffect, useMemo, useRef, useState } from "react";
import PromptCard from "../components/PromptCard.jsx";
import { useOutsideClick } from "../hooks/useOutsideClick.js";
import {
  fetchPurchaseItems,
  fetchPurchaseList,
} from "../services/promptService.js";

const PERIOD_FILTERS = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
];

const FILTER_MODES = [
  { value: "period", label: "Quick filter" },
  { value: "single_date", label: "Single date" },
  { value: "range", label: "Date range" },
  { value: "month", label: "Month and year" },
];

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseDateValue(value) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function toDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatPickerDate(value, fallback) {
  const date = parseDateValue(value);
  if (!date) return fallback;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DatePickerField({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseDateValue(value);
  const [visibleMonth, setVisibleMonth] = useState(
    selectedDate ?? new Date()
  );

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          if (!open) {
            setVisibleMonth(selectedDate ?? new Date());
          }
          setOpen((prev) => !prev);
        }}
        className="mt-2 flex w-full items-center justify-between rounded-lg border border-slate-700 bg-[#070814] px-3 py-2 text-left text-sm font-bold text-violet-300 outline-none transition hover:border-violet-300 focus:border-violet-300"
      >
        <span>{formatPickerDate(value, label)}</span>
        <span className="text-xs text-slate-500">Calendar</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-slate-700 bg-[#070814] p-3 shadow-2xl">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setVisibleMonth(new Date(year, month - 1, 1))}
              className="rounded-lg px-3 py-1 text-sm font-black text-violet-300 transition hover:bg-violet-300 hover:text-slate-950"
            >
              Prev
            </button>
            <p className="text-sm font-black text-violet-300">
              {visibleMonth.toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </p>
            <button
              type="button"
              onClick={() => setVisibleMonth(new Date(year, month + 1, 1))}
              className="rounded-lg px-3 py-1 text-sm font-black text-violet-300 transition hover:bg-violet-300 hover:text-slate-950"
            >
              Next
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase text-slate-500">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <span key={`${day}-${index}`}>{day}</span>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              if (!day) return <span key={`blank-${index}`} />;

              const date = new Date(year, month, day);
              const dateValue = toDateValue(date);
              const selected = dateValue === value;

              return (
                <button
                  key={dateValue}
                  type="button"
                  onClick={() => {
                    onChange(dateValue);
                    setOpen(false);
                  }}
                  className={`aspect-square rounded-lg text-sm font-black transition ${selected
                    ? "bg-violet-300 text-slate-950"
                    : "text-slate-300 hover:bg-violet-300 hover:text-slate-950"
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MonthPickerField({ value, onChange }) {
  const selectedYear = value ? Number(value.slice(0, 4)) : new Date().getFullYear();
  const [visibleYear, setVisibleYear] = useState(selectedYear);
  const [open, setOpen] = useState(false);
  const selectedMonth = value ? Number(value.slice(5, 7)) - 1 : null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          if (!open) {
            if (value) setVisibleYear(Number(value.slice(0, 4)));
          }
          setOpen((prev) => !prev);
        }}
        className="mt-2 flex w-full items-center justify-between rounded-lg border border-slate-700 bg-[#070814] px-3 py-2 text-left text-sm font-bold text-violet-300 outline-none transition hover:border-violet-300 focus:border-violet-300"
      >
        <span>{value || "Select month"}</span>
        <span className="text-xs text-slate-500">Calendar</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-slate-700 bg-[#070814] p-3 shadow-2xl">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setVisibleYear((current) => current - 1)}
              className="rounded-lg px-3 py-1 text-sm font-black text-violet-300 transition hover:bg-violet-300 hover:text-slate-950"
            >
              Prev
            </button>
            <p className="text-sm font-black text-violet-300">{visibleYear}</p>
            <button
              type="button"
              onClick={() => setVisibleYear((current) => current + 1)}
              className="rounded-lg px-3 py-1 text-sm font-black text-violet-300 transition hover:bg-violet-300 hover:text-slate-950"
            >
              Next
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {Array.from({ length: 12 }, (_, index) => {
              const monthValue = `${visibleYear}-${String(index + 1).padStart(2, "0")}`;
              const selected = visibleYear === selectedYear && index === selectedMonth;

              return (
                <button
                  key={monthValue}
                  type="button"
                  onClick={() => {
                    onChange(monthValue);
                    setOpen(false);
                  }}
                  className={`rounded-lg px-3 py-2 text-sm font-black transition ${selected
                    ? "bg-violet-300 text-slate-950"
                    : "text-slate-300 hover:bg-violet-300 hover:text-slate-950"
                    }`}
                >
                  {new Date(visibleYear, index, 1).toLocaleDateString(undefined, {
                    month: "short",
                  })}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PurchasedPrompt() {
  const filterRef = useRef(null);
  const [filterMode, setFilterMode] = useState("period");
  const [period, setPeriod] = useState("this_month");
  const [singleDate, setSingleDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthValue, setMonthValue] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [selectedPromptItem, setSelectedPromptItem] = useState(null);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);

  const purchaseFilter = useMemo(() => {
    if (filterMode === "single_date" && singleDate) {
      return { type: "single_date", date: singleDate };
    }

    if (filterMode === "range" && startDate && endDate) {
      return { type: "range", startDate, endDate };
    }

    if (filterMode === "month" && monthValue) {
      return { type: "month", month: monthValue };
    }

    return { type: "period", period };
  }, [endDate, filterMode, monthValue, period, singleDate, startDate]);

  useEffect(() => {
    let cancelled = false;

    async function loadPurchases() {
      setLoadingPurchases(true);
      setSelectedPurchase(null);
      setPurchaseItems([]);

      try {
        const data = await fetchPurchaseList(purchaseFilter);
        if (!cancelled) setPurchases(data);
      } catch (error) {
        console.error("Failed to load purchase list", error);
        if (!cancelled) setPurchases([]);
      } finally {
        if (!cancelled) setLoadingPurchases(false);
      }
    }

    loadPurchases();

    return () => {
      cancelled = true;
    };
  }, [purchaseFilter]);

  async function handleSelectPurchase(purchase) {
    // Check if it's already selected. If so, toggle it off.
    if (selectedPurchase?.id === purchase.id) {
      setSelectedPurchase(null);
      setPurchaseItems([])
      return;
    }
    setSelectedPurchase(purchase);
    setLoadingItems(true);
    setPurchaseItems([]);
    try {
      const items = await fetchPurchaseItems(purchase.id);
      setPurchaseItems(items);
    } catch (error) {
      console.error("Failed to load purchase items", error);
      setPurchaseItems([]);
    } finally {
      setLoadingItems(false);
    }
  }

  const totals = useMemo(() => {
    return purchases.reduce(
      (summary, purchase) => ({
        coins: summary.coins + purchase.totalCoinPaid,
        items: summary.items + purchase.itemCount,
      }),
      { coins: 0, items: 0 }
    );
  }, [purchases]);

  const activeFilterLabel = useMemo(() => {
    if (filterMode === "single_date") {
      return singleDate || "Single date";
    }

    if (filterMode === "range") {
      return startDate && endDate ? `${startDate} to ${endDate}` : "Date range";
    }

    if (filterMode === "month") {
      return monthValue || "Month";
    }

    return PERIOD_FILTERS.find((filter) => filter.value === period)?.label ?? "Filter";
  }, [endDate, filterMode, monthValue, period, singleDate, startDate]);

  const selectedFilterModeLabel =
    FILTER_MODES.find((mode) => mode.value === filterMode)?.label ?? "Filter";

  useOutsideClick(filterRef, () => setFilterOpen(false));

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-violet-300">
            Library
          </p>
          <h1 className="mt-1 text-lg font-black text-white">
            Purchase History
          </h1>
        </div>
        <div className="flex gap-3 text-center">
          <div className="rounded-xl bg-violet-500/10 px-4 py-3">
            <p className="text-xl font-black text-violet-300">
              {purchases.length}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Purchases
            </p>
          </div>
          <div className="rounded-xl bg-cyan-500/10 px-4 py-3">
            <p className="text-xl font-black text-cyan-300">{totals.items}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Items
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-black uppercase tracking-widest text-violet-300">
          Purchase List
        </p>
        <div ref={filterRef} className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen((prev) => !prev)}
            className="inline-flex min-w-[220px] items-center justify-between gap-3 rounded-xl bg-slate-900/80 px-4 py-2 text-sm font-black text-violet-300 transition hover:bg-slate-800"
          >
            <span>Filter</span>
            <span className="truncate text-xs font-bold text-cyan-300">
              {activeFilterLabel}
            </span>
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
                Filter
              </label>
              <select
                value={filterMode}
                onChange={(event) => setFilterMode(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-violet-300 outline-none transition focus:border-violet-400"
              >
                {FILTER_MODES.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>

              <p className="mt-3 text-xs font-bold text-slate-500">
                {selectedFilterModeLabel}
              </p>

              {filterMode === "period" && (
                <div className="mt-2 overflow-hidden rounded-lg border border-slate-800">
                  {PERIOD_FILTERS.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => {
                        setPeriod(filter.value);
                        setFilterOpen(false);
                      }}
                      className={`block w-full px-3 py-2.5 text-left text-sm font-bold transition ${period === filter.value
                        ? "bg-cyan-400 text-slate-950"
                        : "text-slate-300 hover:bg-slate-800"
                        }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              )}

              {filterMode === "single_date" && (
                <DatePickerField
                  label="Select date"
                  value={singleDate}
                  onChange={setSingleDate}
                />
              )}

              {filterMode === "range" && (
                <div className="mt-2 grid gap-2">
                  <DatePickerField
                    label="Start date"
                    value={startDate}
                    onChange={setStartDate}
                  />
                  <DatePickerField
                    label="End date"
                    value={endDate}
                    onChange={setEndDate}
                  />
                </div>
              )}

              {filterMode === "month" && (
                <MonthPickerField
                  value={monthValue}
                  onChange={setMonthValue}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <section className="surface overflow-hidden">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="text-base font-black text-white">Purchase List</h2>
          <p className="mt-1 text-sm text-slate-500">
            Select a purchase row to view its purchased prompt items.
          </p>
        </div>

        {loadingPurchases ? (
          <div className="p-10 text-center text-sm text-slate-400">
            Loading purchases...
          </div>
        ) : purchases.length > 0 ? (
          <div className="overflow-x-auto overflow-y-auto max-h-[550px] app-scrollbar">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-950/60 text-xs uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-black w-1/5">No.</th>
                  <th className="px-5 py-3 font-black w-1/5">Purchased Date</th>
                  <th className="px-5 py-3 font-black w-1/5">Items</th>
                  <th className="px-5 py-3 font-black w-1/5">Total Coins</th>
                  <th className="px-5 py-3 font-black text-center w-2/5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {purchases.map((purchase, index) => {
                  const selected = selectedPurchase?.id === purchase.id;

                  return (
                    <tr
                      key={purchase.id}
                      className={`transition ${selected
                        ? "bg-violet-500/10"
                        : "hover:bg-slate-900/70"
                        }`}
                    >
                      <td className="px-5 py-4 font-black text-white">
                        {index + 1}
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {formatDate(purchase.purchasedAt)}
                        <span className="ml-2 text-xs text-slate-500">
                          {formatTime(purchase.purchasedAt)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {purchase.itemCount}
                      </td>
                      <td className="px-5 py-4 font-bold text-violet-300">
                        {purchase.totalCoinPaid.toLocaleString()} coins
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleSelectPurchase(purchase)}
                          className="rounded-xl w-[150px] h-[50px] bg-violet-600 px-4 py-2 text-xs font-black text-white transition hover:bg-violet-500"
                        >
                          {selected ? "Hide" : "Purchase Items"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-slate-400">
            No purchases found for this filter.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-black text-white">Purchase Items</h2>
          <p className="mt-1 text-sm text-slate-500">
            {selectedPurchase
              ? "Showing prompts from the selected purchase."
              : "Choose a purchase from the list above."}
          </p>
        </div>

        {!selectedPurchase ? (
          <div className="glass-panel p-10 text-center text-sm text-slate-400">
            Select a purchase to show its prompt items.
          </div>
        ) : loadingItems ? (
          <div className="glass-panel p-10 text-center text-sm text-slate-400">
            Loading purchase items...
          </div>
        ) : purchaseItems.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {purchaseItems.map((prompt) => (
              <PromptCard
                key={prompt.purchaseItemId ?? prompt.id}
                prompt={prompt}
                actionLabel="View full prompt content"
                variant="grid"
                hideCommerceActions
                onActionClick={setSelectedPromptItem}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-10 text-center text-sm text-slate-400">
            No prompt items found for this purchase.
          </div>
        )}
      </section>

      {/* Detail Modal for Purchased Prompt */}
      {selectedPromptItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPromptItem(null)}>
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div>
                <h3 className="text-lg font-black text-white">View Full Prompt Content</h3>
                <p className="text-xs text-slate-400 mt-1">View your purchased full prompt content.</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPromptItem(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="grid gap-6 p-6 md:grid-cols-[200px_1fr]">
              <div>
                <div className="aspect-square w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                  {selectedPromptItem.imageUrl ? (
                    <img
                      src={selectedPromptItem.imageUrl}
                      alt={selectedPromptItem.title}
                      className="h-full w-full object-cover select-none"
                      draggable="false"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-bold text-slate-500">
                      No Thumbnail
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-xs font-black uppercase tracking-widest text-violet-300">
                    {selectedPromptItem.model || "AI"}
                  </p>
                  <h4 className="mt-1 text-base font-bold text-white">
                    {selectedPromptItem.title}
                  </h4>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-300">Full Prompt Content</h4>
                  <p className="text-xs text-slate-500 mt-1">Copy and paste this into the AI model.</p>
                </div>
                <div
                  className="rounded-xl border border-slate-700 bg-slate-950 p-4 font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap break-words max-h-64 overflow-y-auto"
                  dangerouslySetInnerHTML={(() => {
                    let text = selectedPromptItem.promptText || "No content provided.";
                    let escapedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    const vars = selectedPromptItem.promptVariables || [];
                    vars.forEach(v => {
                      if (!v.name) return;
                      let safeName = v.name.trim()
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                      const regex = new RegExp(`\\[?${safeName}\\]?`, 'gi');
                      escapedText = escapedText.replace(regex, (match) => {
                        return `<span class="rounded text-white" style="background-color: ${v.color || '#8b5cf6'}; padding: 0.1rem 0.25rem;">${match}</span>`;
                      });
                    });
                    return { __html: escapedText };
                  })()}
                />
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedPromptItem.promptText || "");
                      alert("Copied to clipboard!");
                    }}
                    className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500 flex items-center gap-2"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy Full Prompt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
