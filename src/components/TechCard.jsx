import { Link } from "react-router-dom";

export default function TechCard({ t }) {
  return (
    <div className="border border-slate-200 rounded-2xl bg-white p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
      <div>
        <div className="font-semibold text-slate-900">{t.fullName}</div>
        <div className="text-sm text-slate-600">{t.city} • {t.specialties?.join(", ")}</div>
        <div className="text-sm mt-1">⭐ {t.averageRating}</div>
      </div>
      <Link to={`/technicians/${t.id}`} className="px-3 py-2 bg-black text-white rounded-2xl hover:bg-brand-700 transition-colors">
        البروفايل
      </Link>
    </div>
  );
}
