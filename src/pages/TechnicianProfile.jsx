import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function TechnicianProfile(){
  const { id } = useParams();
  const { data:t, isLoading } = useQuery({
    queryKey:["tech", id],
    queryFn: async () => (await axios.get(`/api/v1/technicians/${id}`)).data
  });

  if (isLoading) return <div>...</div>;
  if (!t) return <div>ما لقايناهش</div>;

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">{t.fullName}</h2>
      <div className="text-slate-600">{t.city} • {t.specialties?.join(", ")}</div>
      <div>⭐ {t.averageRating}</div>

      <Link to="/create-request" state={{ technician: t }}
        className="px-4 py-2 bg-cyan-700 text-white rounded-lg">
        طلب خدمة
      </Link>
    </div>
  );
}
