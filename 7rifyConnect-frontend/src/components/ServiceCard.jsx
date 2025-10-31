import { Link } from "react-router-dom";

export default function ServiceCard({ s }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-lg transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center text-lg">
            {s.icon || "🔧"}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{s.title}</div>
            <div className="text-xs text-slate-600 mt-0.5">طلبات: {s.ordersCount}</div>
          </div>
        </div>
        {s.avgPrice ? (
          <div className="text-sm text-slate-700">~ {s.avgPrice} درهم</div>
        ) : null}
      </div>
      <div className="mt-3">
        <Link
          to={`/search?q=${encodeURIComponent(s.title)}`}
          className="inline-flex items-center justify-center px-3 py-1.5 rounded-2xl bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 shadow-sm"
          aria-label={`ابحث عن خدمة ${s.title}`}
        >
          ابحث بهذه الخدمة
        </Link>
      </div>
    </div>
  );
}
