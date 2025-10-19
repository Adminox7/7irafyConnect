import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Api } from "../api/endpoints";
import DashboardCard from "../components/DashboardCard";
import StatusBadge from "../components/StatusBadge";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

// تحميل Recharts بشكل آمن بدون كسر التطبيق في حال عدم تثبيته
function useRecharts() {
  const [lib, setLib] = useState(null);
  useEffect(() => {
    let mounted = true;
    import("recharts")
      .then((m) => {
        if (mounted) setLib(m);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);
  return lib;
}

export default function TechDashboard(){
  const qc = useQueryClient();
  const recharts = useRecharts();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["tech-dashboard"],
    queryFn: () => Api.getTechDashboard()
  });

  const [status, setStatus] = useState("all");
  const { data: listAll = [], isLoading: isLoadingList, isError: isErrorList } = useQuery({
    queryKey: ["tech-requests", status],
    queryFn: () => Api.getTechRequests({ status })
  });

  const makeAction = (kind) => useMutation({
    mutationFn: (id) => {
      if (kind === "accept") return Api.acceptRequest(id);
      if (kind === "start") return Api.startRequest(id);
      if (kind === "complete") return Api.completeRequest(id);
      if (kind === "cancel") return Api.cancelRequest(id);
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["tech-requests"] });
      const previous = qc.getQueryData(["tech-requests", status]);
      qc.setQueryData(["tech-requests", status], (prev = []) => {
        return (prev || []).map((r) => r.id === id ? { ...r, status: kind === "accept" ? "accepted" : kind === "start" ? "in_progress" : kind === "complete" ? "done" : "cancelled" } : r);
      });
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(["tech-requests", status], ctx.previous);
      toast.error("فشل تنفيذ العملية");
    },
    onSuccess: () => {
      const msg = kind === "accept" ? "تم القبول" : kind === "start" ? "تم البدء" : kind === "complete" ? "تم الإنهاء" : "تم الإلغاء";
      toast.success(msg);
      qc.invalidateQueries({ queryKey: ["tech-dashboard"] });
      qc.invalidateQueries({ queryKey: ["tech-requests"] });
    }
  });

  const accept = makeAction("accept");
  const start = makeAction("start");
  const complete = makeAction("complete");
  const cancel = makeAction("cancel");

  if (isLoading) return <div>جارٍ التحميل…</div>;
  if (isError) return <div className="text-red-600">وقع خطأ أثناء تحميل اللوحة.</div>;

  const kpi = data?.kpi || { newC:0, accC:0, progC:0, doneC:0, revenue:0 };
  const recent = data?.recent || [];
  const weekly = data?.weekly || [];

  return (
    <div className="page-shell container max-w-7xl mx-auto px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">لوحة الحرفي</h1>
        <Link to="/" className="text-brand-700 hover:text-brand-800 underline">البحث</Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <DashboardCard title="طلبات جديدة" value={kpi.newC} />
        <DashboardCard title="مقبولة" value={kpi.accC} />
        <DashboardCard title="قيد الإنجاز" value={kpi.progC} />
        <DashboardCard title="مكتملة" value={kpi.doneC} />
        <DashboardCard title="المداخيل (درهم)" value={kpi.revenue.toFixed(0)} />
      </div>

      {/* Chart / or fallback */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm text-slate-600">الطلبات خلال 7 أيام</div>
        {recharts?.LineChart ? (
          <div className="h-64">
            <recharts.ResponsiveContainer width="100%" height="100%">
              <recharts.LineChart data={weekly}>
                <recharts.CartesianGrid strokeDasharray="3 3" />
                <recharts.XAxis dataKey="date" />
                <recharts.YAxis allowDecimals={false} />
                <recharts.Tooltip />
                <recharts.Line type="monotone" dataKey="requests" stroke="#0ea5b7" strokeWidth={2}/>
              </recharts.LineChart>
            </recharts.ResponsiveContainer>
          </div>
        ) : (
          <div className="text-slate-500 text-sm">لتفعيل الرسم البياني: <code>npm i recharts</code></div>
        )}
      </div>

      {/* Recent Requests */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm text-slate-600">آخر الطلبات</div>
        <div className="divide-y">
          {(Array.isArray(recent) ? recent : []).map(r => (
            <div key={r.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-slate-500">{r.city} • {new Date(r.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-sm">
                <StatusBadge status={r.status} />
              </div>
            </div>
          ))}
          {(Array.isArray(recent) ? recent.length === 0 : true) && <div className="text-slate-500 text-sm py-6 text-center">لا توجد طلبات بعد.</div>}
        </div>
      </div>

      {/* الفلاتر + الجدول */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm overflow-x-auto">
        <div className="mb-3 flex flex-wrap gap-2">
          {[
            { key: "all", label: "الكل" },
            { key: "new", label: "جديد" },
            { key: "accepted", label: "مقبول" },
            { key: "in_progress", label: "قيد الإنجاز" },
            { key: "done", label: "مكتمل" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setStatus(opt.key)}
              className={`px-3 py-1 rounded-full border text-sm transition ${
                status === opt.key ? "bg-black text-white border-brand-600" : "hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="mb-2 text-sm text-slate-600">كل الطلبات</div>
        {isLoadingList && <div className="text-slate-500">جارٍ التحميل…</div>}
        {isErrorList && <div className="text-red-600">تعذر تحميل الجدول.</div>}
        <table className="min-w-full text-sm">
          <thead className="text-right text-slate-500">
            <tr>
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">العنوان</th>
              <th className="py-2 pr-4">المدينة</th>
              <th className="py-2 pr-4">الحالة</th>
              <th className="py-2 pr-4">السعر (درهم)</th>
              <th className="py-2 pr-4">الزبون</th>
              <th className="py-2 pr-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(listAll) ? listAll : []).map(r => (
              <tr key={r.id} className="border-t">
                <td className="py-2 pr-4">{r.id}</td>
                <td className="py-2 pr-4">{r.title}</td>
                <td className="py-2 pr-4">{r.city}</td>
                <td className="py-2 pr-4"><StatusBadge status={r.status} /></td>
                <td className="py-2 pr-4">{r.price ?? "-"}</td>
                <td className="py-2 pr-4">{r.client}</td>
                <td className="py-2 pr-4">
                  <div className="flex flex-wrap gap-2">
                    {r.status === "new" && (
                      <>
                        <button className="px-3 py-1 rounded-full border text-xs" onClick={() => accept.mutate(r.id)}>قبول</button>
                        <button className="px-3 py-1 rounded-full border text-xs" onClick={() => cancel.mutate(r.id)}>إلغاء</button>
                      </>
                    )}
                    {r.status === "accepted" && (
                      <button className="px-3 py-1 rounded-full border text-xs" onClick={() => start.mutate(r.id)}>بدء</button>
                    )}
                    {r.status === "in_progress" && (
                      <button className="px-3 py-1 rounded-full border text-xs" onClick={() => complete.mutate(r.id)}>إنهاء</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!isLoadingList && (Array.isArray(listAll) ? listAll.length === 0 : true) && (
              <tr>
                <td colSpan="6" className="py-6 text-center text-slate-500">لا توجد بيانات</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
