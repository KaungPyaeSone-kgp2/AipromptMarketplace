export const StatCard = ({ icon: Icon, label, value, accent = "#8B5CF6" }) => {
  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4"
      style={{
        background:
          "linear-gradient(180deg, rgba(17,24,39,0.9), rgba(11,16,32,0.9))",
        border: "1px solid rgba(139,92,246,0.25)",
        boxShadow: "0 10px 40px -20px rgba(139,92,246,0.4)",
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${accent}33, ${accent}11)`,
          border: `1px solid ${accent}55`,
        }}
      >
        <Icon size={22} style={{ color: accent }} />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-semibold" style={{ color: "#FFFFFF" }}>
          {value}
        </span>
        <span
          className="text-xs uppercase tracking-wider"
          style={{ color: "#9CA3AF" }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};
