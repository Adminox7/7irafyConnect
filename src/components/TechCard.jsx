import { Link } from "react-router-dom";

export default function TechCard({ t }) {
  return (
    <div className="group border border-slate-200 rounded-2xl bg-white p-4 flex items-center justify-between shadow-sm hover:shadow-lg transition-all">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-200 to-brand-100 grid place-items-center text-brand-700 font-bold">
          {t?.fullName?.[0] || "ت"}
        </div>
        <div>
          <div className="font-semibold text-slate-900 flex items-center gap-2">
            {t.fullName}
            {t.isPremium && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[10px]">
                <span aria-hidden>★</span>
                Premium
              </span>
            )}
          </div>
          <div className="text-sm text-slate-600">{t.city} • {t.specialties?.join(", ")}</div>
          <div className="text-xs mt-1 text-slate-600">⭐ {t.averageRating?.toFixed ? t.averageRating.toFixed(1) : t.averageRating}</div>
        </div>
      </div>
      <Link
        to={`/technicians/${t.id}`}
        className="px-3 py-2 rounded-2xl bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 shadow-sm"
        aria-label={`شوف بروفايل ${t.fullName}`}
      >
        البروفايل
      </Link>
    </div>
  );
}
