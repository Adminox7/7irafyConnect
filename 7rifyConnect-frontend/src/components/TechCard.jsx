import { Link } from "react-router-dom";

export default function TechCard({ t }) {
  if (!t) return null;
  const init = t.fullName?.[0] ?? "?";
  return (
    <div
      className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-lg transition-shadow text-right"
      dir="rtl"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-800 grid place-items-center font-semibold">
            {init}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">{t.fullName}</h3>
              {t.isPremium && (
                <span className="text-xs rounded-full bg-amber-100 text-amber-700 px-2 py-0.5">
                  Premium
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{t.city}</div>
          </div>
        </div>

        <div className="flex items-center gap-1" aria-label={`تقييم ${t.averageRating} من 5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} width="16" height="16" viewBox="0 0 24 24"
              className={i < Math.round(t.averageRating) ? "text-amber-400" : "text-slate-300"}
              fill="currentColor">
              <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.869 1.402-8.168L.132 9.21l8.2-1.192z"/>
            </svg>
          ))}
          <span className="text-xs text-slate-500 ms-1">{t.averageRating.toFixed(1)}</span>
        </div>
      </div>

      {!!t.specialties?.length && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {t.specialties.slice(0, 4).map((sp) => (
            <span key={sp} className="text-xs rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-600">
              {sp}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-2">
        <Link
          to={`/technicians/${t.id}`}
          className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          الملف
        </Link>
        <Link
          to={`/create-request?technicianId=${t.id}`}
          className="px-3 py-1.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700"
        >
          اطلب
        </Link>
      </div>
    </div>
  );
}
