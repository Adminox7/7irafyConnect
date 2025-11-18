import { Link } from "react-router-dom";

const isVerified = (tech) => Boolean(tech?.isVerified ?? tech?.is_verified ?? tech?.verified);
const ensureArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(/[،,]/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
};

export default function TechCard({ t }) {
  if (!t || !isVerified(t)) return null;

  const id = t.id ?? t.technicianId ?? t.technician_id;
  const name = t.fullName ?? t.full_name ?? t.name ?? "حرفي";
  const city = t.city ?? "غير محدد";
  const avatar = t.avatarUrl ?? t.avatar_url ?? t.user?.avatarUrl ?? "";
  const rating = Number(t.averageRating ?? t.average_rating ?? 0) || 0;
  const visitPrice = t.visitPrice ?? t.visit_price ?? null;
  const specialties = ensureArray(t.specialties);
  const primarySpecialty = specialties[0] ?? "حرفي معتمد";

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-xl"
      dir="rtl"
    >
      <div className="relative h-48 w-full overflow-hidden">
        {avatar ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={avatar} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 text-4xl font-semibold text-slate-600">
            {name.slice(0, 1)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-black/55 px-3 py-1 text-xs text-white">
          <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" className="opacity-80">
            <path
              d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 112.5-2.5 2.5 2.5 0 01-2.5 2.5z"
              fill="currentColor"
            />
          </svg>
          <span>{city}</span>
        </div>
        {visitPrice != null && (
          <div className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-slate-900 shadow">
            {visitPrice}
            <span className="text-xs text-slate-500"> درهم / زيارة</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">{primarySpecialty}</p>
            <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
            <p className="text-sm text-slate-500">{city}</p>
          </div>
          <div className="text-left">
            <div className="flex items-center justify-end gap-1 text-amber-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.869 1.402-8.168L.132 9.21l8.2-1.192z" />
              </svg>
              <span className="text-sm font-semibold text-slate-800">{rating.toFixed(1)}</span>
            </div>
            <p className="text-[11px] text-slate-500">تقييم العملاء</p>
          </div>
        </div>

        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
            {specialties.slice(0, 4).map((sp) => (
              <span key={sp} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                {sp}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3">
          <Link
            to={`/create-request?technicianId=${id}`}
            className="flex-1 rounded-2xl bg-brand-600 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            اطلب الآن
          </Link>
          <Link
            to={`/technicians/${id}`}
            className="flex-1 rounded-2xl border border-slate-300 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            عرض الملف
          </Link>
        </div>
      </div>
    </div>
  );
}
