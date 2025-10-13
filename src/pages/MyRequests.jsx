import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function MyRequests(){
  const { data:list = [], isLoading } = useQuery({
    queryKey:["my-requests"],
    queryFn: async () => (await axios.get("/api/v1/requests/me")).data
  });

  if (isLoading) return <div>...</div>;

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">طلباتي</h2>
      {list.length === 0 && <div className="text-slate-500">ما عندك حتى طلب.</div>}
      {list.map(r => (
        <div key={r.id} className="border rounded-lg p-3">
          <div className="font-medium">{r.title}</div>
          <div className="text-sm text-slate-600">{r.city} • الحالة: {r.status}</div>
        </div>
      ))}
    </div>
  );
}
