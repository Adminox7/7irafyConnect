export default function StatusBadge({ status }) {
  const map = {
    new: {
      className: "bg-warning-100 text-warning-800 border-warning-200",
      label: "جديد",
    },
    accepted: {
      className: "bg-brand-100 text-brand-800 border-brand-200",
      label: "مقبول",
    },
    in_progress: {
      className: "bg-brand-100 text-brand-800 border-brand-200",
      label: "قيد التنفيذ",
    },
    done: {
      className: "bg-accent-100 text-accent-800 border-accent-200",
      label: "مكتمل",
    },
    cancelled: {
      className: "bg-danger-100 text-danger-800 border-danger-200",
      label: "ملغى",
    },
  };
  const s = map[status] || map.new;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${s.className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {s.label}
    </span>
  );
}
