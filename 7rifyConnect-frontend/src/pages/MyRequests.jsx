import { useQuery } from "@tanstack/react-query";
import { Api } from "../api/endpoints";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import Card from "../components/Card";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

const normalize = (r) => ({
  id: r.id,
  title: r.title ?? "طلب خدمة",
  city: r.city ?? "-",
  description: r.description ?? "",
  status: r.status ?? "new",
  budget: r.budget ?? r.price ?? null,
  attachments: Array.isArray(r.attachments) ? r.attachments : [],
});

export default function MyRequests() {
  const nav = useNavigate();
  const { data: list = [], isLoading, isError, isFetching } = useQuery({
    queryKey: ["my-requests"],
    queryFn: () => Api.getMyRequests(),
  });

  const rows = useMemo(() => (Array.isArray(list) ? list.map(normalize) : []), [list]);

  if (isLoading) return <div className="text-slate-500">جاري التحميل...</div>;
  if (isError) return <div className="text-red-600">تعذر تحميل طلباتك. حاول لاحقاً.</div>;

  return (
    <div className="page-shell container max-w-7xl mx-auto px-4 space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">إدارة طلباتك</p>
          <h1 className="text-2xl font-bold text-slate-900">طلباتي</h1>
        </div>
        <Button onClick={() => nav("/requests/new")} className="bg-brand-600 text-white hover:bg-brand-700">
          طلب خدمة جديدة
        </Button>
      </div>

      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">طلباتك الحالية</h2>
          {isFetching && <span className="text-sm text-slate-500">...تحديث</span>}
        </div>

        {rows.length === 0 && <div className="text-slate-500">لا توجد طلبات بعد.</div>}

        <div className="flex flex-col gap-3">
          {rows.map((r) => (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-500">{r.city}</div>
                  <div className="font-semibold text-slate-900">{r.title}</div>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <p className="text-sm text-slate-600">{r.description}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                {r.budget && <span>الميزانية: {r.budget}</span>}
                {r.attachments?.length > 0 && <span>مرفقات: {r.attachments.length}</span>}
              </div>
              <div className="flex gap-2 text-sm">
                <Button
                  variant="ghost"
                  className="border border-slate-200 text-slate-700"
                  onClick={() => nav(`/requests/new?draft=${r.id}`, { state: { draft: r } })}
                >
                  تعديل (واجهة فقط)
                </Button>
                <Button
                  variant="ghost"
                  className="border border-red-200 text-red-600"
                  onClick={() => alert("الحذف يتطلب API backend للموافقة.")}
                >
                  حذف
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
