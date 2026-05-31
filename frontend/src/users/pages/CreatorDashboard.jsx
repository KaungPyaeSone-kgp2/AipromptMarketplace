import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router";
import Chart from "react-apexcharts";
import { fetchCreatorPrompts, fetchCreatorRatings } from "../services/promptService.js";
import { fetchCurrentUser } from "../services/userService.js";
import { apiGet } from "../services/apiClient.js";
import { getCurrentUserId } from "../services/currentUser.js";
import { useOutsideClick } from "../hooks/useOutsideClick.js";

/* ── Stat Card ─────────────────────────────────────────────── */

function StatCard({ label, value, icon, accent = "violet" }) {
  const accentMap = {
    violet: "from-violet-500/20 to-violet-600/5 border-violet-500/25 text-violet-300",
    emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/25 text-emerald-300",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/25 text-amber-300",
    cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/25 text-cyan-300",
    rose: "from-rose-500/20 to-rose-600/5 border-rose-500/25 text-rose-300",
    fuchsia: "from-fuchsia-500/20 to-fuchsia-600/5 border-fuchsia-500/25 text-fuchsia-300",
  };

  const iconBgMap = {
    violet: "bg-violet-500/15 text-violet-300",
    emerald: "bg-emerald-500/15 text-emerald-300",
    amber: "bg-amber-500/15 text-amber-300",
    cyan: "bg-cyan-500/15 text-cyan-300",
    rose: "bg-rose-500/15 text-rose-300",
    fuchsia: "bg-fuchsia-500/15 text-fuchsia-300",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 transition hover:scale-[1.02] ${accentMap[accent]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black text-white">{value}</p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${iconBgMap[accent]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ── Chart Filter Dropdown ─────────────────────────────────── */

function ChartFilterDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  
  useOutsideClick(ref, () => setOpen(false));

  const labels = {
    year: "Year",
    month: "Month",
    week: "Week"
  };

  return (
    <div ref={ref} className="relative z-10">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex min-w-[100px] items-center justify-between gap-3 rounded-lg bg-slate-900/80 px-3 py-1.5 text-xs font-black text-violet-300 transition hover:bg-slate-800 border border-slate-700/50"
      >
        <span>{labels[value] || "Year"}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-cyan-300">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-32 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
          <button
            type="button"
            onClick={() => { onChange("year"); setOpen(false); }}
            className={`block w-full px-3 py-2 text-left text-xs font-bold transition ${value === "year" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-300 hover:bg-slate-800"}`}
          >
            Year
          </button>
          <button
            type="button"
            onClick={() => { onChange("month"); setOpen(false); }}
            className={`block w-full px-3 py-2 text-left text-xs font-bold transition ${value === "month" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-300 hover:bg-slate-800"}`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => { onChange("week"); setOpen(false); }}
            className={`block w-full px-3 py-2 text-left text-xs font-bold transition ${value === "week" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-300 hover:bg-slate-800"}`}
          >
            Week
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Fill in missing data helper ─────────────────────────── */

function fillData(rows, valueKey, period, weekOffset = 0) {
  const now = new Date();
  const points = [];

  if (period === "week") {
    // Current month divided into 4 weeks. Week 4 extends to end of month.
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let startDay = weekOffset * 7 + 1;
    let endDay = weekOffset === 3 ? daysInMonth : startDay + 6;
    
    for (let i = startDay; i <= endDay; i++) {
      const d = new Date(year, month, i);
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      points.push({ key, label });
    }
  } else if (period === "month") {
    // Month filter = 12 months of the current year (Jan to Dec)
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short" });
      points.push({ key, label });
    }
  } else {
    // Year filter = last 5 years
    const currentYear = now.getFullYear();
    for (let i = 4; i >= 0; i--) {
      const y = currentYear - i;
      points.push({ key: String(y), label: String(y) });
    }
  }

  const lookup = {};
  for (const row of rows) {
    lookup[row.data_key] = Number(row[valueKey] ?? 0);
  }

  return {
    categories: points.map((p) => p.label),
    data: points.map((p) => lookup[p.key] ?? 0),
  };
}

/* ── Shared chart theme options ────────────────────────────── */

function buildAreaOptions({ categories, color, yTitle }) {
  return {
    chart: {
      type: "area",
      height: 280,
      fontFamily: "Inter, system-ui, sans-serif",
      toolbar: { show: false },
      background: "transparent",
      foreColor: "#94a3b8",
      sparkline: { enabled: false },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
    },
    colors: [color],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#1e293b",
      strokeDashArray: 4,
      padding: { left: 8, right: 8 },
    },
    xaxis: {
      categories,
      labels: {
        style: { colors: "#64748b", fontSize: "11px", fontWeight: 600 },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: {
        text: yTitle,
        style: { color: "#64748b", fontSize: "11px", fontWeight: 700 },
      },
      labels: {
        style: { colors: "#64748b", fontSize: "11px" },
        formatter: (val) => (Number.isInteger(val) ? val : val.toFixed(1)),
      },
    },
    tooltip: {
      theme: "dark",
      style: { fontSize: "12px" },
      y: {
        formatter: (val) => val.toLocaleString(),
      },
    },
    legend: { show: false },
  };
}

function buildBarOptions({ categories, color, yTitle }) {
  return {
    chart: {
      type: "bar",
      height: 280,
      fontFamily: "Inter, system-ui, sans-serif",
      toolbar: { show: false },
      background: "transparent",
      foreColor: "#94a3b8",
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
    },
    colors: [color],
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "55%",
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        shadeIntensity: 0.3,
        opacityFrom: 0.9,
        opacityTo: 0.6,
        stops: [0, 100],
      },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#1e293b",
      strokeDashArray: 4,
      padding: { left: 8, right: 8 },
    },
    xaxis: {
      categories,
      labels: {
        style: { colors: "#64748b", fontSize: "11px", fontWeight: 600 },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: {
        text: yTitle,
        style: { color: "#64748b", fontSize: "11px", fontWeight: 700 },
      },
      labels: {
        style: { colors: "#64748b", fontSize: "11px" },
        formatter: (val) => (Number.isInteger(val) ? val : val.toFixed(1)),
      },
    },
    tooltip: {
      theme: "dark",
      style: { fontSize: "12px" },
      y: {
        formatter: (val) => val.toLocaleString(),
      },
    },
    legend: { show: false },
  };
}

/* ── Smart Chart Panel ─────────────────────────────────────── */

function ChartPanel({ title, type, color, yTitle, rawData, valueKey, metricKey }) {
  const [period, setPeriod] = useState("year");
  const [weekOffset, setWeekOffset] = useState(0);

  const chartData = useMemo(
    () => fillData(rawData?.[period]?.[metricKey] ?? [], valueKey, period, weekOffset),
    [rawData, period, weekOffset, valueKey, metricKey]
  );

  const options = useMemo(() => {
    return type === "bar"
      ? buildBarOptions({ categories: chartData.categories, color, yTitle })
      : buildAreaOptions({ categories: chartData.categories, color, yTitle });
  }, [type, chartData, color, yTitle]);

  return (
    <div className="overflow-visible rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-300 mt-1">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {period === "week" && (
            <div className="flex items-center gap-1 rounded-lg bg-slate-900/80 px-1 py-1 border border-slate-700/50">
              <button
                type="button"
                onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                disabled={weekOffset === 0}
                className="rounded px-1.5 py-0.5 text-slate-400 transition hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
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
                className="rounded px-1.5 py-0.5 text-slate-400 transition hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
              >
                &gt;
              </button>
            </div>
          )}
          <ChartFilterDropdown value={period} onChange={setPeriod} />
        </div>
      </div>
      <Chart options={options} series={[{ name: title, data: chartData.data }]} type={type} height={280} />
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────── */

export default function CreatorDashboard() {
  const { reloadCurrentUser } = useOutletContext();
  const [user, setUser] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const [userData, creatorPrompts, creatorRatings, statsResponse] =
          await Promise.all([
            fetchCurrentUser({ creatorMode: true }),
            fetchCreatorPrompts(),
            fetchCreatorRatings(),
            apiGet(`user/getDashboardStats.php?creator_id=${getCurrentUserId()}`),
          ]);

        if (cancelled) return;

        setUser(userData);
        setPrompts(creatorPrompts);
        setRatings(creatorRatings);
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
      <div className="space-y-6 fade-in">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-violet-300">
            Creator Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-black text-white">Dashboard</h1>
        </div>
        <div className="glass-panel p-10 text-center text-sm text-slate-400">
          Loading dashboard...
        </div>
      </div>
    );
  }

  const totalEarnings = user?.totalEarningCoins ?? 0;
  const totalSales = user?.totalSalesCount ?? 0;
  const totalPosts = user?.postedPromptCount ?? prompts.length;
  const followers = user?.followersCount ?? 0;
  const following = user?.followingCount ?? 0;
  const coinBalance = user?.points ?? 0;

  return (
    <div className="space-y-8 fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-violet-300">
            Creator Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-black text-white">
            Welcome back, {user?.displayName ?? "Creator"}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Here's an overview of your creator account.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/creator/promptcreate"
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500"
          >
            + Create Prompt
          </Link>
          <Link
            to="/creator"
            className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:border-violet-500/40 hover:bg-slate-700"
          >
            My Prompts
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Coin Balance"
          value={coinBalance.toLocaleString()}
          icon="🪙"
          accent="emerald"
        />
        <StatCard
          label="Total Earned"
          value={totalEarnings.toLocaleString()}
          icon="💰"
          accent="amber"
        />
        <StatCard
          label="Total Sales"
          value={totalSales.toLocaleString()}
          icon="🛒"
          accent="cyan"
        />
        <StatCard
          label="Posted Prompts"
          value={totalPosts.toLocaleString()}
          icon="📝"
          accent="violet"
        />
        <StatCard
          label="Followers"
          value={followers.toLocaleString()}
          icon="👥"
          accent="fuchsia"
        />
        <StatCard
          label="Followings"
          value={following.toLocaleString()}
          icon="👥"
          accent="rose"
        />
      </div>

      {/* ── Income: Number + Growth Chart ─────────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <ChartPanel
          title="View Income By Numbers"
          type="bar"
          color="#f59e0b"
          yTitle="Coins Earned"
          rawData={chartData}
          valueKey="total_net"
          metricKey="income"
        />
        <ChartPanel
          title="View Income Growth Chart"
          type="area"
          color="#f59e0b"
          yTitle="Coins Earned"
          rawData={chartData}
          valueKey="total_net"
          metricKey="income"
        />
      </div>

      {/* ── Followers: Number + Growth Chart ──────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <ChartPanel
          title="View Total Followers By Numbers"
          type="bar"
          color="#d946ef"
          yTitle="New Followers"
          rawData={chartData}
          valueKey="new_followers"
          metricKey="followers"
        />
        <ChartPanel
          title="View Follower Growth Chart"
          type="area"
          color="#d946ef"
          yTitle="New Followers"
          rawData={chartData}
          valueKey="new_followers"
          metricKey="followers"
        />
      </div>

      {/* ── Purchased Prompts + Posted Prompts ────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <ChartPanel
          title="View Total Purchased Prompts By Numbers"
          type="bar"
          color="#06b6d4"
          yTitle="Prompts Sold"
          rawData={chartData}
          valueKey="total_sold"
          metricKey="purchased"
        />
        <ChartPanel
          title="View Total Posted Prompts (For Selling)"
          type="area"
          color="#8b5cf6"
          yTitle="Prompts Posted"
          rawData={chartData}
          valueKey="total_posted"
          metricKey="posted"
        />
      </div>
    </div>
  );
}
