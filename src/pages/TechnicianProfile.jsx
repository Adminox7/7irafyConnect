import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { http } from "../api/http";

export default function TechnicianProfile(){
  const { id } = useParams();
  const { data:t, isLoading, isError } = useQuery({
    queryKey:["tech", id],
    queryFn: async () => (await http.get(`/technicians/${id}`)).data
  });

  if (isLoading) return <div className="text-slate-500">جارٍ التحميل…</div>;
  if (isError) return <div className="text-red-600">وقع خطأ. حاول لاحقاً.</div>;
  if (!t) return <div>ما لقايناهش</div>;

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">{t.fullName}</h2>
      <div className="text-slate-600">{t.city} • {t.specialties?.join(", ")}</div>
      <div>⭐ {t.averageRating}</div>

      <Link to="/create-request" state={{ technician: t }}
        className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-700">
        طلب خدمة
      </Link>
    </div>
  );
}
