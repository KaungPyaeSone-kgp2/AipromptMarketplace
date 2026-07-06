// import { useState, lazy, Suspense } from "react";

// const Chart = lazy(() => import("react-apexcharts"));

// const TABS = [
//   { key: "save", label: "Save" },
//   { key: "review", label: "Review" },
//   { key: "rating", label: "Rating" },
// ];

// export default function PromptAnalytics({ data }) {
//   const [tab, setTab] = useState("save");

//   const series = [
//     {
//       name: TABS.find((t) => t.key === tab).label,
//       data: data[tab],
//     },
//   ];

//   const options = {
//     chart: {
//       type: "area",
//       toolbar: { show: false },
//       background: "transparent",
//       foreColor: "#9CA3AF",
//       animations: { easing: "easeinout", speed: 600 },
//     },
//     theme: { mode: "dark" },
//     colors: ["#8B5CF6"],
//     stroke: { curve: "smooth", width: 3 },
//     fill: {
//       type: "gradient",
//       gradient: {
//         shadeIntensity: 1,
//         opacityFrom: 0.5,
//         opacityTo: 0.05,
//         stops: [0, 90, 100],
//         colorStops: [
//           { offset: 0, color: "#A78BFA", opacity: 0.6 },
//           { offset: 100, color: "#8B5CF6", opacity: 0 },
//         ],
//       },
//     },
//     grid: {
//       borderColor: "rgba(139,92,246,0.12)",
//       strokeDashArray: 4,
//       padding: { left: 10, right: 10 },
//     },
//     dataLabels: { enabled: false },
//     xaxis: {
//       categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
//       axisBorder: { show: false },
//       axisTicks: { show: false },
//       labels: { style: { colors: "#9CA3AF", fontSize: "12px" } },
//     },
//     yaxis: {
//       labels: { style: { colors: "#9CA3AF", fontSize: "12px" } },
//     },
//     tooltip: { theme: "dark" },
//     markers: {
//       size: 5,
//       colors: ["#0B1020"],
//       strokeColors: "#A78BFA",
//       strokeWidth: 3,
//       hover: { size: 7 },
//     },
//   };

//   return (
//     <div
//       className="flex flex-col w-full h-full rounded-2xl p-6"
//       style={{
//         background:
//           "linear-gradient(180deg, rgba(17,24,39,0.9), rgba(11,16,32,0.9))",
//         border: "1px solid rgba(139,92,246,0.25)",
//         boxShadow: "0 20px 60px -30px rgba(139,92,246,0.45)",
//       }}
//     >
//       <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
//         <div className="flex flex-col">
//           <h3
//             className="text-xl font-semibold tracking-wide"
//             style={{ color: "#FFFFFF" }}
//           >
//             Analytics
//           </h3>
//           <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>
//             Last 7 Days
//           </p>
//         </div>

//         <div
//           className="inline-flex p-1 rounded-xl shrink-0"
//           style={{
//             background: "rgba(3,7,18,0.6)",
//             border: "1px solid rgba(139,92,246,0.2)",
//           }}
//         >
//           {TABS.map((t) => (
//             <button
//               key={t.key}
//               onClick={() => setTab(t.key)}
//               className="px-4 py-1.5 text-sm rounded-lg transition-all font-medium"
//               style={{
//                 background:
//                   tab === t.key
//                     ? "linear-gradient(135deg, #8B5CF6, #A78BFA)"
//                     : "transparent",
//                 color: tab === t.key ? "#FFFFFF" : "#9CA3AF",
//                 boxShadow:
//                   tab === t.key
//                     ? "0 6px 20px -6px rgba(139,92,246,0.6)"
//                     : "none",
//               }}
//             >
//               {t.label}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="flex-1 w-full min-h-[320px]">
//         <Suspense
//           fallback={
//             <div
//               className="w-full h-full min-h-[320px] rounded-xl animate-pulse"
//               style={{ background: "rgba(139,92,246,0.05)" }}
//             />
//           }
//         >
//           <Chart
//             options={options}
//             series={series}
//             type="area"
//             height="100%"
//             width="100%"
//           />
//         </Suspense>
//       </div>
//     </div>
//   );
// }

import { useState, lazy, Suspense } from "react";

const Chart = lazy(() => import("react-apexcharts"));

const TABS = [
  { key: "save", label: "Save" },
  { key: "review", label: "Review" },
  { key: "rating", label: "Rating" },
];

export default function PromptAnalytics({ data }) {
  const [tab, setTab] = useState("save");

  // Fallback to zeros if backend arrays are missing to prevent crashes
  const safeData = data?.[tab] || [0, 0, 0, 0, 0, 0, 0];

  const series = [
    {
      name: TABS.find((t) => t.key === tab).label,
      data: safeData,
    },
  ];

  const options = {
    chart: {
      type: "area",
      toolbar: { show: false },
      background: "transparent",
      foreColor: "#9CA3AF",
      animations: { easing: "easeinout", speed: 600 },
    },
    theme: { mode: "dark" },
    colors: ["#8B5CF6"],
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.05,
        stops: [0, 90, 100],
        colorStops: [
          { offset: 0, color: "#A78BFA", opacity: 0.6 },
          { offset: 100, color: "#8B5CF6", opacity: 0 },
        ],
      },
    },
    grid: {
      borderColor: "rgba(139,92,246,0.12)",
      strokeDashArray: 4,
      padding: { left: 10, right: 10 },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: [
        "Day 1",
        "Day 2",
        "Day 3",
        "Day 4",
        "Day 5",
        "Day 6",
        "Day 7",
      ],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#9CA3AF", fontSize: "12px" } },
    },
    yaxis: {
      labels: { style: { colors: "#9CA3AF", fontSize: "12px" } },
    },
    tooltip: { theme: "dark" },
    markers: {
      size: 5,
      colors: ["#0B1020"],
      strokeColors: "#A78BFA",
      strokeWidth: 3,
      hover: { size: 7 },
    },
  };

  return (
    <div
      className="flex flex-col w-full h-full rounded-2xl p-6 backdrop-blur-xl"
      style={{
        background:
          "linear-gradient(180deg, rgba(17,24,39,0.7), rgba(11,16,32,0.8))",
        border: "1px solid rgba(139,92,246,0.25)",
        boxShadow: "0 20px 60px -30px rgba(139,92,246,0.45)",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-col">
          <h3
            className="text-xl font-semibold tracking-wide"
            style={{ color: "#FFFFFF" }}
          >
            Analytics
          </h3>
          <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>
            Last 7 Days
          </p>
        </div>

        <div
          className="inline-flex p-1 rounded-xl shrink-0 backdrop-blur-md"
          style={{
            background: "rgba(3,7,18,0.4)",
            border: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-4 py-1.5 text-sm rounded-lg transition-all font-medium"
              style={{
                background:
                  tab === t.key
                    ? "linear-gradient(135deg, #8B5CF6, #A78BFA)"
                    : "transparent",
                color: tab === t.key ? "#FFFFFF" : "#9CA3AF",
                boxShadow:
                  tab === t.key
                    ? "0 6px 20px -6px rgba(139,92,246,0.6)"
                    : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full min-h-[320px]">
        <Suspense
          fallback={
            <div
              className="w-full h-full min-h-[320px] rounded-xl animate-pulse"
              style={{ background: "rgba(139,92,246,0.05)" }}
            />
          }
        >
          <Chart
            options={options}
            series={series}
            type="area"
            height="100%"
            width="100%"
          />
        </Suspense>
      </div>
    </div>
  );
}
