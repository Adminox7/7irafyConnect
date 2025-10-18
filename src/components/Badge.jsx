export default function Badge({ children, color = "brand" }) {
  const colorMap = {
    brand: "bg-brand-50 text-brand-700 border-brand-200",
    accent: "bg-accent-50 text-accent-700 border-accent-200",
    warning: "bg-warning-50 text-warning-700 border-warning-200",
    danger: "bg-danger-50 text-danger-700 border-danger-200",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${colorMap[color] || colorMap.brand}`}>
      {children}
    </span>
  );
}
