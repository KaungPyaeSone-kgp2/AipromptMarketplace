import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import Chart from "react-apexcharts";
import { fetchCreatorPrompts, fetchCreatorRatings } from "../services/promptService.js";
import { fetchCurrentUser } from "../services/userService.js";
import { apiGet } from "../services/apiClient.js";
import { getCurrentUserId } from "../services/currentUser.js";
import { useOutsideClick } from "../hooks/useOutsideClick.js";

function DashboardGlyph({ type }) {
  const paths = {
    income: (
      <>
        <path d="M8 7.5a4 4 0 1 0 0 8" />
        <path d="M14 7.5a4 4 0 1 1 0 8" />
        <path d="M8 7.5h6" />
        <path d="M8 15.5h6" />
      </>
    ),
    cart: (
      <>
        <path d="M5 5h2l1.2 8.1a2 2 0 0 0 2 1.7h5.7a2 2 0 0 0 1.9-1.4L19 8H8" />
        <circle cx="10.5" cy="19" r="1.2" />
        <circle cx="17" cy="19" r="1.2" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
        <path d="M16 10a2.5 2.5 0 0 1 0 5" />
        <path d="M18 18a4 4 0 0 0-2-3.4" />
      </>
    ),
    prompt: (
      <>
        <path d="M7 3.5h7l3.5 3.5v13.5h-11V3.5Z" />
        <path d="M14 3.5V7h3.5" />
        <path d="M9 11h5" />
        <path d="M9 15h4" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}

function TrendBadge({ tone = "up", label }) {
  const toneClass =
    tone === "down"
      ? "border-amber-400/25 bg-amber-400/10 text-amber-300"
      : tone === "flat"
        ? "border-slate-400/20 bg-slate-300/10 text-slate-300"
        : "border-cyan-400/25 bg-cyan-400/10 text-cyan-300";

  return (
    <span
      className={`inline-flex h-8 items-center gap-1 rounded-full border px-3 text-xs font-bold ${toneClass}`}
    >
      <span>{tone === "down" ? "down" : tone === "flat" ? "-" : "up"}</span>
      {label}
    </span>
  );
}

function StatCard({ label, value, sublabel, iconType, accent = "violet", trend, tone }) {
  const accentMap = {
    violet: {
      line: "from-violet-300 to-violet-500",
      icon: "border-violet-400/25 bg-violet-400/10 text-violet-300",
      glow: "rgba(139, 92, 246, 0.16)",
    },
    amber: {
      line: "from-amber-300 to-orange-500",
      icon: "border-amber-400/25 bg-amber-400/10 text-amber-300",
      glow: "rgba(245, 158, 11, 0.16)",
    },
    cyan: {
      line: "from-cyan-300 to-sky-500",
      icon: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
      glow: "rgba(34, 211, 238, 0.16)",
    },
    fuchsia: {
      line: "from-fuchsia-300 to-purple-500",
      icon: "border-fuchsia-400/25 bg-fuchsia-400/10 text-fuchsia-300",
      glow: "rgba(217, 70, 239, 0.16)",
    },
  };
  const selected = accentMap[accent] ?? accentMap.violet;

  return (
    <div
      className="relative min-h-[170px] overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-950/70 p-6 shadow-xl shadow-black/15 transition hover:-translate-y-0.5 hover:border-slate-500/60"
      style={{
        backgroundImage: `radial-gradient(circle at 80% 30%, ${selected.glow}, transparent 38%), linear-gradient(135deg, rgba(15, 23, 42, 0.88), rgba(17, 18, 34, 0.78))`,
      }}
    >
      <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${selected.line}`} />
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${selected.icon}`}
        >
          <DashboardGlyph type={iconType} />
        </div>
        {trend && <TrendBadge tone={tone} label={trend} />}
      </div>
      <div className="mt-7">
        <p className="text-sm font-medium text-slate-300">{label}</p>
        <div className="mt-2 flex items-end gap-2">
          <p className="text-3xl font-black leading-none text-white drop-shadow">
            {value}
          </p>
          {sublabel && <span className="text-sm font-medium text-slate-300">{sublabel}</span>}
        </div>
      </div>
    </div>
  );
}

function ChartFilterDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const labels = { year: "Year", month: "Month", week: "Week" };

  useOutsideClick(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative z-10">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex min-w-[88px] items-center justify-between gap-3 rounded-xl border border-slate-600/70 bg-slate-900/70 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
      >
        <span>{labels[value] || "Year"}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-slate-300">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-32 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
          {Object.entries(labels).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                onChange(key);
                setOpen(false);
              }}
              className={`block w-full px-3 py-2 text-left text-xs font-bold transition ${
                value === key ? "bg-violet-500/20 text-violet-300" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function fillData(rows, valueKey, period, weekOffset = 0) {
  const now = new Date();
  const points = [];

  if (period === "week") {
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = weekOffset * 7 + 1;
    const endDay = weekOffset === 3 ? daysInMonth : startDay + 6;

    for (let i = startDay; i <= endDay; i++) {
      const d = new Date(year, month, i);
      points.push({
        key: `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }
  } else if (period === "month") {
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), i, 1);
      points.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        label: d.toLocaleDateString("en-US", { month: "short" }),
      });
    }
  } else {
    const currentYear = now.getFullYear();
    for (let i = 4; i >= 0; i--) {
      const year = currentYear - i;
      points.push({ key: String(year), label: String(year) });
    }
  }

  const lookup = {};
  for (const row of rows) {
    lookup[row.data_key] = Number(row[valueKey] ?? 0);
  }

  return {
    categories: points.map((point) => point.label),
    data: points.map((point) => lookup[point.key] ?? 0),
  };
}

function buildAreaOptions({ categories, color, yTitle }) {
  return {
    chart: {
      type: "area",
      height: 300,
      fontFamily: "Inter, system-ui, sans-serif",
      toolbar: { show: false },
      background: "transparent",
      foreColor: "#cbd5e1",
      animations: { enabled: true, easing: "easeinout", speed: 800 },
    },
    colors: [color],
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.55, opacityTo: 0.04, stops: [0, 90, 100] },
    },
    stroke: { curve: "smooth", width: 5, lineCap: "round" },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "rgba(51, 65, 85, 0.55)",
      strokeDashArray: 0,
      padding: { left: 8, right: 8, top: 8 },
    },
    xaxis: {
      categories,
      labels: { style: { colors: "#d6d3e8", fontSize: "12px", fontWeight: 500 } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: { text: yTitle, style: { color: "#64748b", fontSize: "11px", fontWeight: 700 } },
      labels: {
        style: { colors: "#64748b", fontSize: "11px" },
        formatter: (val) => (Number.isInteger(val) ? val : val.toFixed(1)),
      },
    },
    tooltip: { theme: "dark", y: { formatter: (val) => val.toLocaleString() } },
    legend: { show: false },
  };
}

function ChartPanel({ title, subtitle, color, yTitle, rawData, valueKey, metricKey }) {
  const [period, setPeriod] = useState("month");
  const [weekOffset, setWeekOffset] = useState(0);

  const chartData = useMemo(
    () => fillData(rawData?.[period]?.[metricKey] ?? [], valueKey, period, weekOffset),
    [rawData, period, weekOffset, valueKey, metricKey]
  );
  const options = useMemo(
    () => buildAreaOptions({ categories: chartData.categories, color, yTitle }),
    [chartData.categories, color, yTitle]
  );

  return (
    <div className="overflow-visible rounded-2xl border border-slate-700/60 bg-slate-950/60 p-6 shadow-xl shadow-black/15">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-white">{title}</h3>
          <p className="mt-2 text-base text-slate-300">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {period === "week" && (
            <div className="flex items-center gap-1 rounded-lg border border-slate-700/50 bg-slate-900/80 px-1 py-1">
              <button
                type="button"
                onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                disabled={weekOffset === 0}
                className="rounded px-1.5 py-0.5 text-slate-400 transition hover:bg-slate-700 hover:text-white disabled:opacity-30"
              >
                &lt;
              </button>
              <span className="w-12 text-center text-[10px] font-black uppercase tracking-wider text-violet-300">
                Wk {weekOffset + 1}
              </span>
              <button
                type="button"
                onClick={() => setWeekOffset(Math.min(3, weekOffset + 1))}
                disabled={weekOffset === 3}
                className="rounded px-1.5 py-0.5 text-slate-400 transition hover:bg-slate-700 hover:text-white disabled:opacity-30"
              >
                &gt;
              </button>
            </div>
          )}
          <ChartFilterDropdown value={period} onChange={setPeriod} />
        </div>
      </div>
      <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-2">
        <Chart options={options} series={[{ name: title, data: chartData.data }]} type="area" height={300} />
      </div>
    </div>
  );
}

export default function CreatorDashboard() {
  const [user, setUser] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const [userData, creatorPrompts, , statsResponse] = await Promise.all([
          fetchCurrentUser({ creatorMode: true }),
          fetchCreatorPrompts(),
          fetchCreatorRatings(),
          apiGet(`user/getDashboardStats.php?creator_id=${getCurrentUserId()}`),
        ]);

        if (cancelled) return;

        setUser(userData);
        setPrompts(creatorPrompts);
        setChartData(statsResponse?.data ?? null);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="-m-6 min-h-[calc(100vh-4rem)] bg-[#100d18] p-10">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-10 text-center text-sm text-slate-400">
          Loading dashboard...
        </div>
      </div>
    );
  }

  const totalEarnings = user?.totalEarningCoins ?? 0;
  const totalSales = user?.totalSalesCount ?? 0;
  const totalPosts = user?.postedPromptCount ?? prompts.length;
  const followers = user?.followersCount ?? 0;
  const creatorName = user?.displayName ?? "Creator";

  return (
    <div className="fade-in -m-6 min-h-[calc(100vh-4rem)] bg-[#100d18] px-6 py-8 text-slate-100 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1500px] space-y-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-5xl font-black leading-none tracking-tight text-white md:text-6xl">
              Welcome back, <span className="text-violet-300">{creatorName}</span>
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              Here's what's happening with your prompts today.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-600/70 bg-slate-900/60 px-5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              <span aria-hidden="true">□</span>
              Last 30 Days
            </button>
            <Link
              to="/creator/promptcreate"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-violet-600 px-6 text-sm font-bold text-white shadow-xl shadow-violet-950/30 transition hover:bg-violet-500"
            >
              + New Prompt
            </Link>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Monthly Income"
            value={totalEarnings.toLocaleString()}
            sublabel="Coins"
            iconType="income"
            accent="amber"
            trend="+12.5%"
          />
          <StatCard
            label="Total Purchased"
            value={totalSales.toLocaleString()}
            iconType="cart"
            accent="cyan"
            trend="+8.2%"
          />
          <StatCard
            label="Total Followers"
            value={followers.toLocaleString()}
            iconType="users"
            accent="fuchsia"
            trend="-2.1%"
            tone="down"
          />
          <StatCard
            label="Total Posted Prompts"
            value={totalPosts.toLocaleString()}
            iconType="prompt"
            accent="violet"
            trend="0%"
            tone="flat"
          />
        </div>

        <section className="space-y-6">
          <h2 className="text-3xl font-black tracking-tight text-white">
            Performance Analytics
          </h2>
          <div className="grid gap-6 xl:grid-cols-2">
            <ChartPanel
              title="Income Growth"
              subtitle="Monthly coins earned"
              color="#f59e0b"
              yTitle="Coins"
              rawData={chartData}
              valueKey="total_net"
              metricKey="income"
            />
            <ChartPanel
              title="Follower Growth"
              subtitle="New followers over time"
              color="#d946ef"
              yTitle="Followers"
              rawData={chartData}
              valueKey="new_followers"
              metricKey="followers"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
