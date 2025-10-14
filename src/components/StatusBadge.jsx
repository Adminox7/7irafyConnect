export default function StatusBadge({ status }) {
  const colorClass =
    status === "new"
      ? "bg-blue-100 text-blue-700"
      : status === "accepted"
      ? "bg-purple-100 text-purple-700"
      : status === "in_progress"
      ? "bg-amber-100 text-amber-700"
      : status === "done"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-slate-100 text-slate-700";

  const labelMap = {
    new: "جديد",
    accepted: "مقبول",
    in_progress: "قيد الإنجاز",
    done: "مكتمل",
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {labelMap[status] || status}
    </span>
  );
}
