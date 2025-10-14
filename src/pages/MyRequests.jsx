import { useQuery } from "@tanstack/react-query";
import { http } from "../api/http";
import StatusBadge from "../components/StatusBadge";

export default function MyRequests(){
  const { data:list = [], isLoading, isError } = useQuery({
    queryKey:["my-requests"],
    queryFn: async () => (await http.get("/requests/me")).data
  });

  if (isLoading) return <div className="text-slate-500">جارٍ التحميل…</div>;
  if (isError) return <div className="text-red-600">وقع خطأ فالإسترجاع. حاول لاحقاً.</div>;

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">طلباتي</h2>
      {list.length === 0 && <div className="text-slate-500">ما عندك حتى طلب.</div>}
      {list.map(r => (
        <div key={r.id} className="border rounded-lg p-3">
          <div className="font-medium">{r.title}</div>
          <div className="text-sm text-slate-600 flex items-center gap-2">
            <span>{r.city}</span>
            <span>•</span>
            <span>الحالة:</span>
            <StatusBadge status={r.status} />
          </div>
        </div>
      ))}
    </div>
  );
}
