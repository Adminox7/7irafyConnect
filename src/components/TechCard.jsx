import { Link } from "react-router-dom";

export default function TechCard({ t }) {
  return (
    <div className="border rounded-xl p-4 flex items-center justify-between">
      <div>
        <div className="font-semibold">{t.fullName}</div>
        <div className="text-sm text-slate-600">{t.city} • {t.specialties?.join(", ")}</div>
        <div className="text-sm mt-1">⭐ {t.averageRating}</div>
      </div>
      <Link to={`/technicians/${t.id}`} className="px-3 py-2 bg-cyan-600 text-white rounded-lg">
        البروفايل
      </Link>
    </div>
  );
}
