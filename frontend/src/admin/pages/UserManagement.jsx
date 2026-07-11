import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import Chart from "react-apexcharts";
import {
  Activity,
  UserCheck,
  UserMinus,
  RefreshCw,
  Search,
  Filter,
  UserCircle,
  ChevronDown,
} from "lucide-react";

import { resolveAssetUrl } from "../../users/utils/assets";

const ACTIVITY_STATS_URL = `/api/admin/user-activity-stats.php`;
const GET_USERS_URL = `/api/admin/get-users.php`;
const TOGGLE_STATUS_URL = `/api/admin/toggle-user-status.php`;

// let initialLoadDone = false;

export default function UserManagement() {
  const [statsData, setStatsData] = useState({
    most_active: { count: 0, percentage: 0 },
    normal_active: { count: 0, percentage: 0 },
    less_active: { count: 0, percentage: 0 },
  });
  // const [loading, setLoading] = useState(true);
  // const [refreshing, setRefreshing] = useState(false);

  const [users, setUsers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const effectRan = useRef(false);

  const loadActivityStats = useCallback(async (refresh = false) => {
    try {
      if (refresh) setLoadingStats(true);

      const response = await fetch(ACTIVITY_STATS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      const result = await response.json();

      if (result.success && result.data?.activity_stats) {
        setStatsData(result.data.activity_stats);
      }
    } catch (error) {
      console.error("Unable to load user activity stats", error);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadUsers = useCallback(async (refresh = false) => {
    try {
      if (!refresh) setLoadingUsers(true);
      const response = await fetch(GET_USERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      const result = await response.json();
      if (result.success && result.data?.users) {
        setUsers(result.data.users);
      }
    } catch (error) {
      console.error("Unable to load users list", error);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const timer = window.setTimeout(() => {
      loadActivityStats(false);
      loadUsers(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadActivityStats, loadUsers]);

  const handleRefreshAll = async () => {
    setRefreshing(true);
    await Promise.all([loadActivityStats(true), loadUsers(true)]);
    setRefreshing(false);
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Ban" : "Active";

    // Optimistic UI Update (Feels instantly responsive)
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, status: newStatus } : user,
      ),
    );

    try {
      const response = await fetch(TOGGLE_STATUS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, new_status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        // Backend clearCaches() ran. Force a silent refresh of charts to show new numbers!
        loadActivityStats(true);
      } else {
        // Revert if failed
        loadUsers(true);
      }
    } catch (error) {
      console.error("Failed to toggle status", error);
      loadUsers(true); // Revert on error
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        statusFilter === "All" || user.status === statusFilter;

      return matchesSearch && matchesFilter;
    });
  }, [users, searchQuery, statusFilter]);

  // --- DYNAMIC DATA MAPPED TO YOUR EXACT UI PREFERENCE ---
  const activityStats = [
    {
      id: "most-active",
      title: "Most Active",
      percentage: statsData.most_active.percentage,
      count: `${statsData.most_active.count.toLocaleString()} Users`,
      icon: <Activity size={24} />,
      iconBg: "bg-emerald-400/10",
      color: "#34D399", // Emerald 400
    },
    {
      id: "normal-active",
      title: "Normal Active",
      percentage: statsData.normal_active.percentage,
      count: `${statsData.normal_active.count.toLocaleString()} Users`,
      icon: <UserCheck size={24} />,
      iconBg: "bg-blue-400/10",
      color: "#60A5FA", // Blue 400
    },
    {
      id: "less-active",
      title: "Less Active",
      percentage: statsData.less_active.percentage,
      count: `${statsData.less_active.count.toLocaleString()} Users`,
      icon: <UserMinus size={24} />,
      iconBg: "bg-rose-400/10",
      color: "#FB7185", // Rose 400
    },
  ];

  // --- APEXCHARTS CONFIGURATION (Segmented "Stick" Radial Bar) ---
  const getChartOptions = (color) => ({
    chart: {
      type: "radialBar",
      sparkline: { enabled: true },
      animations: { speed: 800 },
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          margin: 15,
          size: "60%",
          background: "transparent",
        },
        track: {
          background: "rgba(255, 255, 255, 0.05)",
          strokeWidth: "100%",
          margin: 0,
        },
        dataLabels: {
          show: true,
          name: {
            show: false,
          },
          value: {
            show: true,
            fontSize: "22px",
            fontWeight: 700,
            color: "#F3F4F6",
            offsetY: 8,
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    stroke: {
      lineCap: "butt",
      dashArray: 2,
    },
    fill: {
      type: "solid",
      colors: [color],
    },
  });

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-100">User Management</h1>

        {/* Added the Refresh Button so you can clear the backend cache manually */}
        <button
          type="button"
          onClick={() => handleRefreshAll}
          disabled={loadingStats || loadingUsers || refreshing}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          title="Refresh All Data"
        >
          <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* --- ACTIVITY DONUT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activityStats.map((stat) => (
          <motion.div
            key={stat.id}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden group cursor-pointer flex items-center justify-between"
          >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Left Side: Text and Icon */}
            <div className="relative z-10 flex flex-col h-full justify-center">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.iconBg}`}
                style={{ color: stat.color }}
              >
                {stat.icon}
              </div>
              <p className="text-gray-400 text-sm font-medium mb-1">
                {stat.title}
              </p>
              <h3 className="text-2xl font-bold text-gray-100">
                {loadingStats ? "..." : stat.count}
              </h3>
            </div>

            {/* Right Side: Segmented Stick Radial Bar Chart */}
            <div
              className="relative z-10 w-[120px] h-[120px] flex-shrink-0"
              aria-busy={loadingStats}
            >
              <Chart
                options={getChartOptions(stat.color)}
                series={[stat.percentage]}
                type="radialBar"
                height={150}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Space for the main user table later
      <div className="flex-1 rounded-2xl border border-white/5 border-dashed flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 font-medium">User Table Area</p>
      </div>
    </div> */}

      {/* --- USER TABLE SECTION --- */}
      <div className="flex-1 flex flex-col rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden min-h-[500px]">
        {/* Table Controls (Search & Filter) */}
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-full sm:max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#60A5FA] transition-colors placeholder:text-gray-500"
            />
          </div>

          {/* Dropdown Filter */}
          {/* <div className="relative w-full sm:w-auto min-w-[160px]">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-black/20 border border-white/10 rounded-lg pl-9 pr-8 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#60A5FA] transition-colors cursor-pointer outline-none"
            >
              <option value="All">All Users</option>
              <option value="Active">Active Only</option>
              <option value="Ban">Banned Only</option>
            </select>
          </div> */}

          {/* Custom Dropdown Filter */}
          <div className="relative w-full sm:w-auto min-w-[160px]">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full flex items-center justify-between bg-black/20 border rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-200 transition-colors cursor-pointer outline-none ${isDropdownOpen ? "border-[#60A5FA]" : "border-white/10"
                }`}
            >
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <span>
                {statusFilter === "All"
                  ? "All Users"
                  : statusFilter === "Active"
                    ? "Active Only"
                    : "Banned Only"}
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* The Dropdown Menu Items */}
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 w-full mt-2 bg-[#111827] border border-white/10 rounded-lg shadow-xl shadow-black/50 overflow-hidden z-50 backdrop-blur-md"
              >
                {["All", "Active", "Ban"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/10 ${statusFilter === status
                      ? "text-[#60A5FA] bg-white/5 font-medium"
                      : "text-gray-300"
                      }`}
                  >
                    {status === "All"
                      ? "All Users"
                      : status === "Active"
                        ? "Active Only"
                        : "Banned Only"}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Invisible overlay to close dropdown when clicking outside */}
            {isDropdownOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider bg-black/10">
                <th className="px-6 py-4 font-medium">User Details</th>
                <th className="px-6 py-4 font-medium">Joined Date</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Loading user directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* User Profile Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {user.profile_image ? (
                          <img
                            src={resolveAssetUrl(user.profile_image)}
                            // src="http://localhost:8000/uploads/profiles/default-profile-picture-male-icon.svg"
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                            <UserCircle size={24} />
                          </div>
                        )}
                        <div>
                          <p className="text-gray-200 font-medium">
                            {user.name}
                          </p>
                          <p className="text-gray-500 text-sm">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {user.created_at}
                    </td>

                    {/* Status Badge (Clickable) */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleUserStatus(user.id, user.status)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-200 ${user.status === "Active"
                          ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20 hover:bg-emerald-400/20"
                          : "bg-rose-400/10 text-rose-400 border-rose-400/20 hover:bg-rose-400/20"
                          }`}
                        title={`Click to ${user.status === "Active" ? "Ban" : "Unban"} User`}
                      >
                        {user.status}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
