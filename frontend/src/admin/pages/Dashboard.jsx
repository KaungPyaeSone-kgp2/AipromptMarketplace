import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, animate } from "framer-motion";
import Chart from "react-apexcharts";
import {
  Users,
  FileText,
  Ban,
  FileWarning,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Clipboard,
  X,
} from "lucide-react";

const DASHBOARD_TOP_CARDS_URL = `/api/admin/dashboard-top-cards.php`;
const DASHBOARD_CHARTS_URL = `/api/admin/dashboard-charts.php`;
const LATEST_LOGINS_URL = `/api/admin/latest-logins.php`;

// let dashboardInitialLoadDone = false;

export default function Dashboard() {
  const [promptsFilter, setPromptsFilter] = useState("7days");
  const [usersFilter, setUsersFilter] = useState("7days");

  const [topCardsData, setTopCardsData] = useState(null);
  const [topCardsLoading, setTopCardsLoading] = useState(true);
  const [topCardsRefreshing, setTopCardsRefreshing] = useState(false);
  const [topCardsError, setTopCardsError] = useState("");

  const [promptsChartData, setPromptsChartData] = useState({
    labels: [],
    values: [],
  });
  const [usersChartData, setUsersChartData] = useState({
    labels: [],
    values: [],
  });

  const [promptsChartLoading, setPromptsChartLoading] = useState(true);
  const [usersChartLoading, setUsersChartLoading] = useState(true);
  const [chartsError, setChartsError] = useState("");

  const [latestLogins, setLatestLogins] = useState([]);
  const [latestLoginsLoading, setLatestLoginsLoading] = useState(true);
  const [latestLoginsError, setLatestLoginsError] = useState("");

  const [exportPreview, setExportPreview] = useState(null);
  const [copySuccess, setCopySuccess] = useState("");

  const effectRan = useRef(false);

  const loadTopCards = useCallback(async (refresh = false) => {
    try {
      if (refresh) setTopCardsRefreshing(true);
      else setTopCardsLoading(true);

      setTopCardsError("");

      const response = await fetch(DASHBOARD_TOP_CARDS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load dashboard stats");
      }

      setTopCardsData(result.data.cards);
    } catch {
      setTopCardsError("Unable to load dashboard stats");
    } finally {
      setTopCardsLoading(false);
      setTopCardsRefreshing(false);
    }
  }, []);

  const loadPromptsChart = useCallback(
    async ({ refresh = false, filter }) => {
      try {
        setPromptsChartLoading(promptsChartData.values.length === 0);
        setChartsError("");

        const response = await fetch(DASHBOARD_CHARTS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompts_filter: filter,
            users_filter: "7days",
            refresh,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load prompts chart");
        }

        setPromptsChartData({
          labels: result.data?.prompts?.labels ?? [],
          values: result.data?.prompts?.values ?? [],
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          setChartsError("Unable to load dashboard charts");
        }
      }
    },
    [promptsChartData.values.length],
  );

  const loadUsersChart = useCallback(
    async ({ refresh = false, filter }) => {
      try {
        setUsersChartLoading(usersChartData.values.length === 0);
        setChartsError("");

        const response = await fetch(DASHBOARD_CHARTS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompts_filter: "7days",
            users_filter: filter,
            refresh,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load users chart");
        }

        setUsersChartData({
          labels: result.data?.users?.labels ?? [],
          values: result.data?.users?.values ?? [],
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          setChartsError("Unable to load dashboard charts");
        }
      }
    },
    [usersChartData.values.length],
  );

  const loadLatestLogins = useCallback(async () => {
    try {
      setLatestLoginsLoading(true);
      setLatestLoginsError("");

      const response = await fetch(LATEST_LOGINS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 5 }),
      });

      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.message || "Failed to load latest logins");

      setLatestLogins(
        Array.isArray(result.data?.logins) ? result.data.logins : [],
      );
    } catch (error) {
      if (error.name !== "AbortError")
        setLatestLoginsError("Unable to load latest logins");
    } finally {
      setLatestLoginsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const timer = window.setTimeout(() => {
      loadTopCards(false);
      loadPromptsChart({ filter: "7days" });
      loadUsersChart({ filter: "7days" });
      loadLatestLogins();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTopCards, loadPromptsChart, loadUsersChart, loadLatestLogins]);

  const statsConfig = [
    {
      key: "total_users",
      title: "Total Users",
      icon: <Users size={24} />,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      key: "total_prompts",
      title: "Total Prompts",
      icon: <FileText size={24} />,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      key: "banned_stats",
      title: "Banned (Users / Prompts)",
      icon: <Ban size={24} />,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
    },
    {
      key: "pending_reports",
      title: "Pending Reports",
      icon: <FileWarning size={24} />,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
  ];

  const stats = statsConfig.map((stat) => {
    const cardData = topCardsData?.[stat.key];

    if (stat.key === "banned_stats") {
      return {
        ...stat,
        isBanCard: true,
        usersValue: cardData?.users_value ?? 0,
        promptsValue: cardData?.prompts_value ?? 0,
        usersTrend: cardData?.users_trend ?? "0%",
        promptsTrend: cardData?.prompts_trend ?? "0%",
        usersIsUp: cardData?.users_is_up ?? true,
        promptsIsUp: cardData?.prompts_is_up ?? true,
        isLoading: topCardsLoading,
      };
    }

    return {
      ...stat,
      rawValue: cardData?.value ?? 0,
      trend: cardData?.trend ?? "0%",
      isUp: cardData?.is_up ?? true,
      isLoading: topCardsLoading,
    };
  });

  const promptsLabels = promptsChartData.labels;
  const promptsValues = promptsChartData.values;

  const promptsSeries = useMemo(
    () => [{ name: "New Prompts", data: promptsValues }],
    [promptsValues],
  );

  const promptsOptions = useMemo(
    () => ({
      chart: {
        type: "area",
        toolbar: { show: false },
        background: "transparent",
      },
      theme: { mode: "dark" },
      colors: ["#34D399"], // Emerald color
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.0,
          stops: [0, 100],
        },
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 3 },
      xaxis: {
        categories: promptsLabels,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: "#9CA3AF" } },
      },
      yaxis: {
        labels: {
          style: { colors: "#9CA3AF" },
          formatter: (val) => `${val}`,
        },
      },
      grid: {
        borderColor: "#ffffff15",
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
      },
      tooltip: { theme: "dark", y: { formatter: (val) => `${val} Prompts` } },
    }),
    [promptsLabels],
  );

  const usersLabels = usersChartData.labels;
  const usersValues = usersChartData.values;

  const usersSeries = useMemo(
    () => [{ name: "New Users", data: usersValues }],
    [usersValues],
  );

  const usersOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        toolbar: { show: false },
        background: "transparent",
        animations: { speed: 400 },
      },
      theme: { mode: "dark" },
      colors: ["#60A5FA"], // Blue color
      plotOptions: { bar: { borderRadius: 6, columnWidth: "40%" } },
      dataLabels: { enabled: false },
      xaxis: {
        categories: usersLabels,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: "#9CA3AF" } },
      },
      yaxis: { labels: { style: { colors: "#9CA3AF" } } },
      grid: {
        borderColor: "#ffffff15",
        strokeDashArray: 4,
        yaxis: { lines: { show: true } },
      },
      tooltip: { theme: "dark" },
    }),
    [usersLabels],
  );

  function sectionsToCSVRows(sections) {
    return sections.flatMap((section) => [
      [section.title],
      section.columns,
      ...section.rows,
      [],
    ]);
  }

  async function downloadCSV(filename, sections) {
    const rows = sectionsToCSVRows(sections);

    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell ?? "");
            return `"${value.replaceAll('"', '""')}"`;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    if ("showSaveFilePicker" in window) {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: "CSV File",
            accept: {
              "text/csv": [".csv"],
            },
          },
        ],
      });

      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  }

  function getExportTimestamp() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    const second = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}_${hour}-${minute}-${second}`;
  }

  function openOverviewExportPreview() {
    const cardRows = stats.map((stat) => {
      if (stat.isBanCard) {
        return [
          stat.title,
          `U: ${stat.usersValue} | P: ${stat.promptsValue}`,
          `U: ${stat.usersTrend} | P: ${stat.promptsTrend}`,
        ];
      }
      return [stat.title, String(stat.rawValue), stat.trend];
    });

    const promptsRows = promptsLabels.map((label, index) => [
      label,
      promptsValues[index] ?? 0,
    ]);

    const usersRows = usersLabels.map((label, index) => [
      label,
      usersValues[index] ?? 0,
    ]);

    const loginsRows = latestLogins.map((login) => [
      login.user_name,
      login.user_email,
      login.login_at,
    ]);

    setCopySuccess("");
    setExportPreview({
      title: "Dashboard Overview Raw Data",
      filename: `dashboard-overview_${getExportTimestamp()}.csv`,
      sections: [
        {
          title: "Top Cards",
          columns: ["Title", "Value(s)", "Trend(s)"],
          rows: cardRows,
        },
        {
          title: "New Prompts Chart",
          columns: ["Label", "New Prompts"],
          rows: promptsRows,
        },
        {
          title: "New Users Chart",
          columns: ["Label", "New Users"],
          rows: usersRows,
        },
        {
          title: "Latest Logins",
          columns: ["Username", "Email", "Login At"],
          rows: loginsRows,
        },
      ],
      json: {
        cards: cardRows,
        promptsChart: promptsRows,
        usersChart: usersRows,
      },
    });
  }

  async function copyExportJSON() {
    if (!exportPreview) return;
    await navigator.clipboard.writeText(
      JSON.stringify(exportPreview.json, null, 2),
    );
    setCopySuccess("Copied");
    window.setTimeout(() => setCopySuccess(""), 1500);
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-100">Overview</h1>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setPromptsFilter("7days");
              setUsersFilter("7days");
              loadTopCards(true);
              loadPromptsChart({ refresh: true, filter: "7days" });
              loadUsersChart({ refresh: true, filter: "7days" });
              loadLatestLogins();
            }}
            disabled={topCardsLoading || topCardsRefreshing}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw
              size={18}
              className={topCardsRefreshing ? "animate-spin" : ""}
            />
          </button>

          <button
            type="button"
            onClick={openOverviewExportPreview}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 text-gray-300 text-sm font-medium rounded-lg hover:bg-white/10 hover:text-white transition-colors"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {topCardsError && (
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
          {topCardsError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.key} stat={stat} />
        ))}
      </div>

      {chartsError && (
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
          {chartsError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-200">New Prompts</h2>
            <select
              value={promptsFilter}
              onChange={(e) => {
                const nextFilter = e.target.value;
                setPromptsFilter(nextFilter);
                loadPromptsChart({ filter: nextFilter });
              }}
              className="bg-[#111827] border border-white/10 text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-[#C4B5FD] transition-colors cursor-pointer"
            >
              <option value="7days">Last 7 Days</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full" aria-busy={promptsChartLoading}>
            <Chart
              options={promptsOptions}
              series={promptsSeries}
              type="area"
              height="100%"
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-200">New Users</h2>
            <select
              value={usersFilter}
              onChange={(e) => {
                const nextFilter = e.target.value;
                setUsersFilter(nextFilter);
                loadUsersChart({ filter: nextFilter });
              }}
              className="bg-[#111827] border border-white/10 text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-[#C4B5FD] transition-colors cursor-pointer"
            >
              <option value="7days">Last 7 Days</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full" aria-busy={usersChartLoading}>
            <Chart
              options={usersOptions}
              series={usersSeries}
              type="bar"
              height="100%"
            />
          </div>
        </div>
      </div>

      {latestLoginsError && (
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
          {latestLoginsError}
        </div>
      )}

      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col">
        <h2 className="text-xl font-bold text-gray-200 mb-6">Latest Logins</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider">
                <th className="pb-3 font-medium">Username</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Login Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {latestLoginsLoading && latestLogins.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-6 text-center text-gray-400">
                    Loading logins...
                  </td>
                </tr>
              )}
              {!latestLoginsLoading && latestLogins.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-6 text-center text-gray-400">
                    No login records found
                  </td>
                </tr>
              )}
              {latestLogins.map((login, index) => (
                <tr
                  key={index}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="py-4 text-gray-200 font-medium">
                    {login.user_name}
                  </td>
                  <td className="py-4 text-gray-400 text-sm">
                    {login.user_email}
                  </td>
                  <td className="py-4 text-blue-400 font-semibold text-sm">
                    {login.login_at}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {exportPreview && (
        <RawDataPreviewModal
          preview={exportPreview}
          copySuccess={copySuccess}
          onClose={() => setExportPreview(null)}
          onCopy={copyExportJSON}
          onDownload={() =>
            downloadCSV(exportPreview.filename, exportPreview.sections)
          }
        />
      )}
    </div>
  );
}

function RawDataPreviewModal({
  preview,
  copySuccess,
  onClose,
  onCopy,
  onDownload,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl max-h-[86vh] overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-100">{preview.title}</h2>
            <p className="text-xs text-gray-500">Raw export preview</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCopy}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Clipboard size={16} />
              {copySuccess || "Copy JSON"}
            </button>
            <button
              type="button"
              onClick={onDownload}
              className="flex items-center gap-2 rounded-lg bg-[#A78BFA] px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-[#C4B5FD] transition-colors"
            >
              <Download size={16} />
              Download CSV
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(86vh-76px)] overflow-y-auto p-5 space-y-6">
          {preview.sections.map((section) => (
            <div
              key={section.title}
              className="rounded-xl border border-white/10 bg-white/[0.03]"
            >
              <div className="border-b border-white/10 px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-200">
                  {section.title}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      {section.columns.map((column) => (
                        <th key={column} className="px-4 py-3 font-medium">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-b border-white/5 last:border-0"
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-4 py-3 text-gray-300"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ stat }) {
  const nodeRef = useRef(null);
  const usersNodeRef = useRef(null);
  const promptsNodeRef = useRef(null);

  useEffect(() => {
    if (stat.isLoading) return;

    let controls, usersControls, promptsControls;

    if (stat.isBanCard) {
      if (usersNodeRef.current) {
        usersControls = animate(0, stat.usersValue, {
          duration: 1.5,
          ease: "easeOut",
          onUpdate: (val) => {
            // SAFEGUARD: Ensure the node still exists before updating
            if (usersNodeRef.current) {
              usersNodeRef.current.textContent =
                Math.round(val).toLocaleString();
            }
          },
        });
      }
      if (promptsNodeRef.current) {
        promptsControls = animate(0, stat.promptsValue, {
          duration: 1.5,
          ease: "easeOut",
          onUpdate: (val) => {
            // SAFEGUARD: Ensure the node still exists before updating
            if (promptsNodeRef.current) {
              promptsNodeRef.current.textContent =
                Math.round(val).toLocaleString();
            }
          },
        });
      }
    } else {
      if (nodeRef.current) {
        controls = animate(0, stat.rawValue, {
          duration: 1.5,
          ease: "easeOut",
          onUpdate: (val) => {
            // SAFEGUARD & PREFIX FIX: Prevent 'undefined0' crashes
            if (nodeRef.current) {
              nodeRef.current.textContent =
                (stat.prefix || "") +
                Math.round(val).toLocaleString() +
                (stat.suffix || "");
            }
          },
        });
      }
    }

    return () => {
      controls?.stop();
      usersControls?.stop();
      promptsControls?.stop();
    };
  }, [stat]);

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden group cursor-pointer flex flex-col justify-between h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between relative z-10 mb-4">
        <div className="w-full">
          <p className="text-gray-400 text-sm font-medium mb-2">{stat.title}</p>

          {stat.isLoading ? (
            <h3 className="text-3xl font-bold text-gray-100">...</h3>
          ) : stat.isBanCard ? (
            <div className="flex gap-4 items-center mt-1">
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-0.5">
                  Users
                </p>
                <h3
                  ref={usersNodeRef}
                  className="text-2xl font-bold text-gray-100"
                >
                  0
                </h3>
              </div>
              <div className="h-8 w-px bg-white/10 mt-3"></div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-0.5">
                  Prompts
                </p>
                <h3
                  ref={promptsNodeRef}
                  className="text-2xl font-bold text-gray-100"
                >
                  0
                </h3>
              </div>
            </div>
          ) : (
            <h3 ref={nodeRef} className="text-3xl font-bold text-gray-100">
              0
            </h3>
          )}
        </div>

        <div className={`p-3 rounded-xl shrink-0 ${stat.bg} ${stat.color}`}>
          {stat.icon}
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-2 mt-auto">
        {stat.isBanCard ? (
          <div className="flex items-center gap-3 w-full">
            <div
              className={`flex items-center gap-1 text-xs font-semibold ${stat.usersIsUp ? "text-emerald-400" : "text-rose-400"}`}
            >
              {stat.usersIsUp ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownRight size={14} />
              )}
              {stat.usersTrend} (U)
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-semibold ${stat.promptsIsUp ? "text-emerald-400" : "text-rose-400"}`}
            >
              {stat.promptsIsUp ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownRight size={14} />
              )}
              {stat.promptsTrend} (P)
            </div>
            <span className="text-gray-500 text-xs ml-auto">vs y'day</span>
          </div>
        ) : (
          <>
            <div
              className={`flex items-center gap-1 text-sm font-semibold ${stat.isUp ? "text-emerald-400" : "text-rose-400"}`}
            >
              {stat.isUp ? (
                <ArrowUpRight size={16} />
              ) : (
                <ArrowDownRight size={16} />
              )}
              {stat.trend}
            </div>
            <span className="text-gray-500 text-xs">vs yesterday</span>
          </>
        )}
      </div>
    </motion.div>
  );
}
